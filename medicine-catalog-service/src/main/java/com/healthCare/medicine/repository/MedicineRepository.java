package com.healthCare.medicine.repository;

import com.healthCare.medicine.entity.Medicine;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MedicineRepository extends JpaRepository<Medicine, Long> {

    @Query("""
            SELECT m FROM Medicine m WHERE m.isActive = true
            AND (LOWER(m.name) LIKE LOWER(CONCAT('%', :q, '%'))
                           OR LOWER(m.saltName) LIKE LOWER(CONCAT('%', :q, '%'))
                           OR LOWER(m.chemicalName) LIKE LOWER(CONCAT('%', :q, '%')))
            AND (LOWER(m.brand) LIKE LOWER(CONCAT('%', :brand, '%')))
            AND (:categoryId IS NULL OR m.category.id = :categoryId)
            """)
    Page<Medicine> search(@Param("q") String q,
                          @Param("brand") String brand,
                          @Param("categoryId") Long categoryId,
                          Pageable pageable);

    Page<Medicine> findByIsActiveTrueOrderByCreatedAtDesc(Pageable pageable);
}
