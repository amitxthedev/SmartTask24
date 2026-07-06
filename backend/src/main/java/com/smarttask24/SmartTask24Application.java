package com.smarttask24;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SmartTask24Application {

    public static void main(String[] args) {
        SpringApplication.run(SmartTask24Application.class, args);
    }
}
