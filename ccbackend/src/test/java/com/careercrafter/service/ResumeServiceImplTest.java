package com.careercrafter.service;

import com.hexaware.careercrafter.dto.ResumeDTO;
import com.hexaware.careercrafter.entity.Resume;
import com.hexaware.careercrafter.entity.User;
import com.hexaware.careercrafter.exception.ResourceNotFoundException;
import com.hexaware.careercrafter.repository.ResumeRepository;
import com.hexaware.careercrafter.repository.UserRepository;
import com.hexaware.careercrafter.service.impl.ResumeServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ResumeServiceImplTest {

    @Mock
    private ResumeRepository resumeRepository;

    @Mock
    private UserRepository userRepository;

    private ResumeServiceImpl resumeService;

    private User jobSeeker;
    private Resume resume;

    @BeforeEach
    void setUp() {
        resumeService = new ResumeServiceImpl(resumeRepository, userRepository);

        jobSeeker = new User();
        jobSeeker.setId(20L);
        jobSeeker.setEmail("seeker@example.com");

        resume = new Resume();
        resume.setId(300L);
        resume.setFileName("arun_resume.pdf");
        resume.setFilePath("/uploads/resumes/arun_resume.pdf");
        resume.setFileType("pdf");
        resume.setShared(false);
        resume.setJobSeeker(jobSeeker);
    }

    @Test
    void uploadResume_shouldSaveAndReturnResume_whenJobSeekerExists() {
        ResumeDTO dto = new ResumeDTO();
        dto.setFileName("arun_resume.pdf");
        dto.setFilePath("/uploads/resumes/arun_resume.pdf");
        dto.setFileType("pdf");
        dto.setJobSeekerId(20L);

        when(userRepository.findById(20L)).thenReturn(Optional.of(jobSeeker));
        when(resumeRepository.save(any(Resume.class))).thenReturn(resume);

        ResumeDTO result = resumeService.uploadResume(dto);

        assertEquals("arun_resume.pdf", result.getFileName());
        assertEquals(20L, result.getJobSeekerId());
    }

    @Test
    void uploadResume_shouldThrowException_whenJobSeekerNotFound() {
        ResumeDTO dto = new ResumeDTO();
        dto.setJobSeekerId(999L);

        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> resumeService.uploadResume(dto));
    }

    @Test
    void getResumeById_shouldReturnResume_whenExists() {
        when(resumeRepository.findById(300L)).thenReturn(Optional.of(resume));

        ResumeDTO result = resumeService.getResumeById(300L);

        assertEquals("arun_resume.pdf", result.getFileName());
    }

    @Test
    void getResumeById_shouldThrowException_whenNotFound() {
        when(resumeRepository.findById(404L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> resumeService.getResumeById(404L));
    }

    @Test
    void getResumesByJobSeeker_shouldReturnList() {
        when(resumeRepository.findByJobSeekerId(20L)).thenReturn(List.of(resume));

        List<ResumeDTO> result = resumeService.getResumesByJobSeeker(20L);

        assertEquals(1, result.size());
    }

    @Test
    void shareResume_shouldMarkResumeAsShared() {
        when(resumeRepository.findById(300L)).thenReturn(Optional.of(resume));
        when(resumeRepository.save(any(Resume.class))).thenReturn(resume);

        ResumeDTO result = resumeService.shareResume(300L);

        assertTrue(result.isShared());
    }

    @Test
    void deleteResume_shouldRemoveResume_whenExists() {
        when(resumeRepository.findById(300L)).thenReturn(Optional.of(resume));

        resumeService.deleteResume(300L);

        verify(resumeRepository, times(1)).delete(resume);
    }
}
