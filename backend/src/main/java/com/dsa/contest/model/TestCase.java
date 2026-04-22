package com.dsa.contest.model;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestCase {
    private String input;
    private String expectedOutput;
    private int marks;
}
