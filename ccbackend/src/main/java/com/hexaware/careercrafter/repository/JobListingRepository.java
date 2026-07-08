package com.hexaware.careercrafter.repository;

import com.hexaware.careercrafter.entity.JobListing;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JobListingRepository extends JpaRepository<JobListing, Long> {

    List<JobListing> findByPostedById(Long employerId);

    List<JobListing> findByActiveTrue();

    List<JobListing> findByJobTitleContainingIgnoreCaseAndLocationContainingIgnoreCase(String jobTitle, String location);

    List<JobListing> findByJobTitleContainingIgnoreCase(String jobTitle);

    List<JobListing> findByLocationContainingIgnoreCase(String location);

    List<JobListing> findByIndustryContainingIgnoreCase(String industry);
}
