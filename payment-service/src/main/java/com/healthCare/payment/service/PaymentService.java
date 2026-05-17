package com.healthCare.payment.service;

import com.healthCare.payment.entity.Payment;
import com.healthCare.payment.repository.PaymentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Payment stub — simulates gateway responses realistically.
 * Replace the initiate/verify logic with Razorpay SDK calls to go live.
 */
@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;

    public PaymentService(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    @Transactional
    public Payment initiatePayment(Long userId, Long orderId, BigDecimal amount, String method) {
        // Check for existing payment for this order
        paymentRepository.findByOrderId(orderId).ifPresent(p -> {
            if (p.getStatus() == Payment.PaymentStatus.SUCCESS) {
                throw new RuntimeException("Order already paid");
            }
        });

        Payment payment = Payment.builder()
                .userId(userId)
                .orderId(orderId)
                .amount(amount)
                .method(Payment.PaymentMethod.valueOf(method.toUpperCase()))
                .status(Payment.PaymentStatus.PENDING)
                .build();
        return paymentRepository.save(payment);
    }

    /**
     * STUB: In production, verify with actual gateway callback.
     * For now, marks as SUCCESS if clientTransactionId is provided, FAILED otherwise.
     */
    @Transactional
    public Payment verifyPayment(Long paymentId, String clientTransactionId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        if (payment.getStatus() != Payment.PaymentStatus.PENDING) {
            throw new RuntimeException("Payment already processed");
        }

        if (clientTransactionId != null && !clientTransactionId.isBlank()) {
            // STUB: simulate success
            payment.setStatus(Payment.PaymentStatus.SUCCESS);
            payment.setTransactionId("TXN-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase());
        } else {
            payment.setStatus(Payment.PaymentStatus.FAILED);
            payment.setFailureReason("Transaction ID not provided or invalid");
        }
        return paymentRepository.save(payment);
    }

    public Payment getPaymentByOrderId(Long orderId) {
        return paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Payment not found for order " + orderId));
    }

    @Transactional
    public Payment refund(Long orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
        if (payment.getStatus() != Payment.PaymentStatus.SUCCESS) {
            throw new RuntimeException("Can only refund successful payments");
        }
        payment.setStatus(Payment.PaymentStatus.REFUNDED);
        return paymentRepository.save(payment);
    }
}
