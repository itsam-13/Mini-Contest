package com.dsa.contest.repository;

import com.dsa.contest.model.Contest;
import com.dsa.contest.model.enums.ContestStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ContestRepository extends MongoRepository<Contest, String> {
    List<Contest> findByStatus(ContestStatus status);
    List<Contest> findAllByOrderByStartTimeDesc();
}
