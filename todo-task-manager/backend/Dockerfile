FROM maven:3.9.9-eclipse-temurin-17 AS build

WORKDIR /workspace/backend
COPY backend/pom.xml ./pom.xml
COPY backend/src ./src
COPY frontend ../frontend
RUN mvn -B package

FROM eclipse-temurin:17-jre

WORKDIR /app
COPY --from=build /workspace/backend/target/todo-task-manager-*.jar /app/app.jar
EXPOSE 8080
USER 10001
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75.0", "-jar", "/app/app.jar"]
