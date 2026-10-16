package com.taskmanager.dto;

public record StatisticsResponse(long total, long pending, long inProgress, long completed, long overdue) {
}
