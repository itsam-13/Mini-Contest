package com.dsa.contest.model;

import com.dsa.contest.model.enums.ContestStatus;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

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
    private List<String> questionIds = new ArrayList<>();
}
