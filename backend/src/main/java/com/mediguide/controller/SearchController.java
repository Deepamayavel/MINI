package com.mediguide.controller;

import com.mediguide.dto.SearchRequest;
import com.mediguide.dto.SearchResponse;
import com.mediguide.service.SearchService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/search")
public class SearchController {

    private final SearchService searchService;

    public SearchController(SearchService searchService) {
        this.searchService = searchService;
    }

    @PostMapping
    public ResponseEntity<SearchResponse> search(@Valid @RequestBody SearchRequest request, Authentication authentication) {
        String userId = (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getName()))
                ? authentication.getName()
                : "guest";
        return ResponseEntity.ok(searchService.search(userId, request));
    }
}
