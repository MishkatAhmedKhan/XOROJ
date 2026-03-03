package com.Judge_Mental.XorOJ.judge;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.concurrent.*;

import org.springframework.stereotype.Component;

import com.Judge_Mental.XorOJ.entity.Submission.SubmissionStatus;

@Component
public class CppExecutor {

    private static final String DOCKER_IMAGE = "gcc-time:13";
    private static final String TIME_FMT = "TIME_USED_MS=%e\\nMEM_USED_KB=%M";
    private static final int DEFAULT_PIDS_LIMIT = 256;

    /** Pooled daemon threads for stream reading; prevents thread leaks. */
    private static final ExecutorService STREAM_POOL = Executors.newCachedThreadPool(r -> {
        Thread t = new Thread(r, "cpp-exec-stream");
        t.setDaemon(true);
        return t;
    });

    static {
        // Cleanly shut down on JVM exit
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            STREAM_POOL.shutdownNow();
        }, "cpp-exec-stream-shutdown"));
    }

    /** Immutable process spec so the container name always travels with the command. */
    private static final class ProcSpec {
        final List<String> command;
        final String containerName;
        ProcSpec(List<String> command, String containerName) {
            this.command = command;
            this.containerName = containerName;
        }
    }

    public static class JudgeVerdict {
        public final SubmissionStatus status;
        public final String message;
        public final long timeUsedMillis;
        public final long memoryUsedKB;

        public JudgeVerdict(SubmissionStatus status, String message) {
            this(status, message, -1, -1);
        }

        public JudgeVerdict(SubmissionStatus status, String message, long timeUsedMillis, long memoryUsedKB) {
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

        RunResult(int exitCode, String stdout, String stderr, long timeUsedMillis, long memoryUsedKB) {
            this.exitCode = exitCode;
            this.stdout = stdout;
            this.stderr = stderr;
            this.timeUsedMillis = timeUsedMillis;
            this.memoryUsedKB = memoryUsedKB;
        }
    }

    /**
     * Compile and run C++17 source inside Docker (gcc:13), using a mounted input file (Option A).
     */
    public RunResult execute(String cppSource, String stdinContent,
                             int timeLimitMs, int memoryKB, double cpuCores) throws IOException, InterruptedException {

        // 1) Isolated sandbox directories
        Path work = Files.createTempDirectory("cpp-job-").toAbsolutePath();
        Path srcDir = work.resolve("src");
        Path binDir = work.resolve("bin");
        Files.createDirectories(srcDir);
        Files.createDirectories(binDir);

        // 2) Files
        Path mainCpp = srcDir.resolve("main.cpp");
        Files.writeString(mainCpp, cppSource, StandardCharsets.UTF_8);

        Path inputTxt = srcDir.resolve("input.txt");
        Files.writeString(inputTxt, stdinContent == null ? "" : stdinContent, StandardCharsets.UTF_8);

        // 3) Build & run (input file mounted and redirected inside container)
        ProcSpec spec = buildCompileRunSpec(
                mainCpp,          // source file
                binDir,           // /out mount
                inputTxt,         // input file to mount and redirect from
                timeLimitMs,
                memoryKB,
                cpuCores
        );

        // Give a small buffer for compile cost
        return runProcess(spec, timeLimitMs + 10_000L);
    }

    /* ===================== Public judging APIs ===================== */

    /**
     * Compare output of source code with generator + main solution (Option A).
     */
    public JudgeVerdict compareWithGenerator(String codePath, String mainSolutionPath, String generatorPath,
                                             long timeoutMillis, long memoryLimitKB) {
        try {
            if (!new File(codePath).exists() || !new File(mainSolutionPath).exists() || !new File(generatorPath).exists()) {
                return new JudgeVerdict(SubmissionStatus.RUNTIME_ERROR, "One or more required files not found");
            }

            Path codeFilePath = Path.of(codePath);
            Path mainFilePath = Path.of(mainSolutionPath);
            Path genFilePath  = Path.of(generatorPath);

            Path workDir = Files.createTempDirectory("compare-generator-");
            Path outDir  = workDir.resolve("out");
            Files.createDirectories(outDir);

            // 1) Run generator (no input), capture stdout and persist as input file
            ProcSpec genSpec = buildCompileRunSpec(
                    genFilePath,
                    outDir,
                    null,
                    (int) timeoutMillis,
                    (int) memoryLimitKB,
                    1.0
            );
            RunResult gen = runProcess(genSpec, timeoutMillis);
            if (gen.exitCode != 0) {
                return new JudgeVerdict(SubmissionStatus.RUNTIME_ERROR, "Generator failed: " + gen.stderr, gen.timeUsedMillis, gen.memoryUsedKB);
            }

            Path inputPath = Files.createTempFile(workDir, "input-", ".txt");
            Files.writeString(inputPath, gen.stdout, StandardCharsets.UTF_8);

            // 2) Judge both solutions on the generated input
            return judgeOnInputPaths(codeFilePath, mainFilePath, inputPath, (int) timeoutMillis, (int) memoryLimitKB, 1.0);
        } catch (Exception e) {
            return new JudgeVerdict(SubmissionStatus.RUNTIME_ERROR, "Error during execution: " + e.getMessage());
        }
    }

    /**
     * Compare output of source code vs main solution on a provided input file (Option A).
     */
    public JudgeVerdict compareWithInputFile(String codePath, String mainSolutionPath, String inputFilePath,
                                             long timeoutMillis, long memoryLimitKB) {
        try {
            if (!new File(codePath).exists() || !new File(mainSolutionPath).exists() || !new File(inputFilePath).exists()) {
                return new JudgeVerdict(SubmissionStatus.RUNTIME_ERROR, "One or more required files not found");
            }

            Path codeFilePath = Path.of(codePath);
            Path mainFilePath = Path.of(mainSolutionPath);
            Path inputPath    = Path.of(inputFilePath);

            // Unified judging core
            return judgeOnInputPaths(codeFilePath, mainFilePath, inputPath, (int) timeoutMillis, (int) memoryLimitKB, 1.0);
        } catch (Exception e) {
            return new JudgeVerdict(SubmissionStatus.RUNTIME_ERROR, "Error during execution: " + e.getMessage());
        }
    }

    /* ===================== Unified judging core ===================== */

    private JudgeVerdict judgeOnInputPaths(Path candidate, Path mainSolution, Path inputPath,
                                           int timeLimitMs, int memoryKB, double cpuCores) throws IOException, InterruptedException {

        Path workDir = Files.createTempDirectory("judge-io-");
        Path outDir  = workDir.resolve("out");
        Files.createDirectories(outDir);

        // Run main to get expected
        RunResult main = runProcess(
                buildCompileRunSpec(mainSolution, outDir, inputPath, timeLimitMs, memoryKB, cpuCores),
                timeLimitMs + 5_000L
        );
        if (main.exitCode != 0) {
            return classifyNonZero("Main solution", main, timeLimitMs, memoryKB);
        }
        String expected = main.stdout.trim();

        // Run candidate
        RunResult cand = runProcess(
                buildCompileRunSpec(candidate, outDir, inputPath, timeLimitMs, memoryKB, cpuCores),
                timeLimitMs + 5_000L
        );

        if (cand.exitCode != 0) {
            return classifyNonZero("Submission", cand, timeLimitMs, memoryKB);
        }

        String actual = cand.stdout.trim();
        if (Objects.equals(actual, expected)) {
            return new JudgeVerdict(SubmissionStatus.ACCEPTED,
                    "Time: " + cand.timeUsedMillis + "ms, Memory: " + cand.memoryUsedKB + "KB",
                    cand.timeUsedMillis, cand.memoryUsedKB);
        } else {
            return new JudgeVerdict(SubmissionStatus.WRONG_ANSWER,
                    "Expected output and actual output differ",
                    cand.timeUsedMillis, cand.memoryUsedKB);
        }
    }

    private JudgeVerdict classifyNonZero(String who, RunResult r, long timeoutMs, long memoryKB) {
        // 1) Compilation / Linker error: no timing info (time/mem < 0) and compiler markers in stderr
        if ((r.timeUsedMillis < 0 && r.memoryUsedKB < 0) && hasCompileMarkers(r.stderr)) {
            String snippet = firstLines(r.stderr, 40); // keep the message short
            return new JudgeVerdict(
                    SubmissionStatus.COMPILATION_ERROR,        // <-- ensure this exists in your enum
                    who + " compilation failed:\n" + snippet,
                    r.timeUsedMillis, r.memoryUsedKB
            );
        }

        // 2) Time limit exceeded
        if (r.exitCode == 124 || (r.timeUsedMillis >= 0 && r.timeUsedMillis >= timeoutMs)) {
            return new JudgeVerdict(
                    SubmissionStatus.TIME_LIMIT_EXCEEDED,
                    who + " time limit exceeded: " + timeoutMs + "ms",
                    r.timeUsedMillis, r.memoryUsedKB
            );
        }

        // 3) Memory limit exceeded (common: 137/SIGKILL or 'Killed')
        if (r.exitCode == 137 || r.stderr.contains("Killed")) {
            return new JudgeVerdict(
                    SubmissionStatus.MEMORY_LIMIT_EXCEEDED,
                    who + " memory limit exceeded: " + memoryKB + "KB",
                    r.timeUsedMillis, r.memoryUsedKB
            );
        }

        // 4) Heuristic backup using measured RSS
        if (r.memoryUsedKB >= 0 && r.memoryUsedKB >= memoryKB) {
            return new JudgeVerdict(
                    SubmissionStatus.MEMORY_LIMIT_EXCEEDED,
                    who + " memory usage " + r.memoryUsedKB + "KB exceeded limit " + memoryKB + "KB",
                    r.timeUsedMillis, r.memoryUsedKB
            );
        }

        // 5) Generic runtime error
        return new JudgeVerdict(
                SubmissionStatus.RUNTIME_ERROR,
                who + " runtime error: " + (r.stderr.isBlank() ? ("exitCode=" + r.exitCode) : r.stderr),
                r.timeUsedMillis, r.memoryUsedKB
        );
    }


    /* ===================== Internal helpers ===================== */

    private static boolean hasCompileMarkers(String err) {
        if (err == null) return false;
        String e = err.toLowerCase();
        return  e.contains("error:") ||                 // gcc/g++ diagnostics
                e.contains("fatal error:") ||
                e.contains("g++: ") ||                  // driver messages
                e.contains("collect2: error") ||        // linker wrapper
                e.contains("undefined reference to") || // linker errors
                e.contains("multiple definition of") ||
                e.contains("ld: ");                     // ld messages
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


    private ProcSpec buildCompileRunSpec(Path sourceFile,
                                         Path outDir,
                                         Path inputFileOrNull, // nullable
                                         int timeLimitMs,
                                         int memoryKB,
                                         double cpuCores) throws IOException {

        Files.createDirectories(outDir);

        Path sourceParent = sourceFile.toAbsolutePath().getParent();
        String srcMount   = toDockerMountPath(sourceParent);
        String srcName    = sourceFile.getFileName().toString();
        String binMount   = toDockerMountPath(outDir.toAbsolutePath());

        String containerName = "cpp-job-" + System.nanoTime();
        int timeLimitSeconds = (int) Math.ceil(timeLimitMs / 1000.0);
        int memoryMB         = (int) Math.ceil(memoryKB / 1024.0);

        List<String> cmd = new ArrayList<>();
        cmd.add("docker"); cmd.add("run"); cmd.add("--rm");
        cmd.add("--name"); cmd.add(containerName);
        cmd.add("--network"); cmd.add("none");
        cmd.add("--cpus=" + cpuCores);
        cmd.add("-m"); cmd.add(memoryMB + "m");
        cmd.add("--pids-limit"); cmd.add(String.valueOf(DEFAULT_PIDS_LIMIT));
        cmd.add("--read-only");
        cmd.add("-v"); cmd.add(srcMount + ":/work:ro");
        cmd.add("-v"); cmd.add(binMount + ":/out:rw");

        String runLine;
        if (inputFileOrNull != null) {
            String inputMount = toDockerMountPath(inputFileOrNull.toAbsolutePath().getParent());
            String inputName  = inputFileOrNull.getFileName().toString();
            cmd.add("-v"); cmd.add(inputMount + ":/input:ro");
            runLine = "g++ -O2 -std=c++17 /work/" + srcName + " -o /out/main && " +
                      "/usr/bin/time -f '" + TIME_FMT + "' timeout " + timeLimitSeconds + "s /out/main < /input/" + inputName;
        } else {
            runLine = "g++ -O2 -std=c++17 /work/" + srcName + " -o /out/main && " +
                      "/usr/bin/time -f '" + TIME_FMT + "' timeout " + timeLimitSeconds + "s /out/main";
        }

        cmd.add("--tmpfs"); cmd.add("/tmp:rw,noexec,nosuid,size=64m");
        cmd.add(DOCKER_IMAGE);
        cmd.add("bash"); cmd.add("-lc");
        cmd.add(runLine);

        return new ProcSpec(cmd, containerName);
    }

    private RunResult runProcess(ProcSpec spec, long timeoutMillis) throws IOException, InterruptedException {
        ProcessBuilder pb = new ProcessBuilder(spec.command);
        pb.redirectErrorStream(false);
        Process p = pb.start();

        CompletableFuture<String> outF = readAsync(p.getInputStream());
        CompletableFuture<String> errF = readAsync(p.getErrorStream());

        boolean finished = p.waitFor(timeoutMillis, TimeUnit.MILLISECONDS);
        if (!finished) {
            p.destroyForcibly();
            bestEffortKillContainer(spec.containerName);

            String out = getFuture(outF, Duration.ofMillis(200));
            return new RunResult(124, out == null ? "" : out, "Runner timed out (hard cap).", -1, -1);
        }

        int code = p.exitValue();
        String out = getFuture(outF, Duration.ofSeconds(1));
        String err = getFuture(errF, Duration.ofSeconds(1));
        if (out == null) out = "";
        if (err == null) err = "";

        ParsedUsage usage = parseUsageAndStrip(err);
        return new RunResult(code, out, usage.cleanStderr.trim(), usage.timeMs, usage.memKB);
    }

    private static void bestEffortKillContainer(String name) {
        if (name == null || name.isBlank()) return;
        try {
            new ProcessBuilder("docker", "rm", "-f", name)
                    .redirectErrorStream(true)
                    .start()
                    .waitFor(3, TimeUnit.SECONDS);
        } catch (Exception ignored) {}
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

    private static String getFuture(CompletableFuture<String> f, Duration timeout) {
        try {
            return f.get(timeout.toMillis(), TimeUnit.MILLISECONDS);
        } catch (Exception e) {
            return null;
        }
    }

    private static String toDockerMountPath(Path p) {
        String raw = p.isAbsolute() ? p.toString() : p.toAbsolutePath().toString();
        return raw.replace('\\', '/');
    }

    /* ---------- stderr parsing for /usr/bin/time output ---------- */

    private static final class ParsedUsage {
        final long timeMs;
        final long memKB;
        final String cleanStderr;
        ParsedUsage(long timeMs, long memKB, String cleanStderr) {
            this.timeMs = timeMs;
            this.memKB = memKB;
            this.cleanStderr = cleanStderr;
        }
    }

    private static ParsedUsage parseUsageAndStrip(String stderr) {
        long timeMs = -1;
        long memKB  = -1;
        StringBuilder other = new StringBuilder();
        for (String line : stderr.split("\\R")) {
            if (line.startsWith("TIME_USED_MS=")) {
                try {
                    double secs = Double.parseDouble(line.substring("TIME_USED_MS=".length()));
                    timeMs = (long) Math.round(secs * 1000.0);
                } catch (NumberFormatException ignored) {}
            } else if (line.startsWith("MEM_USED_KB=")) {
                try {
                    memKB = Long.parseLong(line.substring("MEM_USED_KB=".length()));
                } catch (NumberFormatException ignored) {}
            } else {
                other.append(line).append('\n');
            }
        }
        return new ParsedUsage(timeMs, memKB, other.toString());
    }
}
