package com.careercrafter.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

@Data
public class JobListingDTO {

    private Long id;

    @NotBlank(message = "Job title is required")
    private String jobTitle;

    @NotBlank(message = "Description is required")
    private String description;

    private String qualifications;

    @NotBlank(message = "Location is required")
    private String location;

    private String industry;

    private String employmentType;

    @PositiveOrZero(message = "Salary cannot be negative")
    private Double salary;

    private boolean active;

    @NotNull(message = "Employer id is required")
    private Long employerId;
}
