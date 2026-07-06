package com.smarttask24.controller;

import com.smarttask24.dto.request.CategoryRequest;
import com.smarttask24.dto.response.ApiResponse;
import com.smarttask24.dto.response.CategoryResponse;
import com.smarttask24.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<ApiResponse> getCategories(@AuthenticationPrincipal User principal) {
        List<CategoryResponse> categories = categoryService.getUserCategories(principal.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Categories retrieved", categories));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getCategory(@PathVariable Long id,
                                                    @AuthenticationPrincipal User principal) {
        CategoryResponse category = categoryService.getCategory(id, principal.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Category retrieved", category));
    }

    @PostMapping
    public ResponseEntity<ApiResponse> createCategory(@RequestBody CategoryRequest request,
                                                       @AuthenticationPrincipal User principal) {
        CategoryResponse category = categoryService.createCategory(request, principal.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Category created", category));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse> updateCategory(@PathVariable Long id,
                                                       @RequestBody CategoryRequest request,
                                                       @AuthenticationPrincipal User principal) {
        CategoryResponse category = categoryService.updateCategory(id, request, principal.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Category updated", category));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteCategory(@PathVariable Long id,
                                                      @AuthenticationPrincipal User principal) {
        categoryService.deleteCategory(id, principal.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Category deleted", null));
    }
}
