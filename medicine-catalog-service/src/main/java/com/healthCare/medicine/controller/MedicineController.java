package com.healthCare.medicine.controller;

import com.healthCare.medicine.dto.CreateMedicineRequest;
import com.healthCare.medicine.dto.MedicineDTO;
import com.healthCare.medicine.entity.Category;
import com.healthCare.medicine.service.MedicineService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/restful/v1/medicine")
public class MedicineController {

    private final MedicineService medicineService;

    public MedicineController(MedicineService medicineService) {
        this.medicineService = medicineService;
    }

    /** Search medicines by name, salt, chemical name, brand, category — paginated */
    @GetMapping("/search")
    public ResponseEntity<Page<MedicineDTO>> search(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(medicineService.search(q, brand, categoryId, page, size));
    }

    /** Get single medicine detail */
    @GetMapping("/{id}")
    public ResponseEntity<MedicineDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(medicineService.getById(id));
    }

    /** Get all active categories */
    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getCategories() {
        return ResponseEntity.ok(medicineService.getCategories());
    }

    /** Latest / recently added medicines */
    @GetMapping("/latest")
    public ResponseEntity<Page<MedicineDTO>> getLatest(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(medicineService.getLatest(page, size));
    }

    // ── Admin-only endpoints ────────────────────────────────────────────────────

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MedicineDTO> create(@Valid @RequestBody CreateMedicineRequest req) {
        return ResponseEntity.ok(medicineService.create(req));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MedicineDTO> update(@PathVariable Long id,
                                               @Valid @RequestBody CreateMedicineRequest req) {
        return ResponseEntity.ok(medicineService.update(id, req));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        medicineService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/deduct-stock")
    public ResponseEntity<Void> deductStock(@RequestBody List<com.healthCare.medicine.dto.DeductStockRequest> requests) {
        medicineService.deductStock(requests);
        return ResponseEntity.noContent().build();
    }
}
