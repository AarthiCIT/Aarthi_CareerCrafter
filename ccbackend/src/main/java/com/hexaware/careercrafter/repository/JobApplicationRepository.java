package com.hexaware.careercrafter.repository;

import com.hexaware.careercrafter.entity.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {

    List<JobApplication> findByJobSeekerId(Long jobSeekerId);

    List<JobApplication> findByJobListingId(Long jobListingId);

    Optional<JobApplication> findByJobListingIdAndJobSeekerId(Long jobListingId, Long jobSeekerId);

    boolean existsByJobListingIdAndJobSeekerId(Long jobListingId, Long jobSeekerId);
}
