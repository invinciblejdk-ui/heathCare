package com.healthCare.order.service;

import com.healthCare.order.entity.Prescription;
import com.healthCare.order.entity.ReturnRequest;
import com.healthCare.order.repository.PrescriptionRepository;
import com.healthCare.order.repository.ReturnRequestRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
public class PrescriptionService {

    @Value("${prescription.upload.dir:uploads/prescriptions}")
    private String uploadDir;

    private final PrescriptionRepository prescriptionRepository;
    private final ReturnRequestRepository returnRequestRepository;

    public PrescriptionService(PrescriptionRepository prescriptionRepository,
                                ReturnRequestRepository returnRequestRepository) {
        this.prescriptionRepository = prescriptionRepository;
        this.returnRequestRepository = returnRequestRepository;
    }

    @Transactional
    public Prescription upload(Long userId, MultipartFile file) throws IOException {
        validateFile(file);

        Path dir = Paths.get(uploadDir);
        Files.createDirectories(dir);

        String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path target = dir.resolve(filename);
        Files.copy(file.getInputStream(), target);

        Prescription prescription = Prescription.builder()
                .userId(userId)
                .filePath(target.toString())
                .fileType(file.getContentType())
                .originalFileName(file.getOriginalFilename())
                .build();
        return prescriptionRepository.save(prescription);
    }

    public List<Prescription> getUserPrescriptions(Long userId) {
        return prescriptionRepository.findByUserId(userId);
    }

    public Page<Prescription> getPendingPrescriptions(int page, int size) {
        return prescriptionRepository.findByValidationStatus(
                Prescription.ValidationStatus.PENDING, PageRequest.of(page, size));
    }

    @Transactional
    public Prescription validatePrescription(Long prescriptionId, String status, String notes) {
        Prescription p = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new RuntimeException("Prescription not found"));
        p.setValidationStatus(Prescription.ValidationStatus.valueOf(status.toUpperCase()));
        p.setValidationNotes(notes);
        return prescriptionRepository.save(p);
    }

    // ── Return Requests ────────────────────────────────────────────────────────

    @Transactional
    public ReturnRequest createReturnRequest(Long userId, Long orderId, String reason) {
        ReturnRequest rr = ReturnRequest.builder()
                .orderId(orderId)
                .userId(userId)
                .reason(reason)
                .build();
        return returnRequestRepository.save(rr);
    }

    public Page<ReturnRequest> getUserReturnRequests(Long userId, int page, int size) {
        return returnRequestRepository.findByUserId(userId, PageRequest.of(page, size));
    }

    public Page<ReturnRequest> getPendingReturnRequests(int page, int size) {
        return returnRequestRepository.findByStatus(ReturnRequest.ReturnStatus.PENDING, PageRequest.of(page, size));
    }

    @Transactional
    public ReturnRequest updateReturnStatus(Long returnId, String status, String adminNotes) {
        ReturnRequest rr = returnRequestRepository.findById(returnId)
                .orElseThrow(() -> new RuntimeException("Return request not found"));
        rr.setStatus(ReturnRequest.ReturnStatus.valueOf(status.toUpperCase()));
        rr.setAdminNotes(adminNotes);
        return returnRequestRepository.save(rr);
    }

    // ── Validation ─────────────────────────────────────────────────────────────

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) throw new RuntimeException("File is empty");
        String ct = file.getContentType();
        if (ct == null || (!ct.startsWith("image/") && !ct.equals("application/pdf"))) {
            throw new RuntimeException("Only images (JPEG, PNG) and PDF files are allowed");
        }
        long maxSize = 10 * 1024 * 1024; // 10 MB
        if (file.getSize() > maxSize) throw new RuntimeException("File size exceeds 10MB limit");
    }
}
