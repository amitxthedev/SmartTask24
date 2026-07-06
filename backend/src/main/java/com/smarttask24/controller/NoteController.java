package com.smarttask24.controller;

import com.smarttask24.dto.request.NoteRequest;
import com.smarttask24.dto.response.ApiResponse;
import com.smarttask24.dto.response.NoteResponse;
import com.smarttask24.service.NoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notes")
@RequiredArgsConstructor
public class NoteController {

    private final NoteService noteService;

    @GetMapping
    public ResponseEntity<ApiResponse> getNotes(@AuthenticationPrincipal User principal) {
        List<NoteResponse> notes = noteService.getUserNotes(principal.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Notes retrieved", notes));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getNote(@PathVariable Long id,
                                               @AuthenticationPrincipal User principal) {
        NoteResponse note = noteService.getNote(id, principal.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Note retrieved", note));
    }

    @PostMapping
    public ResponseEntity<ApiResponse> createNote(@RequestBody NoteRequest request,
                                                   @AuthenticationPrincipal User principal) {
        NoteResponse note = noteService.createNote(request, principal.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Note created", note));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse> updateNote(@PathVariable Long id,
                                                  @RequestBody NoteRequest request,
                                                  @AuthenticationPrincipal User principal) {
        NoteResponse note = noteService.updateNote(id, request, principal.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Note updated", note));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteNote(@PathVariable Long id,
                                                  @AuthenticationPrincipal User principal) {
        noteService.deleteNote(id, principal.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Note deleted", null));
    }
}
