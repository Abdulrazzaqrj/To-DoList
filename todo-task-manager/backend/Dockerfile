
FROM maven:3.9.9-eclipse-temurin-17 AS build

WORKDIR /workspace/backend

COPY todo-task-manager/backend/pom.xml ./pom.xml
COPY todo-task-manager/backend/src ./src

RUN mvn -B package -DskipTests

FROM eclipse-temurin:17-jre

WORKDIR /app

COPY --from=build /workspace/backend/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
