package com.careercrafter.controller;

import com.careercrafter.dto.JobListingDTO;
import com.careercrafter.service.JobListingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/job-listings")
public class JobListingController {

    private final JobListingService jobListingService;

    public JobListingController(JobListingService jobListingService) {
        this.jobListingService = jobListingService;
    }

    @PostMapping
    public ResponseEntity<JobListingDTO> postJobListing(@Valid @RequestBody JobListingDTO jobListingDTO) {
        return new ResponseEntity<>(jobListingService.postJobListing(jobListingDTO), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<JobListingDTO> updateJobListing(@PathVariable Long id,
                                                            @Valid @RequestBody JobListingDTO jobListingDTO) {
        return ResponseEntity.ok(jobListingService.updateJobListing(id, jobListingDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJobListing(@PathVariable Long id) {
        jobListingService.deleteJobListing(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobListingDTO> getJobListing(@PathVariable Long id) {
        return ResponseEntity.ok(jobListingService.getJobListingById(id));
    }

    @GetMapping
    public ResponseEntity<List<JobListingDTO>> getAllActive() {
        return ResponseEntity.ok(jobListingService.getAllActiveJobListings());
    }

    @GetMapping("/employer/{employerId}")
    public ResponseEntity<List<JobListingDTO>> getByEmployer(@PathVariable Long employerId) {
        return ResponseEntity.ok(jobListingService.getJobListingsByEmployer(employerId));
    }

    @GetMapping("/search")
    public ResponseEntity<List<JobListingDTO>> search(@RequestParam(required = false) String jobTitle,
                                                        @RequestParam(required = false) String location,
                                                        @RequestParam(required = false) String industry) {
        return ResponseEntity.ok(jobListingService.searchJobListings(jobTitle, location, industry));
    }
}
