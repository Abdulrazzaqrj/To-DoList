# To-Do Task Manager

Full-stack task manager: **HTML5 / CSS3 / vanilla JavaScript** frontend (served by Spring Boot), **Java 17 + Spring Boot 3.3** REST API,
**MySQL 8** storage, **Swagger UI** documentation. The UI follows the supplied "My Tasks" reference screenshot (navy sidebar, tabs,
filter toolbar, task table with badges, pagination) and adds dark mode, a task form, details and delete dialogs, search and more.

The project is organized into two top-level code folders: `frontend/` contains the UI, and `backend/` contains the Spring Boot
application, tests, Maven build, and database scripts. The backend copies the frontend files into its packaged static resources
during the Maven build.

> **Status honesty:** this project was written without access to Maven Central or a MySQL server, so it has **not been built or run
> by the author**. Follow the checklist in section 7 to verify it on your machine. The frontend JavaScript passed a syntax check.

## 1. Prerequisites
| Tool | Version |
|---|---|
| JDK | 17 or newer |
| Maven | 3.9+ (or use IntelliJ's bundled Maven) |
| MySQL Server | 8.x, **installed and running** (SQLyog is only the admin client) |
| SQLyog | any recent version (optional, for inspecting data) |

## 2. Create the database
**Option A – automatic:** the JDBC URL contains `createDatabaseIfNotExist=true` and Hibernate (`ddl-auto=update`) creates the `tasks` table on first start.

**Option B – manual (recommended, via SQLyog):**
1. Open SQLyog → *New connection* → host `localhost`, port `3306`, your MySQL user/password → *Connect*.
2. *File → Open* `backend/database/schema.sql` → press **Ctrl+Shift+F9** (execute all).
3. Optional demo data: open and run `backend/database/sample-data.sql`.

## 3. Configure credentials (no secrets in source control)
Defaults: host `localhost`, port `3306`, db `todo_task_manager`, user `root`, **empty password**. Override with environment variables:

```bash
# Linux / macOS
export DB_USERNAME=root
export DB_PASSWORD=your_password
# Windows PowerShell
$env:DB_USERNAME="root"; $env:DB_PASSWORD="your_password"
```
Other variables: `DB_HOST`, `DB_PORT`, `DB_NAME`. Alternatively create `application-local.properties` in `backend/`
(git-ignored) containing `spring.datasource.password=your_password`.
In IntelliJ: *Run → Edit Configurations → Environment variables*.

## 4. Run
```bash
cd backend
mvn spring-boot:run
```
or run `TaskManagerApplication` from IntelliJ (File → Open → select `backend/pom.xml` → *Open as Project*).

* App (frontend + API): http://localhost:8080
* Swagger UI: http://localhost:8080/swagger-ui/index.html
* OpenAPI JSON: http://localhost:8080/v3/api-docs

## 5. Deploy with Docker
Build from the project root (the build context must include both `backend/` and `frontend/`):

```bash
docker build -f backend/Dockerfile -t todo-task-manager:latest .
```

Run the app and point it at a reachable MySQL server. For MySQL running on the same machine as Docker Desktop, use
`host.docker.internal`; for a database container, use its hostname on the shared Docker network:

```bash
docker run --name todo-task-manager --publish 8080:8080 \
  --env DB_HOST=host.docker.internal \
  --env DB_PORT=3306 \
  --env DB_NAME=todo_task_manager \
  --env DB_USERNAME=root \
  --env DB_PASSWORD=your_password \
  todo-task-manager:latest
```

The container serves the frontend and API on port 8080. Supply database credentials through environment variables and do not
put real credentials in the Dockerfile or image.

## 6. REST API (`/api/tasks`)
| Method | Path | Purpose | Success |
|---|---|---|---|
| POST | `/api/tasks` | Create task | 201 |
| GET | `/api/tasks` | List with `page,size,search,status,priority,stage,dueDate,dueFrom,dueTo,overdue,sort` | 200 |
| GET | `/api/tasks/{id}` | Get one | 200 / 404 |
| PUT | `/api/tasks/{id}` | Update | 200 / 400 / 404 |
| PATCH | `/api/tasks/{id}/status` | Change status only | 200 / 400 / 404 |
| DELETE | `/api/tasks/{id}` | Delete | 204 / 404 |
| GET | `/api/tasks/statistics` | total / pending / inProgress / completed / overdue | 200 |

Enums: `priority` = `LOW|MEDIUM|HIGH`, `status` = `PENDING|IN_PROGRESS|COMPLETED`, `stage` = `ASSIGNED|ACCEPTED|REVIEW`. Dates: `yyyy-MM-dd`.
Example: `GET /api/tasks?page=0&size=10&status=PENDING&search=study&sort=dueDate,asc`

Create body:
```json
{ "title": "Prepare sprint report", "description": "Velocity and blockers", "dueDate": "2026-12-31",
  "priority": "HIGH", "status": "PENDING", "stage": "ASSIGNED", "createdBy": "Maia" }
```
Errors share one shape: `{ timestamp, status, error, message, errors: { field: message } }`.

### Design notes
* The three tabs (**Assigned / Accepted / Review**) map to the `stage` column, so they are real, independent task collections. New tasks go into the active tab.
* "Date picker" filters by **exact due date**; it combines with status, search and tab.
* *Overdue* = `dueDate < today` and status not Completed (computed in the API; red row marker in the UI).
* Table actions: **view**, **edit**, **delete**, **⋮** (change status via PATCH). Completed tasks show view, *reopen* (eye icon, as in the reference) and ⋮ only.
* Sidebar: Dashboard/Task management (top), **Statistics** dialog, **Reports** (exports CSV), **Calendar** (click a day to filter), **dark mode**, **Settings** (your name, rows per page, theme).
* Header: expandable search, bell (lists overdue tasks), user menu. Table headers are clickable to sort.

## 7. Tests
```bash
cd backend
mvn test
```
`TaskControllerIntegrationTest` (JUnit 5 + MockMvc) covers create/read/update/delete, PATCH status, validation (blank title, bad enum, bad date, missing date),
404s, pagination, filters, search, sorting and statistics. Tests use an **in-memory H2 database in test scope only** so they run without MySQL;
the application itself always uses MySQL.

## 8. Manual verification checklist
1. Start MySQL, run the app, open http://localhost:8080 → empty table message (or demo rows).
2. Create a task → toast appears, row shows without reload. In SQLyog run `SELECT * FROM tasks;` → row exists.
3. Edit it (change priority/status) → `SELECT` shows the update and a new `updated_at`.
4. ⋮ → *Mark as Completed* → row shows green badge, actions change.
5. Search, status filter, date filter, *Reset*; change rows per page; use prev/next.
6. Delete → confirm dialog → row gone in UI and in SQLyog.
7. Stop and restart the app → remaining rows persist.
8. Stop MySQL → reload page → red error banner + toast (no silent failures).
9. Swagger UI: try each endpoint, including a 400 (blank title) and 404 (id 999999).
10. Toggle dark mode, resize the window to tablet/phone widths.

## 9. Production notes
```bash
cd backend
mvn clean package
java -jar target/todo-task-manager-1.0.0.jar      # with DB_* environment variables set
```
Use a dedicated MySQL user with limited privileges, set `spring.jpa.hibernate.ddl-auto=validate` once the schema exists, put the app behind HTTPS (e.g. nginx), and keep credentials in environment variables or a secrets manager.

## 10. Project structure
```
todo-task-manager/
├── README.md
├── .gitignore
├── .dockerignore
├── frontend/
│   ├── index.html
│   ├── css/style.css
│   └── js/app.js
└── backend/
    ├── Dockerfile
    ├── pom.xml
    ├── database/schema.sql, sample-data.sql
    └── src/
        ├── main/java/com/taskmanager/ (application, API, domain, and services)
        ├── main/resources/application.properties
        └── test/ (integration tests and test properties)
```
