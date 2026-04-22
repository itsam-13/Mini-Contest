package com.dsa.contest.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SubmissionRequest {
    @NotBlank
    private String questionId;
    @NotBlank
    private String contestId;
    @NotBlank
    private String code;
    @NotBlank
    private String language; // "java" or "cpp"
}
