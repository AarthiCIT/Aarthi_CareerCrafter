# CareerCrafter Backend

Spring Boot REST API backend for CareerCrafter job portal.

## Stack
- Java 17, Spring Boot 3.2.5
- Spring Data JPA, MySQL
- Spring Security + JWT
- ModelMapper, Lombok
- JUnit 5 + Mockito for unit tests

## Modules
- User registration/login with role based access (EMPLOYER, JOB_SEEKER, ADMIN)
- Job listing management for employers
- Job application workflow for job seekers
- Resume database with share/update support

## Running locally
1. Create a MySQL database named `careercrafter_db`
2. Update `src/main/resources/application.properties` with your DB credentials, or set the `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` environment variables
3. Run `mvn clean install`
4. Run `mvn spring-boot:run`
5. Swagger UI available at `http://localhost:8080/swagger-ui.html`

## Running tests
```
mvn test
```

## Project Structure
```
src/main/java/com/careercrafter
  ├── config          - security and app level beans
  ├── controller       - REST controllers
  ├── dto              - request/response DTOs with validation
  ├── entity           - JPA entities
  ├── enums            - Role, ApplicationStatus
  ├── exception        - custom exceptions + global handler
  ├── repository       - Spring Data JPA repositories
  ├── security         - JWT utility
  └── service          - service interfaces + impl
```
