package com.smarttask24.service;

import com.smarttask24.dto.request.CategoryRequest;
import com.smarttask24.dto.response.CategoryResponse;
import com.smarttask24.entity.Category;
import com.smarttask24.entity.User;
import com.smarttask24.exception.BadRequestException;
import com.smarttask24.exception.ResourceNotFoundException;
import com.smarttask24.mapper.EntityMapper;
import com.smarttask24.repository.CategoryRepository;
import com.smarttask24.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final EntityMapper entityMapper;

    public List<CategoryResponse> getUserCategories(String email) {
        User user = getUser(email);
        return categoryRepository.findByUserOrderByNameAsc(user).stream()
                .map(entityMapper::toCategoryResponse)
                .toList();
    }

    public CategoryResponse getCategory(Long categoryId, String email) {
        User user = getUser(email);
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", categoryId));
        if (!category.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Category does not belong to this user");
        }
        return entityMapper.toCategoryResponse(category);
    }

    @Transactional
    public CategoryResponse updateCategory(Long categoryId, CategoryRequest request, String email) {
        User user = getUser(email);
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", categoryId));
        if (!category.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Category does not belong to this user");
        }
        category.setName(request.getName());
        category.setColor(request.getColor());
        category.setIcon(request.getIcon());
        category = categoryRepository.save(category);
        return entityMapper.toCategoryResponse(category);
    }

    @Transactional
    public CategoryResponse createCategory(CategoryRequest request, String email) {
        User user = getUser(email);
        if (categoryRepository.existsByNameAndUser(request.getName(), user)) {
            throw new BadRequestException("Category already exists");
        }
        Category category = Category.builder()
                .name(request.getName())
                .color(request.getColor())
                .icon(request.getIcon())
                .user(user)
                .build();
        category = categoryRepository.save(category);
        return entityMapper.toCategoryResponse(category);
    }

    @Transactional
    public void deleteCategory(Long categoryId, String email) {
        User user = getUser(email);
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", categoryId));
        if (!category.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Category does not belong to this user");
        }
        categoryRepository.delete(category);
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
