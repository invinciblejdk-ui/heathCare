package com.healthCare.order.service.impl;

import com.healthCare.order.dto.AddToCartRequest;
import com.healthCare.order.dto.CartDTO;
import com.healthCare.order.entity.Cart;
import com.healthCare.order.entity.CartItem;
import com.healthCare.order.entity.User;
import com.healthCare.order.repository.CartRepository;
import com.healthCare.order.service.CartService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;

    public CartServiceImpl(CartRepository cartRepository) {
        this.cartRepository = cartRepository;
    }

    @Override
    public CartDTO getCart(Long userId) {
        Cart cart = getOrCreateCart(userId);
        return toDTO(cart);
    }

    @Override
    @Transactional
    public CartDTO addItem(Long userId, AddToCartRequest req) {
        Cart cart = getOrCreateCart(userId);

        // If same medicine already in cart, increment quantity
        cart.getItems().stream()
                .filter(i -> i.getMedicineId().equals(req.getMedicineId()))
                .findFirst()
                .ifPresentOrElse(
                        existing -> existing.setQuantity(existing.getQuantity() + req.getQuantity()),
                        () -> {
                            CartItem item = CartItem.builder()
                                    .cart(cart)
                                    .userId(User.builder().id(userId).build())
                                    .medicineId(req.getMedicineId())
                                    .medicineName(req.getMedicineName())
                                    .medicineImage(req.getMedicineImage())
                                    .quantity(req.getQuantity())
                                    .unitPrice(req.getUnitPrice())
                                    .build();
                            cart.getItems().add(item);
                        }
                );
        return toDTO(cartRepository.save(cart));
    }

    @Override
    @Transactional
    public CartDTO updateItemQuantity(Long userId, Long medicineId, int quantity) {
        Cart cart = getOrCreateCart(userId);
        cart.getItems().stream()
                .filter(i -> i.getMedicineId().equals(medicineId))
                .findFirst()
                .ifPresent(i -> {
                    if (quantity <= 0) cart.getItems().remove(i);
                    else i.setQuantity(quantity);
                });
        return toDTO(cartRepository.save(cart));
    }

    @Override
    @Transactional
    public CartDTO removeItem(Long userId, Long medicineId) {
        Cart cart = getOrCreateCart(userId);
        cart.getItems().removeIf(i -> i.getMedicineId().equals(medicineId));
        return toDTO(cartRepository.save(cart));
    }

    @Override
    @Transactional
    public void clearCart(Long userId) {
        Cart cart = getOrCreateCart(userId);
        cart.getItems().clear();
        cartRepository.save(cart);
    }

    // ── helpers ────────────────────────────────────────────────────────────────

    @Override
    public Cart getOrCreateCart(Long userId) {
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> cartRepository.save(Cart.builder().userId(userId).build()));
    }

    private CartDTO toDTO(Cart cart) {
        CartDTO dto = new CartDTO();
        dto.setCartId(cart.getId());
        dto.setUserId(cart.getUserId());

        List<CartDTO.CartItemDTO> items = cart.getItems().stream().map(i -> {
            CartDTO.CartItemDTO d = new CartDTO.CartItemDTO();
            d.setId(i.getId());
            d.setMedicineId(i.getMedicineId());
            d.setMedicineName(i.getMedicineName());
            d.setMedicineImage(i.getMedicineImage());
            d.setQuantity(i.getQuantity());
            d.setUnitPrice(i.getUnitPrice());
            d.setSubtotal(i.getUnitPrice().multiply(BigDecimal.valueOf(i.getQuantity())));
            return d;
        }).collect(Collectors.toList());

        dto.setItems(items);
        dto.setTotalAmount(items.stream()
                .map(CartDTO.CartItemDTO::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add));
        return dto;
    }
}
