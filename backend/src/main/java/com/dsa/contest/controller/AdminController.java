package com.dsa.contest.controller;

import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.dsa.contest.dto.ContestRequest;
import com.dsa.contest.dto.QuestionRequest;
import com.dsa.contest.model.Contest;
import com.dsa.contest.model.Question;
import com.dsa.contest.model.User;
import com.dsa.contest.model.enums.Role;
import com.dsa.contest.repository.QuestionRepository;
import com.dsa.contest.repository.UserRepository;
import com.dsa.contest.service.ContestService;
import com.dsa.contest.service.TimerBroadcastService;
import com.opencsv.CSVReader;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@Slf4j
public class AdminController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ContestService contestService;
    private final QuestionRepository questionRepository;
    private final TimerBroadcastService timerBroadcastService;

    // ── User Management ──

    @PostMapping("/upload-users")
    public ResponseEntity<?> uploadUsers(@RequestParam("file") MultipartFile file) {
        List<Map<String, String>> created = new ArrayList<>();
        List<Map<String, String>> skipped = new ArrayList<>();

        try (CSVReader reader = new CSVReader(new InputStreamReader(file.getInputStream()))) {
            String[] header = reader.readNext(); // skip header
            String[] line;
            while ((line = reader.readNext()) != null) {
                if (line.length < 3) continue;
                String name = line[0].trim();
                String email = line[1].trim();
                String rollNo = line[2].trim();

                if (userRepository.existsByEmail(email)) {
                    skipped.add(Map.of("email", email, "reason", "already exists"));
                    continue;
                }

                User user = User.builder()
                        .name(name)
                        .email(email)
                        .password(passwordEncoder.encode(rollNo))
                        .role(Role.USER)
                        .warnings(0)
                        .build();
                userRepository.save(user);
                created.add(Map.of("name", name, "email", email));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to parse CSV: " + e.getMessage()));
        }

        return ResponseEntity.ok(Map.of("created", created, "skipped", skipped));
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userRepository.findAll();
        // Remove passwords from response
        users.forEach(u -> u.setPassword(null));
        return ResponseEntity.ok(users);
    }

    // ── Contest Management ──

    @PostMapping("/contests")
    public ResponseEntity<Contest> createContest(@Valid @RequestBody ContestRequest request) {
        return ResponseEntity.ok(contestService.createContest(request));
    }

    @PostMapping("/contests/{id}/start")
    public ResponseEntity<Contest> startContest(@PathVariable String id) {
        Contest contest = contestService.startContest(id);
        timerBroadcastService.notifyContestStarted(contest);
        return ResponseEntity.ok(contest);
    }

    @DeleteMapping("/contests/{id}")
    public ResponseEntity<Void> deleteContest(@PathVariable String id) {
        contestService.deleteContest(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/contests/{id}")
    public ResponseEntity<Contest> updateContest(@PathVariable String id, @Valid @RequestBody ContestRequest request) {
        return ResponseEntity.ok(contestService.updateContest(id, request));
    }

    @PostMapping("/contests/{id}/pause")
    public ResponseEntity<Contest> pauseContest(@PathVariable String id) {
        return ResponseEntity.ok(contestService.pauseContest(id));
    }

    @PostMapping("/contests/{id}/resume")
    public ResponseEntity<Contest> resumeContest(@PathVariable String id) {
        return ResponseEntity.ok(contestService.resumeContest(id));
    }

    @PostMapping("/contests/{id}/extend")
    public ResponseEntity<Contest> extendContest(@PathVariable String id, @RequestParam long additionalMinutes) {
        return ResponseEntity.ok(contestService.extendContest(id, additionalMinutes));
    }

    // ── Question Management ──

    @PostMapping("/questions")
    public ResponseEntity<Question> addQuestion(@Valid @RequestBody QuestionRequest request) {
        Question question = Question.builder()
                .contestId(request.getContestId())
                .title(request.getTitle())
                .description(request.getDescription())
                .inputFormat(request.getInputFormat())
                .outputFormat(request.getOutputFormat())
                .testCases(request.getTestCases())
                .build();
        question = questionRepository.save(question);

        // Link question to contest
        Contest contest = contestService.getContestById(request.getContestId());
        contest.getQuestionIds().add(question.getId());
        // Save through repository directly since we need to update the list
        return ResponseEntity.ok(question);
    }

    @GetMapping("/questions/{contestId}")
    public ResponseEntity<List<Question>> getQuestions(@PathVariable String contestId) {
        return ResponseEntity.ok(questionRepository.findByContestId(contestId));
    }

    @DeleteMapping("/questions/{id}")
    public ResponseEntity<?> deleteQuestion(@PathVariable String id) {
        questionRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Question deleted"));
    }
}
