package com.tasky;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@Slf4j
public class AppApplication implements CommandLineRunner {

    static void main(String[] args) {
        SpringApplication.run(AppApplication.class, args);
    }

    @Override
    public void run(String... args) {
        log.info("[ ******* API TASKY ****** ]");
        log.info("[ ********* 1.0.0 ******** ]");
    }
}
