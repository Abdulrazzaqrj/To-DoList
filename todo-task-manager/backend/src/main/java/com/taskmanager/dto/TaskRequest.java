package com.taskmanager.dto;

import com.taskmanager.entity.Priority;
import com.taskmanager.entity.Stage;
import com.taskmanager.entity.Status;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

@Schema(description = "Payload used to create or update a task")
public record TaskRequest(
        @Schema(example = "Prepare sprint report")
        @NotBlank(message = "Task title is required")
        @Size(max = 150, message = "Title must be at most 150 characters")
        String title,

        @Schema(example = "Summarise velocity and blockers")
        @Size(max = 2000, message = "Description must be at most 2000 characters")
        String description,

        @Schema(example = "2026-12-31", description = "Format yyyy-MM-dd")
        @NotNull(message = "Due date is required")
        LocalDate dueDate,

        @NotNull(message = "Priority is required (LOW, MEDIUM, HIGH)")
        Priority priority,

        @Schema(description = "Defaults to PENDING on create")
        Status status,

        @Schema(description = "UI tab: ASSIGNED, ACCEPTED or REVIEW. Defaults to ASSIGNED")
        Stage stage,

        @Schema(example = "Maia", description = "Defaults to 'Me' on create")
        @Size(max = 100, message = "Created by must be at most 100 characters")
        String createdBy) {
}
