package com.careercrafter.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ResumeDTO {

    private Long id;

    @NotBlank(message = "File name is required")
    private String fileName;

    @NotBlank(message = "File path is required")
    private String filePath;

    private String fileType;

    private boolean shared;

    @NotNull(message = "Job seeker id is required")
    private Long jobSeekerId;
}
