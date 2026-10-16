package com.taskmanager.dto;

import com.taskmanager.entity.Status;
import jakarta.validation.constraints.NotNull;

public record TaskStatusUpdateRequest(
        @NotNull(message = "Status is required (PENDING, IN_PROGRESS, COMPLETED)") Status status) {
}
