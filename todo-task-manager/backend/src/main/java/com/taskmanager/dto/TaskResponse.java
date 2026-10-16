package com.taskmanager.dto;

import com.taskmanager.entity.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record TaskResponse(
        Long id, String title, String description, Priority priority, Status status, Stage stage,
        String createdBy, LocalDate assignedDate, LocalDate dueDate,
        LocalDateTime createdAt, LocalDateTime updatedAt, boolean overdue) {

    public static TaskResponse from(Task t) {
        boolean overdue = t.getDueDate() != null
                && t.getDueDate().isBefore(LocalDate.now())
                && t.getStatus() != Status.COMPLETED;
        return new TaskResponse(t.getId(), t.getTitle(), t.getDescription(), t.getPriority(), t.getStatus(),
                t.getStage(), t.getCreatedBy(), t.getAssignedDate(), t.getDueDate(),
                t.getCreatedAt(), t.getUpdatedAt(), overdue);
    }
}
