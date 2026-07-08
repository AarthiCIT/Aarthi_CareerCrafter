package com.hexaware.careercrafter.service;

import com.hexaware.careercrafter.dto.JobApplicationDTO;
import com.hexaware.careercrafter.enums.ApplicationStatus;

import java.util.List;

public interface JobApplicationService {

    JobApplicationDTO applyToJob(JobApplicationDTO jobApplicationDTO);

    JobApplicationDTO updateApplicationStatus(Long id, ApplicationStatus status);

    JobApplicationDTO getApplicationById(Long id);

    List<JobApplicationDTO> getApplicationsByJobSeeker(Long jobSeekerId);

    List<JobApplicationDTO> getApplicationsByJobListing(Long jobListingId);

    void withdrawApplication(Long id);
}
