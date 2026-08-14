package com.mediguide.controller;

import com.mediguide.dto.HistoryDetailDto;
import com.mediguide.dto.HistoryItemDto;
import com.mediguide.service.HistoryService;
import jakarta.validation.constraints.Min;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/history")
public class HistoryController {

    private final HistoryService historyService;

    public HistoryController(HistoryService historyService) {
        this.historyService = historyService;
    }

    @GetMapping
    public ResponseEntity<Page<HistoryItemDto>> getHistory(
            Authentication authentication,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) int size
    ) {
        String userId = authentication.getName();
        return ResponseEntity.ok(historyService.getHistory(userId, page, size));
    }

    @GetMapping("/{queryId}")
    public ResponseEntity<HistoryDetailDto> getHistoryDetail(Authentication authentication, @PathVariable String queryId) {
        String userId = authentication.getName();
        return ResponseEntity.ok(historyService.getHistoryDetail(userId, queryId));
    }

    @DeleteMapping("/{queryId}")
    public ResponseEntity<Void> deleteHistory(Authentication authentication, @PathVariable String queryId) {
        String userId = authentication.getName();
        historyService.deleteHistory(userId, queryId);
        return ResponseEntity.noContent().build();
    }
}
