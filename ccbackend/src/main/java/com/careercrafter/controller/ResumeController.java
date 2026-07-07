package com.careercrafter.controller;

import com.careercrafter.dto.ResumeDTO;
import com.careercrafter.service.ResumeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/resumes")
public class ResumeController {

    private final ResumeService resumeService;

    public ResumeController(ResumeService resumeService) {
        this.resumeService = resumeService;
    }

    @PostMapping
    public ResponseEntity<ResumeDTO> upload(@Valid @RequestBody ResumeDTO resumeDTO) {
        return new ResponseEntity<>(resumeService.uploadResume(resumeDTO), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResumeDTO> update(@PathVariable Long id, @Valid @RequestBody ResumeDTO resumeDTO) {
        return ResponseEntity.ok(resumeService.updateResume(id, resumeDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        resumeService.deleteResume(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResumeDTO> getResume(@PathVariable Long id) {
        return ResponseEntity.ok(resumeService.getResumeById(id));
    }

    @GetMapping("/job-seeker/{jobSeekerId}")
    public ResponseEntity<List<ResumeDTO>> getByJobSeeker(@PathVariable Long jobSeekerId) {
        return ResponseEntity.ok(resumeService.getResumesByJobSeeker(jobSeekerId));
    }

    @PatchMapping("/{id}/share")
    public ResponseEntity<ResumeDTO> share(@PathVariable Long id) {
        return ResponseEntity.ok(resumeService.shareResume(id));
    }
}
