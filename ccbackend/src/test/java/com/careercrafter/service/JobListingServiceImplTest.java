package com.careercrafter.service;

import com.hexaware.careercrafter.dto.JobListingDTO;
import com.hexaware.careercrafter.entity.JobListing;
import com.hexaware.careercrafter.entity.User;
import com.hexaware.careercrafter.enums.Role;
import com.hexaware.careercrafter.exception.ResourceNotFoundException;
import com.hexaware.careercrafter.repository.JobListingRepository;
import com.hexaware.careercrafter.repository.UserRepository;
import com.hexaware.careercrafter.service.impl.JobListingServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.modelmapper.ModelMapper;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JobListingServiceImplTest {

    @Mock
    private JobListingRepository jobListingRepository;

    @Mock
    private UserRepository userRepository;

    private JobListingServiceImpl jobListingService;

    private User employer;
    private JobListing jobListing;

    @BeforeEach
    void setUp() {
        jobListingService = new JobListingServiceImpl(jobListingRepository, userRepository, new ModelMapper());

        employer = new User();
        employer.setId(10L);
        employer.setEmail("hr@techcorp.com");
        employer.setRole(Role.EMPLOYER);

        jobListing = new JobListing();
        jobListing.setId(100L);
        jobListing.setJobTitle("Backend Developer");
        jobListing.setDescription("Build REST APIs using Spring Boot");
        jobListing.setLocation("Chennai");
        jobListing.setActive(true);
        jobListing.setPostedBy(employer);
    }

    @Test
    void postJobListing_shouldSaveAndReturnDTO_whenEmployerExists() {
        JobListingDTO dto = new JobListingDTO();
        dto.setJobTitle("Backend Developer");
        dto.setDescription("Build REST APIs using Spring Boot");
        dto.setLocation("Chennai");
        dto.setEmployerId(10L);

        when(userRepository.findById(10L)).thenReturn(Optional.of(employer));
        when(jobListingRepository.save(any(JobListing.class))).thenReturn(jobListing);

        JobListingDTO result = jobListingService.postJobListing(dto);

        assertEquals("Backend Developer", result.getJobTitle());
        assertEquals(10L, result.getEmployerId());
    }

    @Test
    void postJobListing_shouldThrowException_whenEmployerNotFound() {
        JobListingDTO dto = new JobListingDTO();
        dto.setEmployerId(999L);

        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> jobListingService.postJobListing(dto));
    }

    @Test
    void getJobListingById_shouldReturnListing_whenExists() {
        when(jobListingRepository.findById(100L)).thenReturn(Optional.of(jobListing));

        JobListingDTO result = jobListingService.getJobListingById(100L);

        assertEquals("Backend Developer", result.getJobTitle());
    }

    @Test
    void getJobListingById_shouldThrowException_whenNotFound() {
        when(jobListingRepository.findById(404L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> jobListingService.getJobListingById(404L));
    }

    @Test
    void getAllActiveJobListings_shouldReturnActiveListings() {
        when(jobListingRepository.findByActiveTrue()).thenReturn(List.of(jobListing));

        List<JobListingDTO> result = jobListingService.getAllActiveJobListings();

        assertEquals(1, result.size());
    }

    @Test
    void deleteJobListing_shouldRemoveListing_whenExists() {
        when(jobListingRepository.findById(100L)).thenReturn(Optional.of(jobListing));

        jobListingService.deleteJobListing(100L);

        verify(jobListingRepository, times(1)).delete(jobListing);
    }

    @Test
    void searchJobListings_shouldSearchByTitleAndLocation_whenBothProvided() {
        when(jobListingRepository.findByJobTitleContainingIgnoreCaseAndLocationContainingIgnoreCase("Backend", "Chennai"))
                .thenReturn(List.of(jobListing));

        List<JobListingDTO> result = jobListingService.searchJobListings("Backend", "Chennai", null);

        assertEquals(1, result.size());
        verify(jobListingRepository, times(1))
                .findByJobTitleContainingIgnoreCaseAndLocationContainingIgnoreCase("Backend", "Chennai");
    }
}
