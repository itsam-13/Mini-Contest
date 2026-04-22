package com.dsa.contest.service;

import com.dsa.contest.dto.ContestRequest;
import com.dsa.contest.model.Contest;
import com.dsa.contest.model.enums.ContestStatus;
import com.dsa.contest.repository.ContestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ContestService {

    private final ContestRepository contestRepository;

    public Contest createContest(ContestRequest request) {
        Contest contest = Contest.builder()
                .name(request.getName())
                .duration(request.getDuration())
                .status(ContestStatus.UPCOMING)
                .build();
        return contestRepository.save(contest);
    }

    public Contest startContest(String contestId) {
        Contest contest = getContestById(contestId);
        if (contest.getStatus() != ContestStatus.UPCOMING) {
            throw new RuntimeException("Contest can only be started from UPCOMING state");
        }

        Instant now = Instant.now();
        Instant startTime = now.plusSeconds(300); // +5 minutes
        Instant endTime = startTime.plusSeconds(contest.getDuration() * 60);

        contest.setStartTime(startTime);
        contest.setEndTime(endTime);
        contest.setStatus(ContestStatus.UPCOMING); // stays UPCOMING until countdown ends

        return contestRepository.save(contest);
    }

    public Contest getContestById(String contestId) {
        return contestRepository.findById(contestId)
                .orElseThrow(() -> new RuntimeException("Contest not found"));
    }

    public List<Contest> getAllContests() {
        return contestRepository.findAllByOrderByStartTimeDesc();
    }

    public List<Contest> getContestsByStatus(ContestStatus status) {
        return contestRepository.findByStatus(status);
    }

    /**
     * Scheduled task that runs every 5 seconds to transition contest states.
     * UPCOMING -> ACTIVE when startTime is reached.
     * ACTIVE -> ENDED when endTime is reached.
     */
    @Scheduled(fixedRate = 5000)
    public void updateContestStatuses() {
        Instant now = Instant.now();

        // Transition UPCOMING -> ACTIVE
        List<Contest> upcoming = contestRepository.findByStatus(ContestStatus.UPCOMING);
        for (Contest c : upcoming) {
            if (c.getStartTime() != null && now.isAfter(c.getStartTime())) {
                c.setStatus(ContestStatus.ACTIVE);
                contestRepository.save(c);
                log.info("Contest '{}' is now ACTIVE", c.getName());
            }
        }

        // Transition ACTIVE -> ENDED
        List<Contest> active = contestRepository.findByStatus(ContestStatus.ACTIVE);
        for (Contest c : active) {
            if (c.getEndTime() != null && now.isAfter(c.getEndTime())) {
                c.setStatus(ContestStatus.ENDED);
                contestRepository.save(c);
                log.info("Contest '{}' has ENDED", c.getName());
            }
        }
    }
}
