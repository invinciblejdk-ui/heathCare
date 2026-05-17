package com.healthCare.order.controller;

import com.healthCare.order.dto.OrderResponse;
import com.healthCare.order.dto.PlaceOrderRequest;
import com.healthCare.order.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/restful/v1/order")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    /** Place order from current cart */
    @PostMapping
    public ResponseEntity<OrderResponse> placeOrder(Authentication auth,
                                                     @Valid @RequestBody PlaceOrderRequest req) {
        return ResponseEntity.ok(orderService.placeOrder(getUserId(auth), req));
    }

    /** Get single order detail */
    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrder(Authentication auth, @PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrder(id, getUserId(auth)));
    }

    /** Get order tracking timeline */
    @GetMapping("/{id}/track")
    public ResponseEntity<OrderResponse> trackOrder(Authentication auth, @PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrder(id, getUserId(auth)));
    }

    /** Get paginated order history */
    @GetMapping("/history")
    public ResponseEntity<Page<OrderResponse>> getHistory(Authentication auth,
                                                           @RequestParam(defaultValue = "0") int page,
                                                           @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(orderService.getHistory(getUserId(auth), page, size));
    }

    /** Cancel an order */
    @PostMapping("/{id}/cancel")
    public ResponseEntity<OrderResponse> cancelOrder(Authentication auth, @PathVariable Long id) {
        return ResponseEntity.ok(orderService.cancelOrder(id, getUserId(auth)));
    }

    // ── Admin endpoints ─────────────────────────────────────────────────────────

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<OrderResponse>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(orderService.getAllOrders(page, size));
    }

    @PatchMapping("/admin/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrderResponse> updateStatus(@PathVariable Long id,
                                                       @RequestParam String status) {
        return ResponseEntity.ok(orderService.updateStatus(id, status));
    }

    private Long getUserId(Authentication auth) { return (Long) auth.getDetails(); }
}
