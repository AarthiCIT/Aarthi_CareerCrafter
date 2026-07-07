package com.careercrafter.service.impl;

import com.careercrafter.dto.ResumeDTO;
import com.careercrafter.entity.Resume;
import com.careercrafter.entity.User;
import com.careercrafter.exception.ResourceNotFoundException;
import com.careercrafter.repository.ResumeRepository;
import com.careercrafter.repository.UserRepository;
import com.careercrafter.service.ResumeService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ResumeServiceImpl implements ResumeService {

    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;

    public ResumeServiceImpl(ResumeRepository resumeRepository, UserRepository userRepository) {
        this.resumeRepository = resumeRepository;
        this.userRepository = userRepository;
    }

    @Override
    public ResumeDTO uploadResume(ResumeDTO resumeDTO) {
        User jobSeeker = userRepository.findById(resumeDTO.getJobSeekerId())
                .orElseThrow(() -> new ResourceNotFoundException("Job seeker not found with id " + resumeDTO.getJobSeekerId()));

        Resume resume = new Resume();
        resume.setFileName(resumeDTO.getFileName());
        resume.setFilePath(resumeDTO.getFilePath());
        resume.setFileType(resumeDTO.getFileType());
        resume.setShared(resumeDTO.isShared());
        resume.setJobSeeker(jobSeeker);

        Resume saved = resumeRepository.save(resume);
        return mapToDTO(saved);
    }

    @Override
    public ResumeDTO updateResume(Long id, ResumeDTO resumeDTO) {
        Resume resume = resumeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found with id " + id));

        resume.setFileName(resumeDTO.getFileName());
        resume.setFilePath(resumeDTO.getFilePath());
        resume.setFileType(resumeDTO.getFileType());

        Resume updated = resumeRepository.save(resume);
        return mapToDTO(updated);
    }

    @Override
    public void deleteResume(Long id) {
        Resume resume = resumeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found with id " + id));
        resumeRepository.delete(resume);
    }

    @Override
    public ResumeDTO getResumeById(Long id) {
        Resume resume = resumeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found with id " + id));
        return mapToDTO(resume);
    }

    @Override
    public List<ResumeDTO> getResumesByJobSeeker(Long jobSeekerId) {
        return resumeRepository.findByJobSeekerId(jobSeekerId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ResumeDTO shareResume(Long id) {
        Resume resume = resumeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found with id " + id));
        resume.setShared(true);
        Resume updated = resumeRepository.save(resume);
        return mapToDTO(updated);
    }

    private ResumeDTO mapToDTO(Resume resume) {
        ResumeDTO dto = new ResumeDTO();
        dto.setId(resume.getId());
        dto.setFileName(resume.getFileName());
        dto.setFilePath(resume.getFilePath());
        dto.setFileType(resume.getFileType());
        dto.setShared(resume.isShared());
        dto.setJobSeekerId(resume.getJobSeeker().getId());
        return dto;
    }
}
