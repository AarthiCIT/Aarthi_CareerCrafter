package com.careercrafter.service;

import com.careercrafter.dto.ResumeDTO;

import java.util.List;

public interface ResumeService {

    ResumeDTO uploadResume(ResumeDTO resumeDTO);

    ResumeDTO updateResume(Long id, ResumeDTO resumeDTO);

    void deleteResume(Long id);

    ResumeDTO getResumeById(Long id);

    List<ResumeDTO> getResumesByJobSeeker(Long jobSeekerId);

    ResumeDTO shareResume(Long id);
}
