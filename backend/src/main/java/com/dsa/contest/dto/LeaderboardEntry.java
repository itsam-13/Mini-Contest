package com.dsa.contest.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class LeaderboardEntry {
    private int rank;
    private String userId;
    private String userName;
    private String userEmail;
    private int totalScore;
    private int totalPenalty;
    private long totalTimeTaken; // seconds from contest start to last accepted submission
    private int problemsSolved;
}
