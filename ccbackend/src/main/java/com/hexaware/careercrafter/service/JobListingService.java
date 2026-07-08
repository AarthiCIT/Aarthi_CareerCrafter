package com.hexaware.careercrafter.service;

import com.hexaware.careercrafter.dto.JobListingDTO;

import java.util.List;

public interface JobListingService {

    JobListingDTO postJobListing(JobListingDTO jobListingDTO);

    JobListingDTO updateJobListing(Long id, JobListingDTO jobListingDTO);

    void deleteJobListing(Long id);

    JobListingDTO getJobListingById(Long id);

    List<JobListingDTO> getAllActiveJobListings();

    List<JobListingDTO> getJobListingsByEmployer(Long employerId);

    List<JobListingDTO> searchJobListings(String jobTitle, String location, String industry);
}
