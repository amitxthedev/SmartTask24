package com.smarttask24.controller;

import com.smarttask24.dto.request.TagRequest;
import com.smarttask24.dto.response.ApiResponse;
import com.smarttask24.dto.response.TagResponse;
import com.smarttask24.service.TagService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tags")
@RequiredArgsConstructor
public class TagController {

    private final TagService tagService;

    @GetMapping
    public ResponseEntity<ApiResponse> getTags(@AuthenticationPrincipal User principal) {
        List<TagResponse> tags = tagService.getUserTags(principal.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Tags retrieved", tags));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getTag(@PathVariable Long id,
                                               @AuthenticationPrincipal User principal) {
        TagResponse tag = tagService.getTag(id, principal.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Tag retrieved", tag));
    }

    @PostMapping
    public ResponseEntity<ApiResponse> createTag(@RequestBody TagRequest request,
                                                  @AuthenticationPrincipal User principal) {
        TagResponse tag = tagService.createTag(request, principal.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tag created", tag));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse> updateTag(@PathVariable Long id,
                                                  @RequestBody TagRequest request,
                                                  @AuthenticationPrincipal User principal) {
        TagResponse tag = tagService.updateTag(id, request, principal.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Tag updated", tag));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteTag(@PathVariable Long id,
                                                 @AuthenticationPrincipal User principal) {
        tagService.deleteTag(id, principal.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Tag deleted", null));
    }
}
