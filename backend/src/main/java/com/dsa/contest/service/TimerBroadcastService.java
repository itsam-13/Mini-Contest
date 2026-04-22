package com.dsa.contest.service;

import com.dsa.contest.model.Contest;
import com.dsa.contest.model.enums.ContestStatus;
import com.dsa.contest.repository.ContestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class TimerBroadcastService {

    private final SimpMessagingTemplate messagingTemplate;
    private final ContestRepository contestRepository;

    /**
     * Broadcasts timer data every second for all active/upcoming contests.
     */
    @Scheduled(fixedRate = 1000)
    public void broadcastTimers() {
        Instant now = Instant.now();

        // Broadcast countdown for UPCOMING contests (that have startTime set)
        List<Contest> upcoming = contestRepository.findByStatus(ContestStatus.UPCOMING);
        for (Contest c : upcoming) {
            if (c.getStartTime() != null) {
                long secondsUntilStart = Math.max(0,
                        c.getStartTime().getEpochSecond() - now.getEpochSecond());

                Map<String, Object> data = new HashMap<>();
                data.put("contestId", c.getId());
                data.put("status", "UPCOMING");
                data.put("secondsUntilStart", secondsUntilStart);
                data.put("startTime", c.getStartTime().toString());
                data.put("endTime", c.getEndTime().toString());

                messagingTemplate.convertAndSend(
                        "/topic/contest/" + c.getId() + "/timer", data);
            }
        }

        // Broadcast remaining time for ACTIVE contests
        List<Contest> active = contestRepository.findByStatus(ContestStatus.ACTIVE);
        for (Contest c : active) {
            if (c.getEndTime() != null) {
                long secondsRemaining = Math.max(0,
                        c.getEndTime().getEpochSecond() - now.getEpochSecond());

                Map<String, Object> data = new HashMap<>();
                data.put("contestId", c.getId());
                data.put("status", "ACTIVE");
                data.put("secondsRemaining", secondsRemaining);
                data.put("startTime", c.getStartTime().toString());
                data.put("endTime", c.getEndTime().toString());

                messagingTemplate.convertAndSend(
                        "/topic/contest/" + c.getId() + "/timer", data);

                if (secondsRemaining == 0) {
                    Map<String, Object> endData = new HashMap<>();
                    endData.put("contestId", c.getId());
                    endData.put("status", "ENDED");
                    messagingTemplate.convertAndSend(
                            "/topic/contest/" + c.getId() + "/status", endData);
                }
            }
        }

        // Broadcast paused status for PAUSED contests
        List<Contest> paused = contestRepository.findByStatus(ContestStatus.PAUSED);
        for (Contest c : paused) {
            Map<String, Object> data = new HashMap<>();
            data.put("contestId", c.getId());
            data.put("status", "PAUSED");
            data.put("pausedAt", c.getPausedAt().toString());
            data.put("startTime", c.getStartTime().toString());
            data.put("endTime", c.getEndTime().toString());

            messagingTemplate.convertAndSend(
                    "/topic/contest/" + c.getId() + "/timer", data);
        }
    }

    /**
     * Notify all users that a contest has been started by admin.
     */
    public void notifyContestStarted(Contest contest) {
        Map<String, Object> data = new HashMap<>();
        data.put("contestId", contest.getId());
        data.put("contestName", contest.getName());
        data.put("status", contest.getStatus().name());
        data.put("startTime", contest.getStartTime().toString());
        data.put("endTime", contest.getEndTime().toString());
        data.put("message", "Contest '" + contest.getName() + "' starts in 5 minutes!");

        messagingTemplate.convertAndSend("/topic/contests/notifications", data);
    }
}
