package com.healthCare.order.service;

import com.healthCare.order.dto.AddToCartRequest;
import com.healthCare.order.dto.CartDTO;
import com.healthCare.order.entity.Cart;

public interface CartService {

    CartDTO getCart(Long userId);

    CartDTO addItem(Long userId, AddToCartRequest req);

    CartDTO updateItemQuantity(Long userId, Long medicineId, int quantity);

    CartDTO removeItem(Long userId, Long medicineId);

    void clearCart(Long userId);

    Cart getOrCreateCart(Long userId);
}
