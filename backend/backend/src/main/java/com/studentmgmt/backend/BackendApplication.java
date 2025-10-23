package com.studentmgmt.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
        System.out.println("=== Backend Application Started ===");
        System.out.println("Check available endpoints:");
        System.out.println("- GET /api/auth/login");
        System.out.println("- GET /api/semesters?userId={id}");
        System.out.println("- GET /api/subjects/semester/{id}");
        System.out.println("- POST /api/subjects");
    }
}
