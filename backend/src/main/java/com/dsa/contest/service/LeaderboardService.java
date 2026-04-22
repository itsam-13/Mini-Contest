package com.dsa.contest.service;

import com.dsa.contest.dto.LeaderboardEntry;
import com.dsa.contest.model.Contest;
import com.dsa.contest.model.Submission;
import com.dsa.contest.model.User;
import com.dsa.contest.model.enums.SubmissionResult;
import com.dsa.contest.repository.ContestRepository;
import com.dsa.contest.repository.SubmissionRepository;
import com.dsa.contest.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LeaderboardService {

    private final SubmissionRepository submissionRepository;
    private final UserRepository userRepository;
    private final ContestRepository contestRepository;

    public List<LeaderboardEntry> getLeaderboard(String contestId) {
        Contest contest = contestRepository.findById(contestId)
                .orElseThrow(() -> new RuntimeException("Contest not found"));

        List<Submission> allSubmissions = submissionRepository.findByContestId(contestId);

        // Group submissions by userId
        Map<String, List<Submission>> byUser = allSubmissions.stream()
                .collect(Collectors.groupingBy(Submission::getUserId));

        List<LeaderboardEntry> entries = new ArrayList<>();

        for (Map.Entry<String, List<Submission>> entry : byUser.entrySet()) {
            String userId = entry.getKey();
            List<Submission> userSubmissions = entry.getValue();

            User user = userRepository.findById(userId).orElse(null);
            if (user == null) continue;

            // Group by questionId and take best score per question
            Map<String, List<Submission>> byQuestion = userSubmissions.stream()
                    .collect(Collectors.groupingBy(Submission::getQuestionId));

            int totalScore = 0;
            int totalPenalty = 0;
            int problemsSolved = 0;
            long lastAcceptedTime = 0;

            for (Map.Entry<String, List<Submission>> qEntry : byQuestion.entrySet()) {
                List<Submission> qSubs = qEntry.getValue();

                // Best submission for this question
                Submission best = qSubs.stream()
                        .max(Comparator.comparingInt(Submission::getScore))
                        .orElse(null);

                if (best != null) {
                    totalScore += best.getScore();

                    if (best.getResult() == SubmissionResult.ACCEPTED) {
                        problemsSolved++;
                    }

                    // Count wrong submissions before the best one as penalty
                    long wrongCount = qSubs.stream()
                            .filter(s -> s.getResult() == SubmissionResult.WRONG)
                            .count();
                    totalPenalty += (int) (wrongCount * 10);

                    // Track latest submission time
                    if (best.getSubmittedAt() != null && contest.getStartTime() != null) {
                        long timeTaken = Duration.between(contest.getStartTime(),
                                best.getSubmittedAt()).getSeconds();
                        lastAcceptedTime = Math.max(lastAcceptedTime, timeTaken);
                    }
                }
            }

            entries.add(LeaderboardEntry.builder()
                    .userId(userId)
                    .userName(user.getName())
                    .userEmail(user.getEmail())
                    .totalScore(totalScore)
                    .totalPenalty(totalPenalty)
                    .totalTimeTaken(lastAcceptedTime)
                    .problemsSolved(problemsSolved)
                    .build());
        }

        // Sort: Score DESC, Penalty ASC, Time ASC
        entries.sort(Comparator
                .comparingInt(LeaderboardEntry::getTotalScore).reversed()
                .thenComparingInt(LeaderboardEntry::getTotalPenalty)
                .thenComparingLong(LeaderboardEntry::getTotalTimeTaken));

        // Assign ranks
        for (int i = 0; i < entries.size(); i++) {
            entries.get(i).setRank(i + 1);
        }

        return entries;
    }
}
