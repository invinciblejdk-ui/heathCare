package com.healthCare.controller;

import com.healthCare.dto.AddressRequest;
import com.healthCare.dto.AddressResponse;
import com.healthCare.dto.ApiResponse;
import com.healthCare.service.AddressService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/restful/v1/onboarding")
public class AddressController {

    private final AddressService addressService;

    public AddressController(AddressService addressService) {
        this.addressService = addressService;
    }


    @PostMapping("/saveAddress")
    public ResponseEntity<ApiResponse<AddressResponse>> saveAddress(
            Authentication auth,
            @Valid @RequestBody AddressRequest request) {
        Long userId = (Long) auth.getDetails();
        AddressResponse data = addressService.addAddress(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Address saved successfully", data));
    }


    @GetMapping("/getAddresses")
    public ResponseEntity<ApiResponse<List<AddressResponse>>> getAddresses() {
        List<AddressResponse> data = addressService.getAllAddresses();
        if (data.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("No addresses found"));
        }
        return ResponseEntity.ok(ApiResponse.success("Addresses fetched successfully", data));
    }


    @GetMapping("/getAddress/{userId}")
    public ResponseEntity<ApiResponse<List<AddressResponse>>> getAddressByUserId(
            @PathVariable Long userId) {
        List<AddressResponse> data = addressService.getAllAddresses(userId);
        if (data.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("No addresses found for userId: " + userId));
        }
        return ResponseEntity.ok(ApiResponse.success("Addresses fetched successfully", data));
    }


    @PutMapping("/updateAddress/{userId}")
    public ResponseEntity<ApiResponse<AddressResponse>> updateAddress(
            @PathVariable Long userId,
            @Valid @RequestBody AddressRequest request) {
        AddressResponse data = addressService.updateAddress(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Address updated successfully", data));
    }


    @DeleteMapping("/deleteAddress/{userId}")
    public ResponseEntity<ApiResponse<Void>> deleteAddress(
            @PathVariable Long userId,
            @RequestParam Long addressId) {
        addressService.deleteAddress(userId, addressId);
        return ResponseEntity.ok(ApiResponse.success("Address deleted successfully", null));
    }


    @PatchMapping("/setDefaultAddress/{userId}")
    public ResponseEntity<ApiResponse<AddressResponse>> setDefaultAddress(
            @PathVariable Long userId) {
        AddressResponse data = addressService.setDefaultAddress(userId);
        return ResponseEntity.ok(ApiResponse.success("Default address updated successfully", data));
    }
}
