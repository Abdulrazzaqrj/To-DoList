package com.taskmanager.service;

import com.taskmanager.dto.*;
import com.taskmanager.entity.*;
import com.taskmanager.exception.ResourceNotFoundException;
import com.taskmanager.repository.TaskRepository;
import java.time.LocalDate;
import java.util.Set;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class TaskService {

    private static final Set<String> SORTABLE =
            Set.of("id", "title", "priority", "status", "createdBy", "assignedDate", "dueDate", "createdAt");

    private final TaskRepository repository;

    public TaskService(TaskRepository repository) {
        this.repository = repository;
    }

    public TaskResponse create(TaskRequest request) {
        Task task = new Task();
        apply(task, request);
        return TaskResponse.from(repository.save(task));
    }

    @Transactional(readOnly = true)
    public PageResponse<TaskResponse> search(String search, Status status, Priority priority, Stage stage,
                                             LocalDate dueDate, LocalDate dueFrom, LocalDate dueTo,
                                             boolean overdue, int page, int size, String sort) {
        Specification<Task> spec = (root, query, cb) -> cb.conjunction();

        if (search != null && !search.isBlank()) {
            String like = "%" + search.trim().toLowerCase() + "%";
            spec = spec.and((r, q, cb) -> cb.or(
                    cb.like(cb.lower(r.get("title")), like),
                    cb.like(cb.lower(r.get("description")), like)));
        }
        if (status != null) spec = spec.and((r, q, cb) -> cb.equal(r.get("status"), status));
        if (priority != null) spec = spec.and((r, q, cb) -> cb.equal(r.get("priority"), priority));
        if (stage != null) spec = spec.and((r, q, cb) -> cb.equal(r.get("stage"), stage));
        if (dueDate != null) spec = spec.and((r, q, cb) -> cb.equal(r.get("dueDate"), dueDate));
        if (dueFrom != null) spec = spec.and((r, q, cb) -> cb.greaterThanOrEqualTo(r.<LocalDate>get("dueDate"), dueFrom));
        if (dueTo != null) spec = spec.and((r, q, cb) -> cb.lessThanOrEqualTo(r.<LocalDate>get("dueDate"), dueTo));
        if (overdue) {
            LocalDate today = LocalDate.now();
            spec = spec.and((r, q, cb) -> cb.and(
                    cb.lessThan(r.<LocalDate>get("dueDate"), today),
                    cb.notEqual(r.get("status"), Status.COMPLETED)));
        }

        PageRequest pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 200), parseSort(sort));
        return PageResponse.of(repository.findAll(spec, pageable).map(TaskResponse::from));
    }

    @Transactional(readOnly = true)
    public TaskResponse get(Long id) {
        return TaskResponse.from(find(id));
    }

    public TaskResponse update(Long id, TaskRequest request) {
        Task task = find(id);
        apply(task, request);
        return TaskResponse.from(repository.save(task));
    }

    public TaskResponse updateStatus(Long id, Status status) {
        Task task = find(id);
        task.setStatus(status);
        return TaskResponse.from(repository.save(task));
    }

    public void delete(Long id) {
        repository.delete(find(id));
    }

    @Transactional(readOnly = true)
    public StatisticsResponse statistics() {
        return new StatisticsResponse(
                repository.count(),
                repository.countByStatus(Status.PENDING),
                repository.countByStatus(Status.IN_PROGRESS),
                repository.countByStatus(Status.COMPLETED),
                repository.countByDueDateBeforeAndStatusNot(LocalDate.now(), Status.COMPLETED));
    }

    private Task find(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task with id " + id + " not found"));
    }

    private void apply(Task t, TaskRequest r) {
        t.setTitle(r.title().trim());
        t.setDescription(r.description() == null || r.description().isBlank() ? null : r.description().trim());
        t.setPriority(r.priority());
        t.setDueDate(r.dueDate());
        if (r.status() != null) t.setStatus(r.status());
        else if (t.getStatus() == null) t.setStatus(Status.PENDING);
        if (r.stage() != null) t.setStage(r.stage());
        else if (t.getStage() == null) t.setStage(Stage.ASSIGNED);
        if (r.createdBy() != null && !r.createdBy().isBlank()) t.setCreatedBy(r.createdBy().trim());
        else if (t.getCreatedBy() == null) t.setCreatedBy("Me");
        if (t.getAssignedDate() == null) t.setAssignedDate(LocalDate.now());
    }

    private Sort parseSort(String sort) {
        Sort tieBreaker = Sort.by(Sort.Direction.DESC, "id");
        if (sort == null || sort.isBlank()) return tieBreaker;
        String[] parts = sort.split(",");
        String field = parts[0].trim();
        if (!SORTABLE.contains(field)) {
            throw new IllegalArgumentException("Unsupported sort field '" + field + "'. Allowed: " + SORTABLE);
        }
        Sort.Direction dir = parts.length > 1 && parts[1].trim().equalsIgnoreCase("asc")
                ? Sort.Direction.ASC : Sort.Direction.DESC;
        return Sort.by(dir, field).and(tieBreaker);
    }
}
