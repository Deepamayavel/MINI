package com.mediguide.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "hospitals")
public class Hospital {
    @Id
    private String id;
    private String name;
    private String address;
    private String contact;
    private String city;
    private String state;
    private String pincode;
    private String type;
    private Boolean emergencyAvailable;
    private Boolean icuAvailable;
    private Double rating;
    private Integer bedCapacity;
    private String ambulanceContact;
    private String departments;
    private String accreditations;
    private String operatingHours;
    private String insuranceAccepted;
    private String websiteUrl;
}
