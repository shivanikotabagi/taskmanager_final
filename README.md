# TaskFlow — Full-Stack Task Management System

Production-ready project management with RBAC, real-time WebSocket notifications, and audit logging.

## Tech Stack
- **Backend**: Spring Boot 3.2, Spring Security, JPA, WebSocket (STOMP)
- **Frontend**: React 18, React Router v6, Axios, SockJS/STOMP
- **Database**: MySQL 8
- **DevOps**: Docker, docker-compose, nginx

## Roles
| Role    | Can Do |
|---------|--------|
| ADMIN   | Everything — manage users, projects, tasks, view audit logs |
| MANAGER | See & manage only their assigned projects and tasks |
| USER    | See only projects they belong to; update assigned tasks |

## Quick Start

### Docker (easiest)
```bash
docker-compose up --build
# Frontend: http://localhost:3000
# Backend:  http://localhost:8080
```

### Local Dev
```bash
# 1. Run schema
mysql -u root -p < db/schema.sql

# 2. Set DB password in backend/src/main/resources/application.properties

# 3. Backend
cd backend && mvn spring-boot:run

# 4. Frontend
cd frontend && npm install && npm start
```

**Default login:** admin / Admin@123

## Features
- JWT authentication with refresh tokens
- Role-based access control (ADMIN / MANAGER / USER)
- Real-time in-app notifications via WebSocket (STOMP + SockJS)
- Kanban board view per project
- Full audit log trail with before/after diff
- Admin dashboard with stats
- Profile page with password change
- Docker + nginx production setup

## API Base URL
`http://localhost:8080/api`

Key endpoints:
- `POST /auth/login`
- `GET  /projects` (role-filtered)
- `GET  /tasks` (role-filtered)
- `GET  /dashboard/stats`
- `GET  /audit-logs` (ADMIN)
- `PATCH /profile/change-password`

## Environment
Backend: `backend/src/main/resources/application.properties`
Frontend: `frontend/.env`
