package com.mediguide.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SearchRequest {

    @NotBlank(message = "Symptom text is required")
    private String symptomText;

    @NotNull(message = "Input type is required")
    private InputType inputType;

    public enum InputType {
        TEXT,
        VOICE
    }
}
