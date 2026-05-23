package com.healthCare.service;

import com.healthCare.exception.ResourceNotFoundException;
import com.healthCare.dto.AddressRequest;
import com.healthCare.dto.AddressResponse;
import com.healthCare.entity.Address;
import com.healthCare.entity.User;
import com.healthCare.entity.UserProfile;
import com.healthCare.repository.AddressRepository;
import com.healthCare.repository.UserProfileRepository;
import com.healthCare.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AddressService {

    private final AddressRepository addressRepository;
    private final UserProfileRepository userProfileRepository;
    private final UserRepository userRepository;

    public AddressService(AddressRepository addressRepository,
                          UserProfileRepository userProfileRepository,
                          UserRepository userRepository) {
        this.addressRepository = addressRepository;
        this.userProfileRepository = userProfileRepository;
        this.userRepository = userRepository;
    }

    // ── Add new address ────────────────────────────────────────────────────────

    @Transactional
    public AddressResponse addAddress(Long userId, AddressRequest req) {
        UserProfile profile = getUserProfile(userId);

        if (req.isDefault()) {
            clearExistingDefault(userId);
        }

        Address address = Address.builder()
                .userProfile(profile)
                .fullName(req.getFullName())
                .mobileNumber(req.getMobileNumber())
                .streetLine1(req.getStreetLine1())
                .streetLine2(req.getStreetLine2())
                .city(req.getCity())
                .state(req.getState())
                .pincode(req.getPincode())
                .country(req.getCountry())
                .label(req.getLabel())
                .isDefault(req.isDefault())
                .build();

        return toResponse(addressRepository.save(address));
    }

    // ── Get all addresses of a user ────────────────────────────────────────────

    public List<AddressResponse> getAllAddresses(Long userId) {
        return addressRepository.findByUserProfileId(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // Fetch ALL addresses across all users
    public List<AddressResponse> getAllAddresses() {
        return addressRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── Get single address ─────────────────────────────────────────────────────

    public AddressResponse getAddressById(Long userId, Long addressId) {
        Address address = getAddress(userId, addressId);
        return toResponse(address);
    }

    // ── Update address ─────────────────────────────────────────────────────────

    @Transactional
    public AddressResponse updateAddress(Long userId, AddressRequest req) {
        List<Address> addresses = addressRepository.findByUserProfileId(userId);
        if (addresses.isEmpty()) {
            throw new ResourceNotFoundException("No addresses found for userId: " + userId);
        }

        Address addressToUpdate = addresses.stream()
                .filter(Address::isDefault)
                .findFirst()
                .orElseGet(() -> addresses.stream()
                        .max(java.util.Comparator.comparing(Address::getCreatedAt))
                        .orElseThrow(() -> new ResourceNotFoundException("No addresses found for userId: " + userId)));

        if (req.isDefault() && !addressToUpdate.isDefault()) {
            clearExistingDefault(userId);
        }

        addressToUpdate.setFullName(req.getFullName());
        addressToUpdate.setMobileNumber(req.getMobileNumber());
        addressToUpdate.setStreetLine1(req.getStreetLine1());
        addressToUpdate.setStreetLine2(req.getStreetLine2());
        addressToUpdate.setCity(req.getCity());
        addressToUpdate.setState(req.getState());
        addressToUpdate.setPincode(req.getPincode());
        addressToUpdate.setCountry(req.getCountry());
        addressToUpdate.setLabel(req.getLabel());
        addressToUpdate.setDefault(req.isDefault());

        return toResponse(addressRepository.save(addressToUpdate));
    }

    // ── Delete address ─────────────────────────────────────────────────────────

    @Transactional
    public void deleteAddress(Long userId, Long addressId) {
        Address address = getAddress(userId, addressId);
        addressRepository.delete(address);
    }

    // ── Set default address ────────────────────────────────────────────────────

    @Transactional
    public AddressResponse setDefaultAddress(Long userId) {
        List<Address> addresses = addressRepository.findByUserProfileId(userId);
        if (addresses.isEmpty()) {
            throw new ResourceNotFoundException("No addresses found for userId: " + userId);
        }
        // Pick the most recently added address
        Address latest = addresses.stream()
                .max(java.util.Comparator.comparing(Address::getCreatedAt))
                .orElseThrow(() -> new ResourceNotFoundException("No addresses found for userId: " + userId));

        // Clear existing default
        clearExistingDefault(userId);

        latest.setDefault(true);
        return toResponse(addressRepository.save(latest));
    }

    // ── Private helpers ────────────────────────────────────────────────────────

    /**
     * Returns the UserProfile for the given userId.
     * If no UserProfile exists yet (e.g. older users created before profile auto-creation),
     * it is created automatically — same behaviour as Flipkart/Amazon first-address flow.
     */
    @Transactional
    private UserProfile getUserProfile(Long userId) {
        return userProfileRepository.findById(userId).orElseGet(() -> {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
            UserProfile newProfile = UserProfile.builder().user(user).build();
            return userProfileRepository.save(newProfile);
        });
    }

    private Address getAddress(Long userId, Long addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address", "id", addressId));
        if (!address.getUserProfile().getId().equals(userId)) {
            throw new ResourceNotFoundException("Address", "userId", userId);
        }
        return address;
    }

    private void clearExistingDefault(Long userId) {
        addressRepository.findByUserProfileIdAndIsDefaultTrue(userId)
                .ifPresent(a -> {
                    a.setDefault(false);
                    addressRepository.save(a);
                });
    }

    private AddressResponse toResponse(Address a) {
        AddressResponse res = new AddressResponse();
        res.setId(a.getId());
        res.setUserId(a.getUserProfile() != null ? a.getUserProfile().getId() : null);
        res.setFullName(a.getFullName());
        res.setMobileNumber(a.getMobileNumber());
        res.setStreetLine1(a.getStreetLine1());
        res.setStreetLine2(a.getStreetLine2());
        res.setCity(a.getCity());
        res.setState(a.getState());
        res.setPincode(a.getPincode());
        res.setCountry(a.getCountry());
        res.setLabel(a.getLabel());
        res.setDefault(a.isDefault());
        res.setCreatedAt(a.getCreatedAt());
        res.setUpdatedAt(a.getUpdatedAt());
        return res;
    }
}
