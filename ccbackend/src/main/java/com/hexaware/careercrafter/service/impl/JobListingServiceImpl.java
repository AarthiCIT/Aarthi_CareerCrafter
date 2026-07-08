package com.hexaware.careercrafter.service.impl;

import com.hexaware.careercrafter.dto.JobListingDTO;
import com.hexaware.careercrafter.entity.JobListing;
import com.hexaware.careercrafter.entity.User;
import com.hexaware.careercrafter.exception.ResourceNotFoundException;
import com.hexaware.careercrafter.repository.JobListingRepository;
import com.hexaware.careercrafter.repository.UserRepository;
import com.hexaware.careercrafter.service.JobListingService;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class JobListingServiceImpl implements JobListingService {

    private final JobListingRepository jobListingRepository;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;

    public JobListingServiceImpl(JobListingRepository jobListingRepository, UserRepository userRepository,
                                  ModelMapper modelMapper) {
        this.jobListingRepository = jobListingRepository;
        this.userRepository = userRepository;
        this.modelMapper = modelMapper;
    }

    @Override
    public JobListingDTO postJobListing(JobListingDTO jobListingDTO) {
        User employer = userRepository.findById(jobListingDTO.getEmployerId())
                .orElseThrow(() -> new ResourceNotFoundException("Employer not found with id " + jobListingDTO.getEmployerId()));

        JobListing jobListing = new JobListing();
        jobListing.setJobTitle(jobListingDTO.getJobTitle());
        jobListing.setDescription(jobListingDTO.getDescription());
        jobListing.setQualifications(jobListingDTO.getQualifications());
        jobListing.setLocation(jobListingDTO.getLocation());
        jobListing.setIndustry(jobListingDTO.getIndustry());
        jobListing.setEmploymentType(jobListingDTO.getEmploymentType());
        jobListing.setSalary(jobListingDTO.getSalary());
        jobListing.setActive(true);
        jobListing.setPostedBy(employer);

        JobListing saved = jobListingRepository.save(jobListing);
        return mapToDTO(saved);
    }

    @Override
    public JobListingDTO updateJobListing(Long id, JobListingDTO jobListingDTO) {
        JobListing jobListing = jobListingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job listing not found with id " + id));

        jobListing.setJobTitle(jobListingDTO.getJobTitle());
        jobListing.setDescription(jobListingDTO.getDescription());
        jobListing.setQualifications(jobListingDTO.getQualifications());
        jobListing.setLocation(jobListingDTO.getLocation());
        jobListing.setIndustry(jobListingDTO.getIndustry());
        jobListing.setEmploymentType(jobListingDTO.getEmploymentType());
        jobListing.setSalary(jobListingDTO.getSalary());
        jobListing.setActive(jobListingDTO.isActive());

        JobListing updated = jobListingRepository.save(jobListing);
        return mapToDTO(updated);
    }

    @Override
    public void deleteJobListing(Long id) {
        JobListing jobListing = jobListingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job listing not found with id " + id));
        jobListingRepository.delete(jobListing);
    }

    @Override
    public JobListingDTO getJobListingById(Long id) {
        JobListing jobListing = jobListingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job listing not found with id " + id));
        return mapToDTO(jobListing);
    }

    @Override
    public List<JobListingDTO> getAllActiveJobListings() {
        return jobListingRepository.findByActiveTrue().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<JobListingDTO> getJobListingsByEmployer(Long employerId) {
        return jobListingRepository.findByPostedById(employerId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<JobListingDTO> searchJobListings(String jobTitle, String location, String industry) {
        List<JobListing> results;

        if (StringUtils.hasText(jobTitle) && StringUtils.hasText(location)) {
            results = jobListingRepository.findByJobTitleContainingIgnoreCaseAndLocationContainingIgnoreCase(jobTitle, location);
        } else if (StringUtils.hasText(jobTitle)) {
            results = jobListingRepository.findByJobTitleContainingIgnoreCase(jobTitle);
        } else if (StringUtils.hasText(location)) {
            results = jobListingRepository.findByLocationContainingIgnoreCase(location);
        } else if (StringUtils.hasText(industry)) {
            results = jobListingRepository.findByIndustryContainingIgnoreCase(industry);
        } else {
            results = jobListingRepository.findByActiveTrue();
        }

        return results.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    private JobListingDTO mapToDTO(JobListing jobListing) {
        JobListingDTO dto = modelMapper.map(jobListing, JobListingDTO.class);
        dto.setEmployerId(jobListing.getPostedBy().getId());
        return dto;
    }
}
