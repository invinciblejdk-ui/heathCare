package com.healthCare.payment.controller;

import com.healthCare.payment.entity.Payment;
import com.healthCare.payment.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    /**
     * Initiate a payment for an order.
     * Body: { "orderId": 1, "amount": 150.00, "method": "UPI" | "CARD" | "NET_BANKING" }
     */
    @PostMapping("/initiate")
    public ResponseEntity<Payment> initiate(Authentication auth, @RequestBody Map<String, Object> body) {
        Long orderId = Long.parseLong(body.get("orderId").toString());
        BigDecimal amount = new BigDecimal(body.get("amount").toString());
        String method = (String) body.get("method");
        return ResponseEntity.ok(paymentService.initiatePayment(getUserId(auth), orderId, amount, method));
    }

    /**
     * Verify payment after gateway callback.
     * Body: { "paymentId": 1, "transactionId": "client-txn-abc123" }
     */
    @PostMapping("/verify")
    public ResponseEntity<Payment> verify(@RequestBody Map<String, Object> body) {
        Long paymentId = Long.parseLong(body.get("paymentId").toString());
        String txnId = (String) body.getOrDefault("transactionId", "");
        return ResponseEntity.ok(paymentService.verifyPayment(paymentId, txnId));
    }

    /** Get payment status for an order */
    @GetMapping("/order/{orderId}")
    public ResponseEntity<Payment> getByOrder(@PathVariable Long orderId) {
        return ResponseEntity.ok(paymentService.getPaymentByOrderId(orderId));
    }

    /** Initiate refund (admin or system-triggered on cancellation) */
    @PostMapping("/order/{orderId}/refund")
    public ResponseEntity<Payment> refund(@PathVariable Long orderId) {
        return ResponseEntity.ok(paymentService.refund(orderId));
    }

    private Long getUserId(Authentication auth) { return (Long) auth.getDetails(); }
}
