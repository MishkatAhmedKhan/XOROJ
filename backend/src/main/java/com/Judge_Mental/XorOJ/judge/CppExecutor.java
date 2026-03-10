package com.Judge_Mental.XorOJ.judge;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.Objects;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicLong;

import org.springframework.stereotype.Component;

import com.Judge_Mental.XorOJ.entity.Submission.SubmissionStatus;

@Component
public class CppExecutor {

    private static final boolean IS_WINDOWS =
            System.getProperty("os.name").toLowerCase().contains("win");

    private static final String EXE_SUFFIX = IS_WINDOWS ? ".exe" : "";

    private static final long COMPILE_TIMEOUT = 30000;

    private static final ExecutorService STREAM_POOL =
            Executors.newCachedThreadPool();

    public static class JudgeVerdict {

        public final SubmissionStatus status;
        public final String message;
        public final long timeUsedMillis;
        public final long memoryUsedKB;

        public JudgeVerdict(
                SubmissionStatus status,
                String message,
                long time,
                long memory
        ) {
            this.status = status;
            this.message = message;
            this.timeUsedMillis = time;
            this.memoryUsedKB = memory;
        }
    }

    public static class RunResult {

        public final int exitCode;
        public final String stdout;
        public final String stderr;
        public final long timeUsedMillis;
        public final long memoryUsedKB;

        public RunResult(
                int exitCode,
                String stdout,
                String stderr,
                long time,
                long memory
        ) {
            this.exitCode = exitCode;
            this.stdout = stdout;
            this.stderr = stderr;
            this.timeUsedMillis = time;
            this.memoryUsedKB = memory;
        }
    }

    public RunResult execute(
            String cppSource,
            String stdinContent,
            int timeLimitMs,
            int memoryKB,
            double cpu
    ) throws IOException, InterruptedException {

        Path dir = Files.createTempDirectory("cpp-exec");

        try {

            Path src = dir.resolve("main.cpp");
            Path exe = dir.resolve("main" + EXE_SUFFIX);
            Path input = dir.resolve("input.txt");

            Files.writeString(src, cppSource);
            Files.writeString(input, stdinContent == null ? "" : stdinContent);

            RunResult compile = compile(src, exe);

            if (compile.exitCode != 0)
                return compile;

            return runExe(exe, input, timeLimitMs, memoryKB);

        } finally {
            deleteDir(dir);
        }
    }

    public RunResult compileSource(
            Path sourceFile,
            Path outputExe
    ) throws IOException, InterruptedException {

        return compile(sourceFile, outputExe);
    }

    public JudgeVerdict compareWithInputFile(
            String codePath,
            String mainSolutionPath,
            String inputFile,
            long timeout,
            long memory
    ) {

        try {

            Path work = Files.createTempDirectory("judge");

            Path mainExe = work.resolve("main" + EXE_SUFFIX);
            Path candExe = work.resolve("candidate" + EXE_SUFFIX);

            RunResult c1 = compile(Path.of(mainSolutionPath), mainExe);

            if (c1.exitCode != 0)
                return new JudgeVerdict(
                        SubmissionStatus.RUNTIME_ERROR,
                        "Main solution compilation failed",
                        -1,
                        -1
                );

            RunResult c2 = compile(Path.of(codePath), candExe);

            if (c2.exitCode != 0)
                return new JudgeVerdict(
                        SubmissionStatus.COMPILATION_ERROR,
                        c2.stderr,
                        -1,
                        -1
                );

            return judgeWithPrecompiledExes(
                    mainExe,
                    candExe,
                    Path.of(inputFile),
                    (int) timeout,
                    (int) memory
            );

        } catch (Exception e) {

            return new JudgeVerdict(
                    SubmissionStatus.RUNTIME_ERROR,
                    e.getMessage(),
                    -1,
                    -1
            );
        }
    }

    public JudgeVerdict compareWithGenerator(
            String codePath,
            String mainSolution,
            String generator,
            long timeout,
            long memory
    ) {

        try {

            Path work = Files.createTempDirectory("judge");

            Path genExe = work.resolve("generator" + EXE_SUFFIX);

            RunResult cg = compile(Path.of(generator), genExe);

            if (cg.exitCode != 0)
                return new JudgeVerdict(
                        SubmissionStatus.RUNTIME_ERROR,
                        "Generator compile error",
                        -1,
                        -1
                );

            Path empty = work.resolve("empty.txt");
            Files.writeString(empty, "");

            RunResult gen = runExe(genExe, empty, (int) timeout, (int) memory);

            Path input = work.resolve("input.txt");
            Files.writeString(input, gen.stdout);

            return compareWithInputFile(
                    codePath,
                    mainSolution,
                    input.toString(),
                    timeout,
                    memory
            );

        } catch (Exception e) {

            return new JudgeVerdict(
                    SubmissionStatus.RUNTIME_ERROR,
                    e.getMessage(),
                    -1,
                    -1
            );
        }
    }

    public JudgeVerdict judgeWithPrecompiledExes(
            Path mainExe,
            Path candExe,
            Path input,
            int timeLimit,
            int memoryLimit
    ) throws IOException, InterruptedException {

        RunResult expected =
                runExe(mainExe, input, timeLimit, memoryLimit);

        if (expected.exitCode != 0)
            return new JudgeVerdict(
                    SubmissionStatus.RUNTIME_ERROR,
                    "Main solution failed",
                    expected.timeUsedMillis,
                    expected.memoryUsedKB
            );

        RunResult actual =
                runExe(candExe, input, timeLimit, memoryLimit);

        if (actual.exitCode != 0)
            return new JudgeVerdict(
                    SubmissionStatus.RUNTIME_ERROR,
                    actual.stderr,
                    actual.timeUsedMillis,
                    actual.memoryUsedKB
            );

        if (Objects.equals(
                expected.stdout.trim(),
                actual.stdout.trim()
        )) {

            return new JudgeVerdict(
                    SubmissionStatus.ACCEPTED,
                    "Accepted",
                    actual.timeUsedMillis,
                    actual.memoryUsedKB
            );
        }

        return new JudgeVerdict(
                SubmissionStatus.WRONG_ANSWER,
                "Output mismatch",
                actual.timeUsedMillis,
                actual.memoryUsedKB
        );
    }

    private RunResult compile(
            Path src,
            Path exe
    ) throws IOException, InterruptedException {

        ProcessBuilder pb = new ProcessBuilder(
                "g++",
                "-O2",
                "-std=c++17",
                src.toString(),
                "-o",
                exe.toString()
        );

        Process p = pb.start();

        CompletableFuture<String> out = readAsync(p.getInputStream());
        CompletableFuture<String> err = readAsync(p.getErrorStream());

        boolean done =
                p.waitFor(COMPILE_TIMEOUT, TimeUnit.MILLISECONDS);

        if (!done) {
            p.destroyForcibly();
            return new RunResult(1, "", "Compile timeout", -1, -1);
        }

        return new RunResult(
                p.exitValue(),
                out.join(),
                err.join(),
                -1,
                -1
        );
    }

    private RunResult runExe(
            Path exe,
            Path input,
            int timeLimit,
            int memoryLimit
    ) throws IOException, InterruptedException {

        ProcessBuilder pb =
                new ProcessBuilder(exe.toAbsolutePath().toString());

        pb.redirectInput(input.toFile());

        long start = System.nanoTime();

        Process p = pb.start();

        CompletableFuture<String> out = readAsync(p.getInputStream());
        CompletableFuture<String> err = readAsync(p.getErrorStream());

        boolean done =
                p.waitFor(timeLimit + 2000, TimeUnit.MILLISECONDS);

        long time =
                (System.nanoTime() - start) / 1_000_000;

        if (!done) {

            p.destroyForcibly();

            return new RunResult(
                    124,
                    "",
                    "Time limit exceeded",
                    time,
                    0
            );
        }

        return new RunResult(
                p.exitValue(),
                out.join(),
                err.join(),
                time,
                queryMemory(p.pid())
        );
    }

    private static CompletableFuture<String> readAsync(InputStream in) {

        return CompletableFuture.supplyAsync(() -> {

            try (in) {

                return new String(
                        in.readAllBytes(),
                        StandardCharsets.UTF_8
                );

            } catch (IOException e) {
                return "";
            }

        }, STREAM_POOL);
    }

    private long queryMemory(long pid) {

        try {

            Path status =
                    Path.of("/proc/" + pid + "/status");

            if (!Files.exists(status))
                return 0;

            for (String line : Files.readAllLines(status)) {

                if (line.startsWith("VmRSS:")) {

                    String num =
                            line.replaceAll("[^0-9]", "");

                    return Long.parseLong(num);
                }
            }

        } catch (Exception ignored) {
        }

        return 0;
    }

    private void deleteDir(Path dir) {

        try {

            Files.walk(dir)
                    .sorted((a, b) -> b.compareTo(a))
                    .forEach(p -> {
                        try {
                            Files.deleteIfExists(p);
                        } catch (Exception ignored) {
                        }
                    });

        } catch (Exception ignored) {
        }
    }

    public static String getExeSuffix() {
        return EXE_SUFFIX;
    }
}