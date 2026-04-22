package com.dsa.contest.repository;

import com.dsa.contest.model.Submission;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface SubmissionRepository extends MongoRepository<Submission, String> {
    List<Submission> findByContestId(String contestId);
    List<Submission> findByContestIdAndUserId(String contestId, String userId);
    List<Submission> findByContestIdAndUserIdAndQuestionId(String contestId, String userId, String questionId);
}
