package com.hexaware.careercrafter.service.impl;

import com.hexaware.careercrafter.dto.JobApplicationDTO;
import com.hexaware.careercrafter.entity.JobApplication;
import com.hexaware.careercrafter.entity.JobListing;
import com.hexaware.careercrafter.entity.Resume;
import com.hexaware.careercrafter.entity.User;
import com.hexaware.careercrafter.enums.ApplicationStatus;
import com.hexaware.careercrafter.exception.DuplicateResourceException;
import com.hexaware.careercrafter.exception.ResourceNotFoundException;
import com.hexaware.careercrafter.repository.JobApplicationRepository;
import com.hexaware.careercrafter.repository.JobListingRepository;
import com.hexaware.careercrafter.repository.ResumeRepository;
import com.hexaware.careercrafter.repository.UserRepository;
import com.hexaware.careercrafter.service.JobApplicationService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class JobApplicationServiceImpl implements JobApplicationService {

    private final JobApplicationRepository jobApplicationRepository;
    private final JobListingRepository jobListingRepository;
    private final UserRepository userRepository;
    private final ResumeRepository resumeRepository;

    public JobApplicationServiceImpl(JobApplicationRepository jobApplicationRepository,
                                      JobListingRepository jobListingRepository,
                                      UserRepository userRepository,
                                      ResumeRepository resumeRepository) {
        this.jobApplicationRepository = jobApplicationRepository;
        this.jobListingRepository = jobListingRepository;
        this.userRepository = userRepository;
        this.resumeRepository = resumeRepository;
    }

    @Override
    public JobApplicationDTO applyToJob(JobApplicationDTO jobApplicationDTO) {
        JobListing jobListing = jobListingRepository.findById(jobApplicationDTO.getJobListingId())
                .orElseThrow(() -> new ResourceNotFoundException("Job listing not found with id " + jobApplicationDTO.getJobListingId()));

        User jobSeeker = userRepository.findById(jobApplicationDTO.getJobSeekerId())
                .orElseThrow(() -> new ResourceNotFoundException("Job seeker not found with id " + jobApplicationDTO.getJobSeekerId()));

        if (jobApplicationRepository.existsByJobListingIdAndJobSeekerId(jobListing.getId(), jobSeeker.getId())) {
            throw new DuplicateResourceException("You have already applied to this job");
        }

        JobApplication application = new JobApplication();
        application.setJobListing(jobListing);
        application.setJobSeeker(jobSeeker);
        application.setCoverNote(jobApplicationDTO.getCoverNote());
        application.setStatus(ApplicationStatus.APPLIED);

        if (jobApplicationDTO.getResumeId() != null) {
            Resume resume = resumeRepository.findById(jobApplicationDTO.getResumeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Resume not found with id " + jobApplicationDTO.getResumeId()));
            application.setResume(resume);
        }

        JobApplication saved = jobApplicationRepository.save(application);
        return mapToDTO(saved);
    }

    @Override
    public JobApplicationDTO updateApplicationStatus(Long id, ApplicationStatus status) {
        JobApplication application = jobApplicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id " + id));

        application.setStatus(status);
        JobApplication updated = jobApplicationRepository.save(application);
        return mapToDTO(updated);
    }

    @Override
    public JobApplicationDTO getApplicationById(Long id) {
        JobApplication application = jobApplicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id " + id));
        return mapToDTO(application);
    }

    @Override
    public List<JobApplicationDTO> getApplicationsByJobSeeker(Long jobSeekerId) {
        return jobApplicationRepository.findByJobSeekerId(jobSeekerId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<JobApplicationDTO> getApplicationsByJobListing(Long jobListingId) {
        return jobApplicationRepository.findByJobListingId(jobListingId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void withdrawApplication(Long id) {
        JobApplication application = jobApplicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id " + id));
        jobApplicationRepository.delete(application);
    }

    private JobApplicationDTO mapToDTO(JobApplication application) {
        JobApplicationDTO dto = new JobApplicationDTO();
        dto.setId(application.getId());
        dto.setJobListingId(application.getJobListing().getId());
        dto.setJobSeekerId(application.getJobSeeker().getId());
        dto.setResumeId(application.getResume() != null ? application.getResume().getId() : null);
        dto.setCoverNote(application.getCoverNote());
        dto.setStatus(application.getStatus());
        dto.setAppliedOn(application.getAppliedOn());
        return dto;
    }
}
