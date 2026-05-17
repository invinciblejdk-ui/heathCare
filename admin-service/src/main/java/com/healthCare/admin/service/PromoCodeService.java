package com.healthCare.admin.service;

import com.healthCare.admin.entity.PromoCode;
import com.healthCare.admin.repository.PromoCodeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class PromoCodeService {

    private final PromoCodeRepository promoCodeRepository;

    public PromoCodeService(PromoCodeRepository promoCodeRepository) {
        this.promoCodeRepository = promoCodeRepository;
    }

    public List<PromoCode> getAll() {
        return promoCodeRepository.findAll();
    }

    public PromoCode getByCode(String code) {
        return promoCodeRepository.findByCodeAndIsActiveTrue(code)
                .orElseThrow(() -> new RuntimeException("Invalid or expired promo code: " + code));
    }

    @Transactional
    public PromoCode create(PromoCode promoCode) {
        return promoCodeRepository.save(promoCode);
    }

    @Transactional
    public PromoCode update(Long id, PromoCode updated) {
        PromoCode existing = promoCodeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Promo code not found"));
        existing.setCode(updated.getCode());
        existing.setDiscountType(updated.getDiscountType());
        existing.setDiscountValue(updated.getDiscountValue());
        existing.setMinOrderAmount(updated.getMinOrderAmount());
        existing.setExpiryDate(updated.getExpiryDate());
        existing.setUsageLimit(updated.getUsageLimit());
        existing.setActive(updated.isActive());
        return promoCodeRepository.save(existing);
    }

    @Transactional
    public void delete(Long id) {
        PromoCode promo = promoCodeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Promo code not found"));
        promo.setActive(false);
        promoCodeRepository.save(promo);
    }

    /** Validate and apply promo — returns discount percentage/amount */
    public PromoCode validatePromoForOrder(String code, java.math.BigDecimal orderAmount) {
        PromoCode promo = getByCode(code);
        if (promo.getExpiryDate() != null && promo.getExpiryDate().isBefore(LocalDate.now())) {
            throw new RuntimeException("Promo code has expired");
        }
        if (promo.getUsageLimit() > 0 && promo.getUsedCount() >= promo.getUsageLimit()) {
            throw new RuntimeException("Promo code usage limit reached");
        }
        if (promo.getMinOrderAmount() != null && orderAmount.compareTo(promo.getMinOrderAmount()) < 0) {
            throw new RuntimeException("Order amount does not meet minimum for this promo");
        }
        return promo;
    }
}
