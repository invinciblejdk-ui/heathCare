package com.healthCare.order.controller;

import com.healthCare.order.entity.Prescription;
import com.healthCare.order.entity.ReturnRequest;
import com.healthCare.order.service.PrescriptionService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api")
public class PrescriptionController {

    private final PrescriptionService prescriptionService;

    public PrescriptionController(PrescriptionService prescriptionService) {
        this.prescriptionService = prescriptionService;
    }

    // ── User: Prescriptions ────────────────────────────────────────────────────

    @PostMapping("/prescriptions/upload")
    public ResponseEntity<Prescription> upload(Authentication auth,
                                                @RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(prescriptionService.upload(getUserId(auth), file));
    }

    @GetMapping("/prescriptions")
    public ResponseEntity<List<Prescription>> myPrescriptions(Authentication auth) {
        return ResponseEntity.ok(prescriptionService.getUserPrescriptions(getUserId(auth)));
    }

    // ── User: Return Requests ──────────────────────────────────────────────────

    @PostMapping("/orders/{orderId}/return")
    public ResponseEntity<ReturnRequest> requestReturn(Authentication auth,
                                                        @PathVariable Long orderId,
                                                        @RequestParam String reason) {
        return ResponseEntity.ok(prescriptionService.createReturnRequest(getUserId(auth), orderId, reason));
    }

    @GetMapping("/returns")
    public ResponseEntity<Page<ReturnRequest>> myReturns(Authentication auth,
                                                          @RequestParam(defaultValue = "0") int page,
                                                          @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(prescriptionService.getUserReturnRequests(getUserId(auth), page, size));
    }

    // ── Admin ──────────────────────────────────────────────────────────────────

    @GetMapping("/admin/prescriptions/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<Prescription>> getPendingPrescriptions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(prescriptionService.getPendingPrescriptions(page, size));
    }

    @PatchMapping("/admin/prescriptions/{id}/validate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Prescription> validatePrescription(@PathVariable Long id,
                                                              @RequestParam String status,
                                                              @RequestParam(required = false) String notes) {
        return ResponseEntity.ok(prescriptionService.validatePrescription(id, status, notes));
    }

    @GetMapping("/admin/returns/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<ReturnRequest>> pendingReturns(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(prescriptionService.getPendingReturnRequests(page, size));
    }

    @PatchMapping("/admin/returns/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ReturnRequest> updateReturn(@PathVariable Long id,
                                                       @RequestParam String status,
                                                       @RequestParam(required = false) String adminNotes) {
        return ResponseEntity.ok(prescriptionService.updateReturnStatus(id, status, adminNotes));
    }

    private Long getUserId(Authentication auth) { return (Long) auth.getDetails(); }
}
