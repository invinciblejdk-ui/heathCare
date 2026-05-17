package com.healthCare.order.repository;

import com.healthCare.order.entity.Prescription;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
    List<Prescription> findByUserId(Long userId);
    Page<Prescription> findByValidationStatus(Prescription.ValidationStatus status, Pageable pageable);
}
