package com.dsa.contest.dto;

import com.dsa.contest.model.TestCase;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.util.List;

@Data
public class QuestionRequest {
    @NotBlank
    private String contestId;
    @NotBlank
    private String title;
    @NotBlank
    private String description;
    private String inputFormat;
    private String outputFormat;
    private List<TestCase> testCases;
}
