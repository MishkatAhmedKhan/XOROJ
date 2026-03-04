package com.Judge_Mental.XorOJ.judge;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.FileVisitResult;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.SimpleFileVisitor;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.Objects;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicLong;

import org.springframework.stereotype.Component;

import com.Judge_Mental.XorOJ.entity.Submission.SubmissionStatus;

/**
 * Compiles and runs C++17 code locally using g++ (no Docker required).
 * <p>
 * Public API is identical to the previous Docker-based implementation so
 * {@code JudgingService} and {@code SubmissionController} need zero changes.
 */
@Component
public class CppExecutor {

    /* ------------------------------------------------------------------ */
    /*  Constants & thread pools                                          */
    /* ------------------------------------------------------------------ */

    private static final boolean IS_WINDOWS =
            System.getProperty("os.name", "").toLowerCase().contains("win");
    private static final String EXE_SUFFIX = IS_WINDOWS ? ".exe" : "";

    /** Compile timeout — generous because large TUs can be slow. */
    private static final long COMPILE_TIMEOUT_MS = 30_000;

    /** How often (ms) we sample process RSS while it runs. */
    private static final long MEM_POLL_INTERVAL_MS = 50;

    /** Daemon pool for async stream reading. */
    private static final ExecutorService STREAM_POOL =
            Executors.newCachedThreadPool(r -> {
                Thread t = new Thread(r, "cpp-exec-stream");
                t.setDaemon(true);
                return t;
            });

    static {
        Runtime.getRuntime().addShutdownHook(
                new Thread(STREAM_POOL::shutdownNow, "cpp-exec-stream-shutdown"));
    }

    /* ================================================================== */
    /*  Public data classes (unchanged signatures)                        */
    /* ================================================================== */

    public static class JudgeVerdict {
        public final SubmissionStatus status;
        public final String message;
        public final long timeUsedMillis;
        public final long memoryUsedKB;

        public JudgeVerdict(SubmissionStatus status, String message) {
            this(status, message, -1, -1);
        }

        public JudgeVerdict(SubmissionStatus status, String message,
                            long timeUsedMillis, long memoryUsedKB) {
            this.status = status;
            this.message = message;
            this.timeUsedMillis = timeUsedMillis;
            this.memoryUsedKB = memoryUsedKB;
        }
    }

    public static class RunResult {
        public final int exitCode;
        public final String stdout;
        public final String stderr;
        public final long timeUsedMillis;
        public final long memoryUsedKB;

        RunResult(int exitCode, String stdout, String stderr,
                  long timeUsedMillis, long memoryUsedKB) {
            this.exitCode = exitCode;
            this.stdout = stdout;
            this.stderr = stderr;
            this.timeUsedMillis = timeUsedMillis;
            this.memoryUsedKB = memoryUsedKB;
        }
    }

    /* ================================================================== */
    /*  Public API — execute (Run button / ad-hoc test)                   */
    /* ================================================================== */

    /**
     * Compile and run C++17 source code with the given stdin.
     * Signature is unchanged from the Docker version.
     */
    public RunResult execute(String cppSource, String stdinContent,
                             int timeLimitMs, int memoryKB,
                             double cpuCores /* ignored locally */)
            throws IOException, InterruptedException {

        Path work = Files.createTempDirectory("cpp-job-").toAbsolutePath();
        try {
            Path srcFile   = work.resolve("main.cpp");
            Path exeFile   = work.resolve("main" + EXE_SUFFIX);
            Path inputFile = work.resolve("input.txt");

            Files.writeString(srcFile, cppSource, StandardCharsets.UTF_8);
            Files.writeString(inputFile,
                    stdinContent == null ? "" : stdinContent, StandardCharsets.UTF_8);

            // 1) Compile
            RunResult compile = compile(srcFile, exeFile);
            if (compile.exitCode != 0) {
                return compile;                       // propagate CE stderr
            }

            // 2) Run
            return runExe(exeFile, inputFile, timeLimitMs, memoryKB);
        } finally {
            deleteDirQuietly(work);
        }
    }

    /* ================================================================== */
    /*  Public API — judging (compareWithGenerator / compareWithInputFile) */
    /* ================================================================== */

    /**
     * Run a generator to produce input, then judge candidate vs main solution.
     */
    public JudgeVerdict compareWithGenerator(String codePath,
                                             String mainSolutionPath,
                                             String generatorPath,
                                             long timeoutMillis,
                                             long memoryLimitKB) {
        Path workDir = null;
        try {
            if (!new File(codePath).exists()
                    || !new File(mainSolutionPath).exists()
                    || !new File(generatorPath).exists()) {
                return new JudgeVerdict(SubmissionStatus.RUNTIME_ERROR,
                        "One or more required files not found");
            }

            workDir = Files.createTempDirectory("compare-generator-");

            // Compile & run generator (no stdin) to produce test input
            Path genExe = workDir.resolve("generator" + EXE_SUFFIX);
            RunResult compileGen = compile(Path.of(generatorPath), genExe);
            if (compileGen.exitCode != 0) {
                return new JudgeVerdict(SubmissionStatus.RUNTIME_ERROR,
                        "Generator compilation failed: " + compileGen.stderr);
            }

            Path emptyInput = workDir.resolve("empty.txt");
            Files.writeString(emptyInput, "", StandardCharsets.UTF_8);

            RunResult genRun = runExe(genExe, emptyInput,
                    (int) timeoutMillis, (int) memoryLimitKB);
            if (genRun.exitCode != 0) {
                return new JudgeVerdict(SubmissionStatus.RUNTIME_ERROR,
                        "Generator failed: " + genRun.stderr,
                        genRun.timeUsedMillis, genRun.memoryUsedKB);
            }

            // Persist generated input
            Path inputPath = workDir.resolve("gen-input.txt");
            Files.writeString(inputPath, genRun.stdout, StandardCharsets.UTF_8);

            // Judge
            return judgeOnInputPaths(Path.of(codePath), Path.of(mainSolutionPath),
                    inputPath, (int) timeoutMillis, (int) memoryLimitKB);
        } catch (Exception e) {
            return new JudgeVerdict(SubmissionStatus.RUNTIME_ERROR,
                    "Error during execution: " + e.getMessage());
        } finally {
            if (workDir != null) deleteDirQuietly(workDir);
        }
    }

    /**
     * Judge candidate vs main solution on a given input file.
     */
    public JudgeVerdict compareWithInputFile(String codePath,
                                             String mainSolutionPath,
                                             String inputFilePath,
                                             long timeoutMillis,
                                             long memoryLimitKB) {
        try {
            if (!new File(codePath).exists()
                    || !new File(mainSolutionPath).exists()
                    || !new File(inputFilePath).exists()) {
                return new JudgeVerdict(SubmissionStatus.RUNTIME_ERROR,
                        "One or more required files not found");
            }

            return judgeOnInputPaths(Path.of(codePath), Path.of(mainSolutionPath),
                    Path.of(inputFilePath),
                    (int) timeoutMillis, (int) memoryLimitKB);
        } catch (Exception e) {
            return new JudgeVerdict(SubmissionStatus.RUNTIME_ERROR,
                    "Error during execution: " + e.getMessage());
        }
    }

    /* ================================================================== */
    /*  Unified judging core                                              */
    /* ================================================================== */

    private JudgeVerdict judgeOnInputPaths(Path candidate, Path mainSolution,
                                           Path inputPath, int timeLimitMs,
                                           int memoryKB)
            throws IOException, InterruptedException {

        Path workDir = Files.createTempDirectory("judge-io-");
        try {
            // Compile main solution
            Path mainExe = workDir.resolve("main-solution" + EXE_SUFFIX);
            RunResult compileMain = compile(mainSolution, mainExe);
            if (compileMain.exitCode != 0) {
                return classifyNonZero("Main solution", compileMain, timeLimitMs, memoryKB);
            }

            // Run main solution to get expected output
            RunResult mainRun = runExe(mainExe, inputPath, timeLimitMs, memoryKB);
            if (mainRun.exitCode != 0) {
                return classifyNonZero("Main solution", mainRun, timeLimitMs, memoryKB);
            }
            String expected = mainRun.stdout.trim();

            // Compile candidate
            Path candExe = workDir.resolve("candidate" + EXE_SUFFIX);
            RunResult compileCand = compile(candidate, candExe);
            if (compileCand.exitCode != 0) {
                return classifyNonZero("Submission", compileCand, timeLimitMs, memoryKB);
            }

            // Run candidate
            RunResult candRun = runExe(candExe, inputPath, timeLimitMs, memoryKB);
            if (candRun.exitCode != 0) {
                return classifyNonZero("Submission", candRun, timeLimitMs, memoryKB);
            }

            String actual = candRun.stdout.trim();
            if (Objects.equals(actual, expected)) {
                return new JudgeVerdict(SubmissionStatus.ACCEPTED,
                        "Time: " + candRun.timeUsedMillis + "ms, Memory: "
                                + candRun.memoryUsedKB + "KB",
                        candRun.timeUsedMillis, candRun.memoryUsedKB);
            } else {
                return new JudgeVerdict(SubmissionStatus.WRONG_ANSWER,
                        "Expected output and actual output differ",
                        candRun.timeUsedMillis, candRun.memoryUsedKB);
            }
        } finally {
            deleteDirQuietly(workDir);
        }
    }

    /* ================================================================== */
    /*  Verdict classification (same logic, no Docker exit-code deps)     */
    /* ================================================================== */

    private JudgeVerdict classifyNonZero(String who, RunResult r,
                                         long timeoutMs, long memoryKB) {
        // 1) Compilation error — no timing info and compiler markers in stderr
        if ((r.timeUsedMillis < 0 && r.memoryUsedKB < 0)
                && hasCompileMarkers(r.stderr)) {
            return new JudgeVerdict(SubmissionStatus.COMPILATION_ERROR,
                    who + " compilation failed:\n" + firstLines(r.stderr, 40),
                    r.timeUsedMillis, r.memoryUsedKB);
        }

        // 2) Time limit exceeded (exit 124 = our synthetic code, or measured time)
        if (r.exitCode == 124
                || (r.timeUsedMillis >= 0 && r.timeUsedMillis >= timeoutMs)) {
            return new JudgeVerdict(SubmissionStatus.TIME_LIMIT_EXCEEDED,
                    who + " time limit exceeded: " + timeoutMs + "ms",
                    r.timeUsedMillis, r.memoryUsedKB);
        }

        // 3) Memory limit exceeded (exit 137 = our synthetic code, or measured mem)
        if (r.exitCode == 137
                || (r.memoryUsedKB >= 0 && r.memoryUsedKB >= memoryKB)) {
            return new JudgeVerdict(SubmissionStatus.MEMORY_LIMIT_EXCEEDED,
                    who + " memory limit exceeded: " + memoryKB + "KB",
                    r.timeUsedMillis, r.memoryUsedKB);
        }

        // 4) Generic runtime error
        return new JudgeVerdict(SubmissionStatus.RUNTIME_ERROR,
                who + " runtime error: "
                        + (r.stderr.isBlank() ? ("exitCode=" + r.exitCode) : r.stderr),
                r.timeUsedMillis, r.memoryUsedKB);
    }

    /* ================================================================== */
    /*  Compile helper                                                    */
    /* ================================================================== */

    /**
     * Compile a single .cpp file to an executable.
     * Returns a RunResult with exitCode 0 on success;
     * non-zero with stderr containing compiler diagnostics on failure.
     * timeUsedMillis/memoryUsedKB are set to -1 (not applicable).
     */
    private RunResult compile(Path sourceFile, Path outputExe)
            throws IOException, InterruptedException {

        ProcessBuilder pb = new ProcessBuilder(
                "g++", "-O2", "-std=c++17",
                sourceFile.toAbsolutePath().toString(),
                "-o", outputExe.toAbsolutePath().toString());
        pb.redirectErrorStream(false);

        Process p = pb.start();
        CompletableFuture<String> outF = readAsync(p.getInputStream());
        CompletableFuture<String> errF = readAsync(p.getErrorStream());

        boolean finished = p.waitFor(COMPILE_TIMEOUT_MS, TimeUnit.MILLISECONDS);
        if (!finished) {
            p.destroyForcibly();
            return new RunResult(1, "", "Compilation timed out", -1, -1);
        }

        String out = safeGet(outF);
        String err = safeGet(errF);
        return new RunResult(p.exitValue(), out, err, -1, -1);
    }

    /* ================================================================== */
    /*  Run helper (with time + memory monitoring)                        */
    /* ================================================================== */

    /**
     * Run a compiled executable, feeding stdin from {@code inputFile}.
     * <ul>
     *   <li>Time is measured with {@code System.nanoTime()}.</li>
     *   <li>Memory (peak RSS) is polled via {@code tasklist} (Windows)
     *       or {@code /proc/pid/status} (Linux).</li>
     *   <li>Timeout triggers exit code 124; memory overshoot triggers 137.</li>
     * </ul>
     */
    private RunResult runExe(Path exe, Path inputFile,
                             int timeLimitMs, int memoryLimitKB)
            throws IOException, InterruptedException {

        ProcessBuilder pb = new ProcessBuilder(exe.toAbsolutePath().toString());
        pb.redirectInput(inputFile.toFile());
        pb.redirectErrorStream(false);

        long startNanos = System.nanoTime();
        Process p = pb.start();
        long pid = p.pid();

        // --- background memory sampler ---
        AtomicLong peakMemKB = new AtomicLong(0);
        ScheduledExecutorService memMonitor =
                Executors.newSingleThreadScheduledExecutor(r -> {
                    Thread t = new Thread(r, "mem-monitor-" + pid);
                    t.setDaemon(true);
                    return t;
                });
        memMonitor.scheduleAtFixedRate(() -> {
            long mem = queryProcessMemoryKB(pid);
            if (mem > 0) peakMemKB.accumulateAndGet(mem, Math::max);
        }, 0, MEM_POLL_INTERVAL_MS, TimeUnit.MILLISECONDS);

        CompletableFuture<String> outF = readAsync(p.getInputStream());
        CompletableFuture<String> errF = readAsync(p.getErrorStream());

        // Generous hard-cap: timeLimitMs + 2 s buffer for OS scheduling jitter
        boolean finished = p.waitFor(timeLimitMs + 2_000L, TimeUnit.MILLISECONDS);
        long elapsedMs = (System.nanoTime() - startNanos) / 1_000_000;

        memMonitor.shutdownNow();

        if (!finished) {
            p.destroyForcibly();
            p.waitFor(1, TimeUnit.SECONDS);
            String out = safeGet(outF);
            return new RunResult(124, out, "Time limit exceeded",
                    elapsedMs, peakMemKB.get());
        }

        String out = safeGet(outF);
        String err = safeGet(errF);
        long memKB = peakMemKB.get();

        // Check if measured memory exceeded limit
        if (memoryLimitKB > 0 && memKB > memoryLimitKB) {
            return new RunResult(137, out,
                    "Memory limit exceeded: " + memKB + "KB > " + memoryLimitKB + "KB",
                    elapsedMs, memKB);
        }

        return new RunResult(p.exitValue(), out, err, elapsedMs, memKB);
    }

    /* ================================================================== */
    /*  Memory sampling (cross-platform)                                  */
    /* ================================================================== */

    /**
     * Best-effort query for the working-set size of a running process.
     * <ul>
     *   <li><b>Windows:</b> {@code tasklist /FI "PID eq …" /FO CSV /NH}</li>
     *   <li><b>Linux:</b>   reads {@code VmRSS} from {@code /proc/pid/status}</li>
     * </ul>
     * Returns 0 if the process has already exited or measurement fails.
     */
    private static long queryProcessMemoryKB(long pid) {
        try {
            if (IS_WINDOWS) {
                Process p = new ProcessBuilder(
                        "tasklist", "/FI", "PID eq " + pid, "/FO", "CSV", "/NH")
                        .redirectErrorStream(true)
                        .start();
                String output = new String(
                        p.getInputStream().readAllBytes(), StandardCharsets.UTF_8).trim();
                p.waitFor(2, TimeUnit.SECONDS);

                if (output.isEmpty() || output.contains("No tasks")) return 0;

                // CSV line example:  "main.exe","1234","Console","1","12,345 K"
                // Split on ","  — the memory value is inside the last quoted field.
                String[] parts = output.split("\"");
                for (int i = parts.length - 1; i >= 0; i--) {
                    String part = parts[i].trim();
                    if (part.toUpperCase().endsWith("K")) {
                        String num = part.replaceAll("[^0-9]", "");
                        if (!num.isEmpty()) return Long.parseLong(num);
                    }
                }
            } else {
                // Linux: /proc/<pid>/status → VmRSS: <value> kB
                Path statusFile = Path.of("/proc/" + pid + "/status");
                if (Files.exists(statusFile)) {
                    for (String line : Files.readAllLines(statusFile)) {
                        if (line.startsWith("VmRSS:")) {
                            String num = line.replaceAll("[^0-9]", "");
                            if (!num.isEmpty()) return Long.parseLong(num);
                        }
                    }
                }
            }
        } catch (Exception ignored) {
            // Process may have exited between check and query — harmless.
        }
        return 0;
    }

    /* ================================================================== */
    /*  Shared helpers                                                    */
    /* ================================================================== */

    private static boolean hasCompileMarkers(String err) {
        if (err == null) return false;
        String e = err.toLowerCase();
        return e.contains("error:")
                || e.contains("fatal error:")
                || e.contains("g++: ")
                || e.contains("collect2: error")
                || e.contains("undefined reference to")
                || e.contains("multiple definition of")
                || e.contains("ld: ");
    }

    private static String firstLines(String s, int maxLines) {
        if (s == null || s.isEmpty()) return "";
        String[] lines = s.split("\\R");
        StringBuilder sb = new StringBuilder();
        int n = Math.min(maxLines, lines.length);
        for (int i = 0; i < n; i++) sb.append(lines[i]).append('\n');
        if (lines.length > maxLines) sb.append("... (truncated)");
        return sb.toString().trim();
    }

    private static CompletableFuture<String> readAsync(InputStream in) {
        return CompletableFuture.supplyAsync(() -> {
            try (in) {
                return new String(in.readAllBytes(), StandardCharsets.UTF_8);
            } catch (IOException e) {
                return "";
            }
        }, STREAM_POOL);
    }

    private static String safeGet(CompletableFuture<String> f) {
        try {
            String v = f.get(3, TimeUnit.SECONDS);
            return v == null ? "" : v;
        } catch (Exception e) {
            return "";
        }
    }

    /** Best-effort recursive delete of a temp directory. */
    private static void deleteDirQuietly(Path dir) {
        if (dir == null) return;
        try {
            Files.walkFileTree(dir, new SimpleFileVisitor<>() {
                @Override
                public FileVisitResult visitFile(Path file, BasicFileAttributes attrs)
                        throws IOException {
                    Files.deleteIfExists(file);
                    return FileVisitResult.CONTINUE;
                }
                @Override
                public FileVisitResult postVisitDirectory(Path d, IOException exc)
                        throws IOException {
                    Files.deleteIfExists(d);
                    return FileVisitResult.CONTINUE;
                }
            });
        } catch (IOException ignored) {}
    }
}
