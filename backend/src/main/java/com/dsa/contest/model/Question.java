package com.dsa.contest.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Document(collection = "questions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Question {
    @Id
    private String id;

    private String contestId;

    private String title;

    private String description;

    private String inputFormat;

    private String outputFormat;

    @Builder.Default
    private List<TestCase> testCases = new ArrayList<>();
}
