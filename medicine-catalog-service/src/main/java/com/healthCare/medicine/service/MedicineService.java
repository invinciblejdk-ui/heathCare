package com.healthCare.medicine.service;

import com.healthCare.medicine.dto.CreateMedicineRequest;
import com.healthCare.medicine.dto.MedicineDTO;
import com.healthCare.medicine.entity.Category;
import com.healthCare.medicine.entity.Medicine;
import com.healthCare.medicine.repository.CategoryRepository;
import com.healthCare.medicine.repository.MedicineRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MedicineService {

    private final MedicineRepository medicineRepository;
    private final CategoryRepository categoryRepository;

    public MedicineService(MedicineRepository medicineRepository, CategoryRepository categoryRepository) {
        this.medicineRepository = medicineRepository;
        this.categoryRepository = categoryRepository;
    }

    public Page<MedicineDTO> search(String q, String brand, Long categoryId, int page, int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("name"));
        return medicineRepository.search(q, brand, categoryId, pageable).map(this::toDTO);
    }

    public MedicineDTO getById(Long id) {
        return medicineRepository.findById(id)
                .filter(Medicine::isActive)
                .map(this::toDTO)
                .orElseThrow(() -> new RuntimeException("Medicine not found"));
    }

    public List<Category> getCategories() {
        return categoryRepository.findByIsActiveTrue();
    }

    public Page<MedicineDTO> getLatest(int page, int size) {
        return medicineRepository.findByIsActiveTrueOrderByCreatedAtDesc(
                PageRequest.of(page, size)).map(this::toDTO);
    }

    @Transactional
    public MedicineDTO create(CreateMedicineRequest req) {
        Category cat = categoryRepository.findById(req.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));
        Medicine medicine = Medicine.builder()
                .name(req.getName())
                .brand(req.getBrand())
                .saltName(req.getSaltName())
                .chemicalName(req.getChemicalName())
                .category(cat)
                .price(req.getPrice())
                .stockQuantity(req.getStockQuantity())
                .imageUrl(req.getImageUrl())
                .description(req.getDescription())
                .dosageForm(req.getDosageForm())
                .strength(req.getStrength())
                .requiresPrescription(req.isRequiresPrescription())
                .build();
        return toDTO(medicineRepository.save(medicine));
    }

    @Transactional
    public MedicineDTO update(Long id, CreateMedicineRequest req) {
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medicine not found"));
        if (req.getCategoryId() != null) {
            medicine.setCategory(categoryRepository.findById(req.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found")));
        }
        if (req.getName() != null)        medicine.setName(req.getName());
        if (req.getBrand() != null)       medicine.setBrand(req.getBrand());
        if (req.getSaltName() != null)    medicine.setSaltName(req.getSaltName());
        if (req.getChemicalName() != null) medicine.setChemicalName(req.getChemicalName());
        if (req.getPrice() != null)       medicine.setPrice(req.getPrice());
        if (req.getStockQuantity() != null) medicine.setStockQuantity(req.getStockQuantity());
        if (req.getImageUrl() != null)    medicine.setImageUrl(req.getImageUrl());
        if (req.getDescription() != null) medicine.setDescription(req.getDescription());
        if (req.getDosageForm() != null)  medicine.setDosageForm(req.getDosageForm());
        if (req.getStrength() != null)    medicine.setStrength(req.getStrength());
        return toDTO(medicineRepository.save(medicine));
    }

    @Transactional
    public void delete(Long id) {
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medicine not found"));
        medicine.setActive(false);
        medicineRepository.save(medicine);
    }

    public MedicineDTO toDTO(Medicine m) {
        MedicineDTO dto = new MedicineDTO();
        dto.setId(m.getId());
        dto.setName(m.getName());
        dto.setBrand(m.getBrand());
        dto.setSaltName(m.getSaltName());
        dto.setChemicalName(m.getChemicalName());
        dto.setPrice(m.getPrice());
        dto.setStockQuantity(m.getStockQuantity());
        dto.setImageUrl(m.getImageUrl());
        dto.setDescription(m.getDescription());
        dto.setDosageForm(m.getDosageForm());
        dto.setStrength(m.getStrength());
        dto.setRequiresPrescription(m.isRequiresPrescription());
        dto.setInStock(m.getStockQuantity() > 0);
        if (m.getCategory() != null) {
            dto.setCategoryId(m.getCategory().getId());
            dto.setCategoryName(m.getCategory().getName());
        }
        return dto;
    }
}
