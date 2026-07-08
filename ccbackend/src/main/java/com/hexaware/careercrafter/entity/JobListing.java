package com.hexaware.careercrafter.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "job_listings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class JobListing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String jobTitle;

    @Column(nullable = false, length = 2000)
    private String description;

    @Column(length = 500)
    private String qualifications;

    @Column(length = 100)
    private String location;

    @Column(length = 100)
    private String industry;

    @Column(length = 50)
    private String employmentType;

    private Double salary;

    private boolean active = true;

    @Column(nullable = false, updatable = false)
    private LocalDateTime postedOn;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employer_id", nullable = false)
    private User postedBy;

    @OneToMany(mappedBy = "jobListing", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<JobApplication> applications = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        this.postedOn = LocalDateTime.now();
    }
}
