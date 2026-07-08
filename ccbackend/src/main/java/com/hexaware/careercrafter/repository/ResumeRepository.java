package com.hexaware.careercrafter.repository;

import com.hexaware.careercrafter.entity.Resume;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ResumeRepository extends JpaRepository<Resume, Long> {

    List<Resume> findByJobSeekerId(Long jobSeekerId);
}
