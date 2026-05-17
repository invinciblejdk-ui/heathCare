package com.healthCare.admin.controller;

import com.healthCare.admin.entity.PromoCode;
import com.healthCare.admin.service.PromoCodeService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final PromoCodeService promoCodeService;

    public AdminController(PromoCodeService promoCodeService) {
        this.promoCodeService = promoCodeService;
    }

    // ── Promo Codes ─────────────────────────────────────────────────────────────

    @GetMapping("/promos")
    public ResponseEntity<List<PromoCode>> getAllPromos() {
        return ResponseEntity.ok(promoCodeService.getAll());
    }

    @PostMapping("/promos")
    public ResponseEntity<PromoCode> createPromo(@RequestBody PromoCode promo) {
        return ResponseEntity.ok(promoCodeService.create(promo));
    }

    @PutMapping("/promos/{id}")
    public ResponseEntity<PromoCode> updatePromo(@PathVariable Long id, @RequestBody PromoCode promo) {
        return ResponseEntity.ok(promoCodeService.update(id, promo));
    }

    @DeleteMapping("/promos/{id}")
    public ResponseEntity<Void> deletePromo(@PathVariable Long id) {
        promoCodeService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ── Analytics (summary dashboard) ──────────────────────────────────────────

    /**
     * Returns basic analytics summary.
     * In production, this would aggregate data from order-service and payment-service via REST calls.
     */
    @GetMapping("/analytics/summary")
    public ResponseEntity<Map<String, Object>> getAnalyticsSummary() {
        // Stub response — replace with actual aggregation calls
        return ResponseEntity.ok(Map.of(
                "message", "Analytics endpoint ready. Integrate with order-service and payment-service for live data.",
                "endpoints", Map.of(
                        "orderStats",   "GET http://ORDER-SERVICE/api/orders/admin/all",
                        "paymentStats", "GET http://PAYMENT-SERVICE/api/payments/order/{orderId}",
                        "topMedicines", "GET http://MEDICINE-CATALOG-SERVICE/api/medicines/latest"
                )
        ));
    }

    // ── Promo Validation (for use by order-service) ─────────────────────────────

    @GetMapping("/promos/validate")
    public ResponseEntity<PromoCode> validatePromo(@RequestParam String code,
                                                    @RequestParam BigDecimal orderAmount) {
        return ResponseEntity.ok(promoCodeService.validatePromoForOrder(code, orderAmount));
    }
}
