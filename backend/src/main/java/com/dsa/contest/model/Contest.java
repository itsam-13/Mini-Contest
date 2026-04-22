package com.dsa.contest.model;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.dsa.contest.model.enums.ContestStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "contests")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Contest {
    @Id
    private String id;

    private String name;

    private long duration; // in minutes

    private Instant startTime;

    private Instant endTime;

    @Builder.Default
    private ContestStatus status = ContestStatus.UPCOMING;

    @Builder.Default
    private boolean manualStart = false;

    private Instant pausedAt;

    @Builder.Default
    private List<String> questionIds = new ArrayList<>();
}
