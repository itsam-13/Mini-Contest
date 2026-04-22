package com.dsa.contest.controller;

import com.dsa.contest.dto.SubmissionRequest;
import com.dsa.contest.dto.SubmissionResponse;
import com.dsa.contest.model.Contest;
import com.dsa.contest.model.Submission;
import com.dsa.contest.model.enums.ContestStatus;
import com.dsa.contest.repository.SubmissionRepository;
import com.dsa.contest.service.ContestService;
import com.dsa.contest.service.EvaluationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/submissions")
@RequiredArgsConstructor
public class SubmissionController {

    private final EvaluationService evaluationService;
    private final ContestService contestService;
    private final SubmissionRepository submissionRepository;

    @PostMapping
    public ResponseEntity<?> submit(@Valid @RequestBody SubmissionRequest request,
                                    @RequestAttribute("userId") String userId) {
        // Verify contest is active
        Contest contest = contestService.getContestById(request.getContestId());
        if (contest.getStatus() != ContestStatus.ACTIVE) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Contest is not active. Submissions are not allowed."));
        }

        Submission submission = evaluationService.evaluate(
                userId,
                request.getQuestionId(),
                request.getContestId(),
                request.getCode(),
                request.getLanguage()
        );

        SubmissionResponse response = SubmissionResponse.builder()
                .submissionId(submission.getId())
                .result(submission.getResult())
                .score(submission.getScore())
                .totalMarks(submission.getTotalMarks())
                .passedTestCases(submission.getPassedTestCases())
                .totalTestCases(submission.getTotalTestCases())
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/contest/{contestId}")
    public ResponseEntity<List<Submission>> getMySubmissions(
            @PathVariable String contestId,
            @RequestAttribute("userId") String userId) {
        return ResponseEntity.ok(
                submissionRepository.findByContestIdAndUserId(contestId, userId));
    }
}
