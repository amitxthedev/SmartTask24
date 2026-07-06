package com.smarttask24.service;

import com.smarttask24.dto.request.TagRequest;
import com.smarttask24.dto.response.TagResponse;
import com.smarttask24.entity.Tag;
import com.smarttask24.entity.User;
import com.smarttask24.exception.BadRequestException;
import com.smarttask24.exception.ResourceNotFoundException;
import com.smarttask24.mapper.EntityMapper;
import com.smarttask24.repository.TagRepository;
import com.smarttask24.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TagService {

    private final TagRepository tagRepository;
    private final UserRepository userRepository;
    private final EntityMapper entityMapper;

    public List<TagResponse> getUserTags(String email) {
        User user = getUser(email);
        return tagRepository.findByUserOrderByNameAsc(user).stream()
                .map(entityMapper::toTagResponse)
                .toList();
    }

    public TagResponse getTag(Long tagId, String email) {
        User user = getUser(email);
        Tag tag = tagRepository.findById(tagId)
                .orElseThrow(() -> new ResourceNotFoundException("Tag", tagId));
        if (!tag.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Tag does not belong to this user");
        }
        return entityMapper.toTagResponse(tag);
    }

    @Transactional
    public TagResponse updateTag(Long tagId, TagRequest request, String email) {
        User user = getUser(email);
        Tag tag = tagRepository.findById(tagId)
                .orElseThrow(() -> new ResourceNotFoundException("Tag", tagId));
        if (!tag.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Tag does not belong to this user");
        }
        tag.setName(request.getName());
        tag.setColor(request.getColor());
        tag = tagRepository.save(tag);
        return entityMapper.toTagResponse(tag);
    }

    @Transactional
    public TagResponse createTag(TagRequest request, String email) {
        User user = getUser(email);
        Tag tag = Tag.builder()
                .name(request.getName())
                .color(request.getColor())
                .user(user)
                .build();
        tag = tagRepository.save(tag);
        return entityMapper.toTagResponse(tag);
    }

    @Transactional
    public void deleteTag(Long tagId, String email) {
        User user = getUser(email);
        Tag tag = tagRepository.findById(tagId)
                .orElseThrow(() -> new ResourceNotFoundException("Tag", tagId));
        if (!tag.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Tag does not belong to this user");
        }
        tagRepository.delete(tag);
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
