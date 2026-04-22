package com.dsa.contest.service;

import java.time.Instant;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.dsa.contest.dto.ContestRequest;
import com.dsa.contest.model.Contest;
import com.dsa.contest.model.enums.ContestStatus;
import com.dsa.contest.repository.ContestRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class ContestService {

    private final ContestRepository contestRepository;

    public Contest createContest(ContestRequest request) {
        Contest.ContestBuilder builder = Contest.builder()
                .name(request.getName())
                .duration(request.getDuration())
                .status(ContestStatus.UPCOMING)
                .manualStart(request.isManualStart());

        if (!request.isManualStart() && request.getStartTime() != null) {
            // Scheduled contest
            Instant startTime = request.getStartTime();
            Instant endTime = startTime.plusSeconds(request.getDuration() * 60);
            builder.startTime(startTime).endTime(endTime);
        }

        Contest contest = builder.build();
        return contestRepository.save(contest);
    }

    public Contest startContest(String contestId) {
        Contest contest = getContestById(contestId);
        if (contest.getStatus() != ContestStatus.UPCOMING) {
            throw new RuntimeException("Contest can only be started from UPCOMING state");
        }
        
        if (contest.getQuestionIds() == null || contest.getQuestionIds().isEmpty()) {
            throw new RuntimeException("Cannot start contest: Question bank is empty. Please add questions first.");
        }

        Instant now = Instant.now();
        Instant startTime = now.plusSeconds(300); // +5 minutes
        Instant endTime = startTime.plusSeconds(contest.getDuration() * 60);

        contest.setStartTime(startTime);
        contest.setEndTime(endTime);
        contest.setStatus(ContestStatus.UPCOMING); // stays UPCOMING until countdown ends

        return contestRepository.save(contest);
    }

    public Contest pauseContest(String contestId) {
        Contest contest = getContestById(contestId);
        if (contest.getStatus() != ContestStatus.ACTIVE) {
            throw new RuntimeException("Contest can only be paused from ACTIVE state");
        }
        contest.setStatus(ContestStatus.PAUSED);
        contest.setPausedAt(Instant.now());
        return contestRepository.save(contest);
    }

    public Contest resumeContest(String contestId) {
        Contest contest = getContestById(contestId);
        if (contest.getStatus() != ContestStatus.PAUSED) {
            throw new RuntimeException("Contest can only be resumed from PAUSED state");
        }
        Instant pauseDuration = Instant.now().minusSeconds(contest.getPausedAt().getEpochSecond());
        contest.setEndTime(contest.getEndTime().plusSeconds(pauseDuration.getEpochSecond()));
        contest.setStatus(ContestStatus.ACTIVE);
        contest.setPausedAt(null);
        return contestRepository.save(contest);
    }

    public Contest extendContest(String contestId, long additionalMinutes) {
        Contest contest = getContestById(contestId);
        if (contest.getStatus() == ContestStatus.ENDED) {
            throw new RuntimeException("Cannot extend ended contest");
        }
        contest.setEndTime(contest.getEndTime().plusSeconds(additionalMinutes * 60));
        contest.setDuration(contest.getDuration() + additionalMinutes);
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

    public void deleteContest(String contestId) {
        // Removing status restriction to allow admin full cleanup control
        contestRepository.deleteById(contestId);
    }

    public Contest updateContest(String contestId, ContestRequest request) {
        Contest contest = getContestById(contestId);
        if (contest.getStatus() != ContestStatus.UPCOMING) {
            throw new RuntimeException("Can only update upcoming contests");
        }
        contest.setName(request.getName());
        contest.setDuration(request.getDuration());
        if (request.getStartTime() != null) {
            contest.setStartTime(request.getStartTime());
            contest.setEndTime(request.getStartTime().plusSeconds(request.getDuration() * 60));
        } else {
            contest.setStartTime(null);
            contest.setEndTime(null);
        }
        return contestRepository.save(contest);
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
                // Skip auto-start if no questions are present
                if (c.getQuestionIds() == null || c.getQuestionIds().isEmpty()) {
                    log.warn("Auto-start skipped for contest '{}': No questions found.", c.getName());
                    continue;
                }
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
