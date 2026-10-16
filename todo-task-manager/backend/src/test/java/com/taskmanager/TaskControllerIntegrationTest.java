package com.taskmanager;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskmanager.repository.TaskRepository;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class TaskControllerIntegrationTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper om;
    @Autowired TaskRepository repository;

    @BeforeEach
    void clean() {
        repository.deleteAll();
    }

    private Map<String, Object> payload(String title, String priority, String status, LocalDate due) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("title", title);
        m.put("description", "desc of " + title);
        m.put("priority", priority);
        m.put("status", status);
        m.put("dueDate", due.toString());
        return m;
    }

    private long create(String title, String priority, String status, LocalDate due) throws Exception {
        String body = mvc.perform(post("/api/tasks").contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsString(payload(title, priority, status, due))))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return om.readTree(body).get("id").asLong();
    }

    @Test
    void createTask_returns201WithBody() throws Exception {
        mvc.perform(post("/api/tasks").contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsString(payload("Write report", "HIGH", "PENDING", LocalDate.now().plusDays(3)))))
                .andExpect(status().isCreated())
                .andExpect(header().exists("Location"))
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.title").value("Write report"))
                .andExpect(jsonPath("$.stage").value("ASSIGNED"))
                .andExpect(jsonPath("$.createdBy").value("Me"))
                .andExpect(jsonPath("$.overdue").value(false));
    }

    @Test
    void createTask_blankTitle_returns400WithFieldError() throws Exception {
        mvc.perform(post("/api/tasks").contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsString(payload("   ", "LOW", "PENDING", LocalDate.now()))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.title").exists());
    }

    @Test
    void createTask_invalidPriority_returns400() throws Exception {
        mvc.perform(post("/api/tasks").contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsString(payload("X", "URGENT", "PENDING", LocalDate.now()))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.priority").exists());
    }

    @Test
    void createTask_invalidStatusAndDate_return400() throws Exception {
        mvc.perform(post("/api/tasks").contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsString(payload("X", "LOW", "DONE", LocalDate.now()))))
                .andExpect(status().isBadRequest());
        mvc.perform(post("/api/tasks").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"X\",\"priority\":\"LOW\",\"dueDate\":\"2026-13-45\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createTask_missingDueDate_returns400() throws Exception {
        mvc.perform(post("/api/tasks").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"X\",\"priority\":\"LOW\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.dueDate").exists());
    }

    @Test
    void getById_existingAndMissing() throws Exception {
        long id = create("Find me", "LOW", "PENDING", LocalDate.now().plusDays(1));
        mvc.perform(get("/api/tasks/{id}", id)).andExpect(status().isOk()).andExpect(jsonPath("$.title").value("Find me"));
        mvc.perform(get("/api/tasks/{id}", 999999)).andExpect(status().isNotFound());
    }

    @Test
    void updateTask_changesFields_andMissingReturns404() throws Exception {
        long id = create("Old", "LOW", "PENDING", LocalDate.now().plusDays(1));
        mvc.perform(put("/api/tasks/{id}", id).contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsString(payload("New", "HIGH", "IN_PROGRESS", LocalDate.now().plusDays(9)))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("New"))
                .andExpect(jsonPath("$.priority").value("HIGH"))
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"));
        mvc.perform(put("/api/tasks/{id}", 999999).contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsString(payload("N", "LOW", "PENDING", LocalDate.now()))))
                .andExpect(status().isNotFound());
    }

    @Test
    void patchStatus_updatesOnly_andRejectsInvalid() throws Exception {
        long id = create("Status", "MEDIUM", "PENDING", LocalDate.now().plusDays(1));
        mvc.perform(patch("/api/tasks/{id}/status", id).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"COMPLETED\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"))
                .andExpect(jsonPath("$.title").value("Status"));
        mvc.perform(patch("/api/tasks/{id}/status", id).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"NOPE\"}"))
                .andExpect(status().isBadRequest());
        mvc.perform(patch("/api/tasks/{id}/status", 999999).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"PENDING\"}"))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteTask_returns204ThenNotFound() throws Exception {
        long id = create("Bye", "LOW", "PENDING", LocalDate.now().plusDays(1));
        mvc.perform(delete("/api/tasks/{id}", id)).andExpect(status().isNoContent());
        mvc.perform(get("/api/tasks/{id}", id)).andExpect(status().isNotFound());
        mvc.perform(delete("/api/tasks/{id}", id)).andExpect(status().isNotFound());
    }

    @Test
    void list_supportsPaginationFiltersSearchAndSorting() throws Exception {
        LocalDate d = LocalDate.now().plusDays(5);
        create("Study maths", "HIGH", "PENDING", d);
        create("Study physics", "LOW", "IN_PROGRESS", d.plusDays(1));
        create("Buy groceries", "MEDIUM", "COMPLETED", d.plusDays(2));

        mvc.perform(get("/api/tasks?page=0&size=2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(2)))
                .andExpect(jsonPath("$.totalElements").value(3))
                .andExpect(jsonPath("$.totalPages").value(2));

        mvc.perform(get("/api/tasks?status=PENDING")).andExpect(jsonPath("$.totalElements").value(1));
        mvc.perform(get("/api/tasks?search=study")).andExpect(jsonPath("$.totalElements").value(2));
        mvc.perform(get("/api/tasks?search=DESC OF BUY")).andExpect(jsonPath("$.totalElements").value(1));
        mvc.perform(get("/api/tasks?search=study&status=IN_PROGRESS")).andExpect(jsonPath("$.totalElements").value(1));
        mvc.perform(get("/api/tasks?dueDate=" + d)).andExpect(jsonPath("$.totalElements").value(1));
        mvc.perform(get("/api/tasks?priority=HIGH")).andExpect(jsonPath("$.totalElements").value(1));
        mvc.perform(get("/api/tasks?sort=title,asc"))
                .andExpect(jsonPath("$.content[0].title").value("Buy groceries"));
        mvc.perform(get("/api/tasks?status=BOGUS")).andExpect(status().isBadRequest());
        mvc.perform(get("/api/tasks?sort=password,asc")).andExpect(status().isBadRequest());
    }

    @Test
    void statistics_countsOverdueOnlyForIncompleteTasks() throws Exception {
        LocalDate past = LocalDate.now().minusDays(3);
        LocalDate future = LocalDate.now().plusDays(3);
        create("Late pending", "HIGH", "PENDING", past);
        create("Late in progress", "HIGH", "IN_PROGRESS", past);
        create("Late but done", "LOW", "COMPLETED", past);
        create("On time", "LOW", "PENDING", future);

        mvc.perform(get("/api/tasks/statistics"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(4))
                .andExpect(jsonPath("$.pending").value(2))
                .andExpect(jsonPath("$.inProgress").value(1))
                .andExpect(jsonPath("$.completed").value(1))
                .andExpect(jsonPath("$.overdue").value(2));

        mvc.perform(get("/api/tasks?overdue=true")).andExpect(jsonPath("$.totalElements").value(2));
    }
}
