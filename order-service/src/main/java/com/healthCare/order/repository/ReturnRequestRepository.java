package com.healthCare.order.repository;

import com.healthCare.order.entity.ReturnRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReturnRequestRepository extends JpaRepository<ReturnRequest, Long> {
    Page<ReturnRequest> findByUserId(Long userId, Pageable pageable);
    Page<ReturnRequest> findByStatus(ReturnRequest.ReturnStatus status, Pageable pageable);
}
