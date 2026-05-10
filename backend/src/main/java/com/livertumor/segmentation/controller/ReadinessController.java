package com.livertumor.segmentation.controller;

import com.livertumor.segmentation.service.MLServiceClient;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
@Tag(name = "Readiness", description = "Dependency readiness")
public class ReadinessController {

    private final DataSource dataSource;
    private final MLServiceClient mlServiceClient;

    public ReadinessController(DataSource dataSource, MLServiceClient mlServiceClient) {
        this.dataSource = dataSource;
        this.mlServiceClient = mlServiceClient;
    }

    @GetMapping("/ready")
    @Operation(summary = "Readiness probe (database + ML service)")
    public ResponseEntity<Map<String, Object>> ready() {
        Map<String, Object> body = new LinkedHashMap<>();
        boolean dbOk = false;
        try (Connection c = dataSource.getConnection()) {
            dbOk = c.isValid(2);
        } catch (Exception e) {
            dbOk = false;
        }
        boolean mlOk = mlServiceClient.healthCheck();
        body.put("database", dbOk ? "UP" : "DOWN");
        body.put("mlService", mlOk ? "UP" : "DOWN");
        if (dbOk && mlOk) {
            return ResponseEntity.ok(body);
        }
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(body);
    }
}
