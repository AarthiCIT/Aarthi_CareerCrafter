package com.careercrafter.dto;

import com.careercrafter.enums.ApplicationStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class JobApplicationDTO {

    private Long id;

    @NotNull(message = "Job listing id is required")
    private Long jobListingId;

    @NotNull(message = "Job seeker id is required")
    private Long jobSeekerId;

    private Long resumeId;

    private String coverNote;

    private ApplicationStatus status;

    private LocalDateTime appliedOn;
}
