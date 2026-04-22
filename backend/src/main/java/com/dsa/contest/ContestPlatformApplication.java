package com.dsa.contest;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ContestPlatformApplication {
    public static void main(String[] args) {
        SpringApplication.run(ContestPlatformApplication.class, args);
    }
}
