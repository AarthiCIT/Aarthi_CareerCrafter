package com.careercrafter.service;

import com.careercrafter.dto.JobApplicationDTO;
import com.careercrafter.entity.JobApplication;
import com.careercrafter.entity.JobListing;
import com.careercrafter.entity.User;
import com.careercrafter.enums.ApplicationStatus;
import com.careercrafter.exception.DuplicateResourceException;
import com.careercrafter.exception.ResourceNotFoundException;
import com.careercrafter.repository.JobApplicationRepository;
import com.careercrafter.repository.JobListingRepository;
import com.careercrafter.repository.ResumeRepository;
import com.careercrafter.repository.UserRepository;
import com.careercrafter.service.impl.JobApplicationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JobApplicationServiceImplTest {

    @Mock
    private JobApplicationRepository jobApplicationRepository;

    @Mock
    private JobListingRepository jobListingRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ResumeRepository resumeRepository;

    private JobApplicationServiceImpl jobApplicationService;

    private JobListing jobListing;
    private User jobSeeker;
    private JobApplication application;

    @BeforeEach
    void setUp() {
        jobApplicationService = new JobApplicationServiceImpl(jobApplicationRepository, jobListingRepository,
                userRepository, resumeRepository);

        jobListing = new JobListing();
        jobListing.setId(100L);
        jobListing.setJobTitle("Backend Developer");

        jobSeeker = new User();
        jobSeeker.setId(20L);
        jobSeeker.setEmail("seeker@example.com");

        application = new JobApplication();
        application.setId(500L);
        application.setJobListing(jobListing);
        application.setJobSeeker(jobSeeker);
        application.setStatus(ApplicationStatus.APPLIED);
    }

    @Test
    void applyToJob_shouldSaveApplication_whenNotAlreadyApplied() {
        JobApplicationDTO dto = new JobApplicationDTO();
        dto.setJobListingId(100L);
        dto.setJobSeekerId(20L);
        dto.setCoverNote("Looking forward to this opportunity");

        when(jobListingRepository.findById(100L)).thenReturn(Optional.of(jobListing));
        when(userRepository.findById(20L)).thenReturn(Optional.of(jobSeeker));
        when(jobApplicationRepository.existsByJobListingIdAndJobSeekerId(100L, 20L)).thenReturn(false);
        when(jobApplicationRepository.save(any(JobApplication.class))).thenReturn(application);

        JobApplicationDTO result = jobApplicationService.applyToJob(dto);

        assertEquals(100L, result.getJobListingId());
        assertEquals(20L, result.getJobSeekerId());
        assertEquals(ApplicationStatus.APPLIED, result.getStatus());
    }

    @Test
    void applyToJob_shouldThrowException_whenAlreadyApplied() {
        JobApplicationDTO dto = new JobApplicationDTO();
        dto.setJobListingId(100L);
        dto.setJobSeekerId(20L);

        when(jobListingRepository.findById(100L)).thenReturn(Optional.of(jobListing));
        when(userRepository.findById(20L)).thenReturn(Optional.of(jobSeeker));
        when(jobApplicationRepository.existsByJobListingIdAndJobSeekerId(100L, 20L)).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> jobApplicationService.applyToJob(dto));
        verify(jobApplicationRepository, never()).save(any(JobApplication.class));
    }

    @Test
    void applyToJob_shouldThrowException_whenJobListingNotFound() {
        JobApplicationDTO dto = new JobApplicationDTO();
        dto.setJobListingId(999L);
        dto.setJobSeekerId(20L);

        when(jobListingRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> jobApplicationService.applyToJob(dto));
    }

    @Test
    void updateApplicationStatus_shouldUpdateStatus_whenApplicationExists() {
        when(jobApplicationRepository.findById(500L)).thenReturn(Optional.of(application));
        when(jobApplicationRepository.save(any(JobApplication.class))).thenReturn(application);

        JobApplicationDTO result = jobApplicationService.updateApplicationStatus(500L, ApplicationStatus.SHORTLISTED);

        assertEquals(ApplicationStatus.SHORTLISTED, application.getStatus());
        assertNotNull(result);
    }

    @Test
    void getApplicationsByJobSeeker_shouldReturnApplications() {
        when(jobApplicationRepository.findByJobSeekerId(20L)).thenReturn(List.of(application));

        List<JobApplicationDTO> result = jobApplicationService.getApplicationsByJobSeeker(20L);

        assertEquals(1, result.size());
    }

    @Test
    void withdrawApplication_shouldDeleteApplication_whenExists() {
        when(jobApplicationRepository.findById(500L)).thenReturn(Optional.of(application));

        jobApplicationService.withdrawApplication(500L);

        verify(jobApplicationRepository, times(1)).delete(application);
    }
}
