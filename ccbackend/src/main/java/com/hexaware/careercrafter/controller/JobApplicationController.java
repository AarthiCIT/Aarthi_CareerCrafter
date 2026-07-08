package com.hexaware.careercrafter.controller;

import com.hexaware.careercrafter.dto.JobApplicationDTO;
import com.hexaware.careercrafter.enums.ApplicationStatus;
import com.hexaware.careercrafter.service.JobApplicationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/applications")
public class JobApplicationController {

    private final JobApplicationService jobApplicationService;

    public JobApplicationController(JobApplicationService jobApplicationService) {
        this.jobApplicationService = jobApplicationService;
    }

    @PostMapping
    public ResponseEntity<JobApplicationDTO> apply(@Valid @RequestBody JobApplicationDTO jobApplicationDTO) {
        return new ResponseEntity<>(jobApplicationService.applyToJob(jobApplicationDTO), HttpStatus.CREATED);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<JobApplicationDTO> updateStatus(@PathVariable Long id,
                                                            @RequestParam ApplicationStatus status) {
        return ResponseEntity.ok(jobApplicationService.updateApplicationStatus(id, status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobApplicationDTO> getApplication(@PathVariable Long id) {
        return ResponseEntity.ok(jobApplicationService.getApplicationById(id));
    }

    @GetMapping("/job-seeker/{jobSeekerId}")
    public ResponseEntity<List<JobApplicationDTO>> getByJobSeeker(@PathVariable Long jobSeekerId) {
        return ResponseEntity.ok(jobApplicationService.getApplicationsByJobSeeker(jobSeekerId));
    }

    @GetMapping("/job-listing/{jobListingId}")
    public ResponseEntity<List<JobApplicationDTO>> getByJobListing(@PathVariable Long jobListingId) {
        return ResponseEntity.ok(jobApplicationService.getApplicationsByJobListing(jobListingId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> withdraw(@PathVariable Long id) {
        jobApplicationService.withdrawApplication(id);
        return ResponseEntity.noContent().build();
    }
}
