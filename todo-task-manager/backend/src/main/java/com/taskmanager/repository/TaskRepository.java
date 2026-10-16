package com.taskmanager.repository;

import com.taskmanager.entity.Status;
import com.taskmanager.entity.Task;
import java.time.LocalDate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long>, JpaSpecificationExecutor<Task> {

    long countByStatus(Status status);

    long countByDueDateBeforeAndStatusNot(LocalDate date, Status status);
}
