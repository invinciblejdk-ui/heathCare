package com.healthCare.order.service;

import com.healthCare.order.dto.OrderResponse;
import com.healthCare.order.dto.PlaceOrderRequest;
import com.healthCare.order.entity.Cart;
import com.healthCare.order.entity.Order;
import com.healthCare.order.entity.OrderItem;
import com.healthCare.order.repository.OrderRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartService cartService;
    private final org.springframework.web.reactive.function.client.WebClient.Builder webClientBuilder;

    public OrderService(OrderRepository orderRepository, CartService cartService, org.springframework.web.reactive.function.client.WebClient.Builder webClientBuilder) {
        this.orderRepository = orderRepository;
        this.cartService = cartService;
        this.webClientBuilder = webClientBuilder;
    }

    @Transactional
    public OrderResponse placeOrder(Long userId, PlaceOrderRequest req) {
        Cart cart = cartService.getOrCreateCart(userId);
        if (cart.getItems().isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        // Check and deduct stock from Medicine Catalog Service
        List<com.healthCare.order.dto.DeductStockRequest> deductRequests = cart.getItems().stream()
                .map(item -> new com.healthCare.order.dto.DeductStockRequest(item.getMedicineId(), item.getQuantity()))
                .collect(Collectors.toList());
        
        String authHeader = null;
        org.springframework.web.context.request.RequestAttributes attrs = org.springframework.web.context.request.RequestContextHolder.getRequestAttributes();
        if (attrs instanceof org.springframework.web.context.request.ServletRequestAttributes) {
            authHeader = ((org.springframework.web.context.request.ServletRequestAttributes) attrs).getRequest().getHeader("Authorization");
        }

        try {
            org.springframework.web.reactive.function.client.WebClient.RequestBodySpec reqSpec = webClientBuilder.build().post()
                    .uri("http://medicine-catalog-service/restful/v1/catalog/deduct-stock");
            if (authHeader != null) {
                reqSpec.header("Authorization", authHeader);
            }
            reqSpec.bodyValue(deductRequests)
                    .retrieve()
                    .toBodilessEntity()
                    .block();
        } catch (org.springframework.web.reactive.function.client.WebClientResponseException e) {
            // Forward the exact error (e.g. 400 Bad Request) from the catalog service
            throw new org.springframework.web.server.ResponseStatusException(e.getStatusCode(), "Catalog Error: " + e.getResponseBodyAsString());
        } catch (Exception e) {
            // Fallback for network issues
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR, 
                    "Failed to place order: Catalog service unavailable.", e);
        }

        BigDecimal total = cart.getItems().stream()
                .map(i -> i.getUnitPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Order order = Order.builder()
                .userId(userId)
                .addressId(req.getAddressId())
                .prescriptionId(req.getPrescriptionId())
                .promoCode(req.getPromoCode())
                .totalAmount(total)
                .status(Order.OrderStatus.PENDING)
                .build();

        List<OrderItem> orderItems = cart.getItems().stream().map(cartItem -> OrderItem.builder()
                .order(order)
                .medicineId(cartItem.getMedicineId())
                .medicineName(cartItem.getMedicineName())
                .quantity(cartItem.getQuantity())
                .unitPrice(cartItem.getUnitPrice())
                .totalPrice(cartItem.getUnitPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity())))
                .build()).collect(Collectors.toList());

        order.setItems(orderItems);
        Order savedOrder = orderRepository.save(order);

        // Clear cart after placing order
        cartService.clearCart(userId);

        // Send Push Notification Asynchronously (fire and forget)
        try {
            java.util.Map<String, String> pushPayload = new java.util.HashMap<>();
            pushPayload.put("title", "Order Placed Successfully!");
            pushPayload.put("message", "Your order #" + savedOrder.getId() + " has been successfully placed.");
            pushPayload.put("topic", "user_" + userId); // Send to a user-specific topic

            org.springframework.web.reactive.function.client.WebClient.RequestBodySpec notifSpec = webClientBuilder.build().post()
                    .uri("http://notification-service/api/notifications/push");
            if (authHeader != null) {
                notifSpec.header("Authorization", authHeader);
            }
            notifSpec.bodyValue(pushPayload)
                    .retrieve()
                    .toBodilessEntity()
                    .subscribe(); // subscribe() makes it async (fire and forget)
        } catch (Exception e) {
            // Ignore notification failure
        }

        return toResponse(savedOrder);
    }

    public OrderResponse getOrder(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        if (!order.getUserId().equals(userId)) throw new RuntimeException("Access denied");
        return toResponse(order);
    }

    public Page<OrderResponse> getHistory(Long userId, int page, int size) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId,
                PageRequest.of(page, size)).map(this::toResponse);
    }

    public Page<OrderResponse> getAllOrders(int page, int size) {
        return orderRepository.findAllByOrderByCreatedAtDesc(
                PageRequest.of(page, size, Sort.by("createdAt").descending())).map(this::toResponse);
    }

    @Transactional
    public OrderResponse cancelOrder(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        if (!order.getUserId().equals(userId)) throw new RuntimeException("Access denied");
        if (order.getStatus() == Order.OrderStatus.SHIPPED || order.getStatus() == Order.OrderStatus.DELIVERED) {
            throw new RuntimeException("Cannot cancel order that has already been shipped/delivered");
        }
        order.setStatus(Order.OrderStatus.CANCELLED);
        return toResponse(orderRepository.save(order));
    }

    @Transactional
    public OrderResponse updateStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(Order.OrderStatus.valueOf(status.toUpperCase()));
        return toResponse(orderRepository.save(order));
    }

    // ── helpers ────────────────────────────────────────────────────────────────

    private OrderResponse toResponse(Order o) {
        OrderResponse res = new OrderResponse();
        res.setId(o.getId());
        res.setStatus(o.getStatus().name());
        res.setTotalAmount(o.getTotalAmount());
        res.setDiscountAmount(o.getDiscountAmount());
        res.setPromoCode(o.getPromoCode());
        res.setAddressId(o.getAddressId());
        res.setPrescriptionId(o.getPrescriptionId());
        res.setPaymentId(o.getPaymentId());
        res.setCreatedAt(o.getCreatedAt());
        res.setUpdatedAt(o.getUpdatedAt());

        if (o.getItems() != null) {
            res.setItems(o.getItems().stream().map(i -> {
                OrderResponse.OrderItemDTO d = new OrderResponse.OrderItemDTO();
                d.setMedicineId(i.getMedicineId());
                d.setMedicineName(i.getMedicineName());
                d.setQuantity(i.getQuantity());
                d.setUnitPrice(i.getUnitPrice());
                d.setTotalPrice(i.getTotalPrice());
                return d;
            }).collect(Collectors.toList()));
        }

        // Build simple tracking timeline from current status
        res.setTrackingTimeline(buildTimeline(o));
        return res;
    }

    private List<OrderResponse.TrackingEvent> buildTimeline(Order order) {
        List<OrderResponse.TrackingEvent> timeline = new ArrayList<>();
        addEvent(timeline, "PENDING", "Order placed successfully", order.getCreatedAt());
        Order.OrderStatus s = order.getStatus();
        if (s.ordinal() >= Order.OrderStatus.APPROVED.ordinal())
            addEvent(timeline, "APPROVED", "Order approved by pharmacy", order.getUpdatedAt());
        if (s.ordinal() >= Order.OrderStatus.PROCESSING.ordinal())
            addEvent(timeline, "PROCESSING", "Order is being packed", order.getUpdatedAt());
        if (s.ordinal() >= Order.OrderStatus.SHIPPED.ordinal())
            addEvent(timeline, "SHIPPED", "Order dispatched for delivery", order.getUpdatedAt());
        if (s == Order.OrderStatus.DELIVERED)
            addEvent(timeline, "DELIVERED", "Order delivered successfully", order.getUpdatedAt());
        if (s == Order.OrderStatus.CANCELLED)
            addEvent(timeline, "CANCELLED", "Order was cancelled", order.getUpdatedAt());
        return timeline;
    }

    private void addEvent(List<OrderResponse.TrackingEvent> list, String status, String desc, LocalDateTime ts) {
        OrderResponse.TrackingEvent e = new OrderResponse.TrackingEvent();
        e.setStatus(status); e.setDescription(desc); e.setTimestamp(ts);
        list.add(e);
    }
}
