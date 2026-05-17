package com.healthCare.order.controller;

import com.healthCare.order.dto.AddToCartRequest;
import com.healthCare.order.dto.CartDTO;
import com.healthCare.order.service.CartService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/restful/v1/order")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public ResponseEntity<CartDTO> getCart(Authentication auth) {
        return ResponseEntity.ok(cartService.getCart(getUserId(auth)));
    }

    @PostMapping("/addToCart")
    public ResponseEntity<CartDTO> addItem(Authentication auth,
                                           @Valid @RequestBody AddToCartRequest req) {
        return ResponseEntity.ok(cartService.addItem(getUserId(auth), req));
    }

    @PutMapping("/{medicineId}")
    public ResponseEntity<CartDTO> updateItem(Authentication auth,
                                               @PathVariable Long medicineId,
                                               @RequestParam int quantity) {
        return ResponseEntity.ok(cartService.updateItemQuantity(getUserId(auth), medicineId, quantity));
    }

    @DeleteMapping("/{medicineId}")
    public ResponseEntity<CartDTO> removeItem(Authentication auth, @PathVariable Long medicineId) {
        return ResponseEntity.ok(cartService.removeItem(getUserId(auth), medicineId));
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart(Authentication auth) {
        cartService.clearCart(getUserId(auth));
        return ResponseEntity.noContent().build();
    }

    private Long getUserId(Authentication auth) {
        return (Long) auth.getDetails();
    }
}
