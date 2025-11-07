package com.studentmgmt.backend.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.studentmgmt.backend.service.AnalyticsService;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "http://localhost:3000")
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;


    // Lấy dữ liệu biểu đồ học kỳ
    @GetMapping("/user/{userId}/chart-data")
    public ResponseEntity<?> getChartData(@PathVariable Long userId) {
        try {
            Map<String, Object> chartData = analyticsService.getSemesterChartData(userId);
            return ResponseEntity.ok(chartData);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Lỗi lấy dữ liệu biểu đồ: " + e.getMessage()));
        }
    }

    // Thống kê tổng quan
    @GetMapping("/user/{userId}/summary")
    public ResponseEntity<?> getSummary(@PathVariable Long userId) {
        try {
            Map<String, Object> overallGpa = analyticsService.calculateOverallGPA(userId);
            Map<String, Object> chartData = analyticsService.getSemesterChartData(userId);

            Map<String, Object> summary = Map.of(
                "overallGpa", overallGpa.get("overallGpa"),
                "totalCredits", overallGpa.get("totalCredits"),
                "semesterCount", overallGpa.get("semesterCount"),
                "chartData", chartData
            );

            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Lỗi lấy thống kê: " + e.getMessage()));
        }
    }
}