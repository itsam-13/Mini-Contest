package com.dsa.contest.dto;

import com.dsa.contest.model.enums.SubmissionResult;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class SubmissionResponse {
    private String submissionId;
    private SubmissionResult result;
    private int score;
    private int totalMarks;
    private int passedTestCases;
    private int totalTestCases;
}
