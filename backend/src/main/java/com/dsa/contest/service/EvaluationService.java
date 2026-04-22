package com.dsa.contest.service;

import com.dsa.contest.model.Question;
import com.dsa.contest.model.Submission;
import com.dsa.contest.model.TestCase;
import com.dsa.contest.model.enums.SubmissionResult;
import com.dsa.contest.repository.QuestionRepository;
import com.dsa.contest.repository.SubmissionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.file.*;
import java.time.Instant;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class EvaluationService {

    private final QuestionRepository questionRepository;
    private final SubmissionRepository submissionRepository;

    public Submission evaluate(String userId, String questionId, String contestId,
                                String code, String language) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));

        int totalScore = 0;
        int totalMarks = 0;
        int passedCount = 0;

        for (TestCase tc : question.getTestCases()) {
            totalMarks += tc.getMarks();
            try {
                String output = compileAndRun(code, language, tc.getInput());
                if (output.trim().equals(tc.getExpectedOutput().trim())) {
                    totalScore += tc.getMarks();
                    passedCount++;
                }
            } catch (Exception e) {
                log.error("Execution error for test case: {}", e.getMessage());
            }
        }

        SubmissionResult result;
        if (passedCount == question.getTestCases().size()) {
            result = SubmissionResult.ACCEPTED;
        } else if (passedCount > 0) {
            result = SubmissionResult.PARTIAL;
        } else {
            result = SubmissionResult.WRONG;
        }

        Submission submission = Submission.builder()
                .userId(userId)
                .questionId(questionId)
                .contestId(contestId)
                .code(code)
                .language(language)
                .result(result)
                .score(totalScore)
                .totalMarks(totalMarks)
                .passedTestCases(passedCount)
                .totalTestCases(question.getTestCases().size())
                .submittedAt(Instant.now())
                .build();

        return submissionRepository.save(submission);
    }

    private String compileAndRun(String code, String language, String input) throws Exception {
        Path tempDir = Files.createTempDirectory("submission_");

        try {
            if ("java".equalsIgnoreCase(language)) {
                return runJava(code, input, tempDir);
            } else if ("cpp".equalsIgnoreCase(language)) {
                return runCpp(code, input, tempDir);
            } else {
                throw new RuntimeException("Unsupported language: " + language);
            }
        } finally {
            deleteDirectory(tempDir);
        }
    }

    private String runJava(String code, String input, Path tempDir) throws Exception {
        // Extract class name from code
        String className = "Main";
        int classIdx = code.indexOf("class ");
        if (classIdx != -1) {
            String after = code.substring(classIdx + 6).trim();
            className = after.split("[\\s{]")[0];
        }

        Path sourceFile = tempDir.resolve(className + ".java");
        Files.writeString(sourceFile, code);

        // Compile
        ProcessBuilder compile = new ProcessBuilder("javac", sourceFile.toString());
        compile.directory(tempDir.toFile());
        compile.redirectErrorStream(true);
        Process compileProcess = compile.start();
        String compileOutput = readStream(compileProcess.getInputStream());
        boolean compiled = compileProcess.waitFor(15, TimeUnit.SECONDS);
        if (!compiled || compileProcess.exitValue() != 0) {
            throw new RuntimeException("Compilation error: " + compileOutput);
        }

        // Run
        ProcessBuilder run = new ProcessBuilder("java", "-cp", tempDir.toString(), className);
        run.redirectErrorStream(true);
        Process runProcess = run.start();

        if (input != null && !input.isEmpty()) {
            try (OutputStream os = runProcess.getOutputStream()) {
                os.write(input.getBytes());
                os.flush();
            }
        }

        String output = readStream(runProcess.getInputStream());
        boolean finished = runProcess.waitFor(10, TimeUnit.SECONDS);
        if (!finished) {
            runProcess.destroyForcibly();
            throw new RuntimeException("Time Limit Exceeded");
        }

        return output;
    }

    private String runCpp(String code, String input, Path tempDir) throws Exception {
        Path sourceFile = tempDir.resolve("solution.cpp");
        Files.writeString(sourceFile, code);

        String exeName = System.getProperty("os.name").toLowerCase().contains("win")
                ? "solution.exe" : "solution";
        Path execFile = tempDir.resolve(exeName);

        // Compile
        ProcessBuilder compile = new ProcessBuilder("g++", "-o",
                execFile.toString(), sourceFile.toString(), "-std=c++17");
        compile.redirectErrorStream(true);
        Process compileProcess = compile.start();
        String compileOutput = readStream(compileProcess.getInputStream());
        boolean compiled = compileProcess.waitFor(15, TimeUnit.SECONDS);
        if (!compiled || compileProcess.exitValue() != 0) {
            throw new RuntimeException("Compilation error: " + compileOutput);
        }

        // Run
        ProcessBuilder run = new ProcessBuilder(execFile.toString());
        run.redirectErrorStream(true);
        Process runProcess = run.start();

        if (input != null && !input.isEmpty()) {
            try (OutputStream os = runProcess.getOutputStream()) {
                os.write(input.getBytes());
                os.flush();
            }
        }

        String output = readStream(runProcess.getInputStream());
        boolean finished = runProcess.waitFor(10, TimeUnit.SECONDS);
        if (!finished) {
            runProcess.destroyForcibly();
            throw new RuntimeException("Time Limit Exceeded");
        }

        return output;
    }

    private String readStream(InputStream is) throws IOException {
        StringBuilder sb = new StringBuilder();
        try (BufferedReader br = new BufferedReader(new InputStreamReader(is))) {
            String line;
            while ((line = br.readLine()) != null) {
                if (sb.length() > 0) sb.append("\n");
                sb.append(line);
            }
        }
        return sb.toString();
    }

    private void deleteDirectory(Path dir) {
        try {
            Files.walk(dir)
                    .sorted(java.util.Comparator.reverseOrder())
                    .map(Path::toFile)
                    .forEach(File::delete);
        } catch (IOException e) {
            log.warn("Failed to clean up temp dir: {}", dir);
        }
    }
}
