package com.dsa.contest.controller;

import com.dsa.contest.dto.LeaderboardEntry;
import com.dsa.contest.model.Contest;
import com.dsa.contest.model.Question;
import com.dsa.contest.repository.QuestionRepository;
import com.dsa.contest.service.ContestService;
import com.dsa.contest.service.LeaderboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contests")
@RequiredArgsConstructor
public class ContestController {

    private final ContestService contestService;
    private final QuestionRepository questionRepository;
    private final LeaderboardService leaderboardService;

    @GetMapping
    public ResponseEntity<List<Contest>> getAllContests() {
        return ResponseEntity.ok(contestService.getAllContests());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Contest> getContest(@PathVariable String id) {
        return ResponseEntity.ok(contestService.getContestById(id));
    }

    @GetMapping("/{id}/questions")
    public ResponseEntity<List<Question>> getContestQuestions(@PathVariable String id) {
        Contest contest = contestService.getContestById(id);
        // Only return questions if contest is ACTIVE or ENDED
        if (contest.getStatus() == com.dsa.contest.model.enums.ContestStatus.UPCOMING) {
            return ResponseEntity.ok(List.of());
        }
        List<Question> questions = questionRepository.findByContestId(id);
        // Hide test cases from users during active contest
        if (contest.getStatus() == com.dsa.contest.model.enums.ContestStatus.ACTIVE) {
            questions.forEach(q -> q.setTestCases(null));
        }
        return ResponseEntity.ok(questions);
    }

    @GetMapping("/{id}/leaderboard")
    public ResponseEntity<List<LeaderboardEntry>> getLeaderboard(@PathVariable String id) {
        return ResponseEntity.ok(leaderboardService.getLeaderboard(id));
    }
}
