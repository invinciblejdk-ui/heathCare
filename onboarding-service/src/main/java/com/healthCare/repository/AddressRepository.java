package com.healthCare.repository;

import com.healthCare.entity.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AddressRepository extends JpaRepository<Address, Long> {

    // Find all addresses belonging to a user (via their profile id)
    List<Address> findByUserProfileId(Long userProfileId);

    // Find the current default address for a user
    Optional<Address> findByUserProfileIdAndIsDefaultTrue(Long userProfileId);
}
