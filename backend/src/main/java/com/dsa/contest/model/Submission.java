package com.dsa.contest.model;

import com.dsa.contest.model.enums.SubmissionResult;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "submissions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Submission {
    @Id
    private String id;

    private String userId;

    private String questionId;

    private String contestId;

    private String code;

    private String language; // "java" or "cpp"

    private SubmissionResult result;

    @Builder.Default
    private int score = 0;

    @Builder.Default
    private int totalMarks = 0;

    private int passedTestCases;

    private int totalTestCases;

    private Instant submittedAt;
}
