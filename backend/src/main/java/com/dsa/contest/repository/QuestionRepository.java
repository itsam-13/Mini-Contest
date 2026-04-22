package com.dsa.contest.repository;

import com.dsa.contest.model.Question;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface QuestionRepository extends MongoRepository<Question, String> {
    List<Question> findByContestId(String contestId);
}
