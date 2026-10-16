package com.taskmanager.controller;

import com.taskmanager.dto.*;
import com.taskmanager.entity.*;
import com.taskmanager.service.TaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.net.URI;
import java.time.LocalDate;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tasks")
@Tag(name = "Tasks", description = "Create, read, update, delete, filter and summarise tasks")
public class TaskController {

    private final TaskService service;

    public TaskController(TaskService service) {
        this.service = service;
    }

    @Operation(summary = "Create a task")
    @ApiResponse(responseCode = "201", description = "Task created")
    @ApiResponse(responseCode = "400", description = "Validation error")
    @PostMapping
    public ResponseEntity<TaskResponse> create(@Valid @RequestBody TaskRequest request) {
        TaskResponse created = service.create(request);
        return ResponseEntity.created(URI.create("/api/tasks/" + created.id())).body(created);
    }

    @Operation(summary = "List tasks with optional search, filters, sorting and pagination",
            description = "Example: GET /api/tasks?page=0&size=10&status=PENDING&search=study&sort=dueDate,asc")
    @ApiResponse(responseCode = "400", description = "Invalid filter or sort value")
    @GetMapping
    public PageResponse<TaskResponse> list(
            @Parameter(description = "Matches title or description (case-insensitive)") @RequestParam(required = false) String search,
            @RequestParam(required = false) Status status,
            @RequestParam(required = false) Priority priority,
            @Parameter(description = "UI tab: ASSIGNED, ACCEPTED, REVIEW") @RequestParam(required = false) Stage stage,
            @Parameter(description = "Exact due date, yyyy-MM-dd") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dueDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dueFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dueTo,
            @Parameter(description = "Only tasks past their due date and not completed") @RequestParam(defaultValue = "false") boolean overdue,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "field,direction e.g. dueDate,asc") @RequestParam(required = false) String sort) {
        return service.search(search, status, priority, stage, dueDate, dueFrom, dueTo, overdue, page, size, sort);
    }

    @Operation(summary = "Task statistics (total, pending, in progress, completed, overdue)")
    @GetMapping("/statistics")
    public StatisticsResponse statistics() {
        return service.statistics();
    }

    @Operation(summary = "Get a task by id")
    @ApiResponse(responseCode = "404", description = "Task not found")
    @GetMapping("/{id}")
    public TaskResponse get(@PathVariable Long id) {
        return service.get(id);
    }

    @Operation(summary = "Update a task")
    @ApiResponse(responseCode = "400", description = "Validation error")
    @ApiResponse(responseCode = "404", description = "Task not found")
    @PutMapping("/{id}")
    public TaskResponse update(@PathVariable Long id, @Valid @RequestBody TaskRequest request) {
        return service.update(id, request);
    }

    @Operation(summary = "Update only the status of a task")
    @ApiResponse(responseCode = "400", description = "Invalid status")
    @ApiResponse(responseCode = "404", description = "Task not found")
    @PatchMapping("/{id}/status")
    public TaskResponse updateStatus(@PathVariable Long id, @Valid @RequestBody TaskStatusUpdateRequest request) {
        return service.updateStatus(id, request.status());
    }

    @Operation(summary = "Delete a task")
    @ApiResponse(responseCode = "204", description = "Task deleted")
    @ApiResponse(responseCode = "404", description = "Task not found")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
