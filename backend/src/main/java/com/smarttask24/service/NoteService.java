package com.smarttask24.service;

import com.smarttask24.dto.request.NoteRequest;
import com.smarttask24.dto.response.NoteResponse;
import com.smarttask24.entity.Note;
import com.smarttask24.entity.User;
import com.smarttask24.exception.BadRequestException;
import com.smarttask24.exception.ResourceNotFoundException;
import com.smarttask24.mapper.EntityMapper;
import com.smarttask24.repository.NoteRepository;
import com.smarttask24.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NoteService {

    private final NoteRepository noteRepository;
    private final UserRepository userRepository;
    private final EntityMapper entityMapper;

    public List<NoteResponse> getUserNotes(String email) {
        User user = getUser(email);
        return noteRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(entityMapper::toNoteResponse)
                .toList();
    }

    public NoteResponse getNote(Long noteId, String email) {
        User user = getUser(email);
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new ResourceNotFoundException("Note", noteId));
        if (!note.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Note does not belong to this user");
        }
        return entityMapper.toNoteResponse(note);
    }

    @Transactional
    public NoteResponse createNote(NoteRequest request, String email) {
        User user = getUser(email);
        Note note = Note.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .isMarkdown(request.isMarkdown())
                .user(user)
                .build();
        note = noteRepository.save(note);
        return entityMapper.toNoteResponse(note);
    }

    @Transactional
    public NoteResponse updateNote(Long noteId, NoteRequest request, String email) {
        User user = getUser(email);
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new ResourceNotFoundException("Note", noteId));
        if (!note.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Note does not belong to this user");
        }
        note.setTitle(request.getTitle());
        note.setContent(request.getContent());
        note.setMarkdown(request.isMarkdown());
        note = noteRepository.save(note);
        return entityMapper.toNoteResponse(note);
    }

    @Transactional
    public void deleteNote(Long noteId, String email) {
        User user = getUser(email);
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new ResourceNotFoundException("Note", noteId));
        if (!note.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Note does not belong to this user");
        }
        noteRepository.delete(note);
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
