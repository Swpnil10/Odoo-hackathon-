# EcoSphere ESG Platform Backend & Demo Dashboard

EcoSphere is a premium, enterprise-grade ESG (Environmental, Social, and Governance) Management Platform built for hackathons, optimized for clean architecture, SOLID principles, and AI capabilities.

This project delivers a complete backend foundation and an interactive Single Page Application (SPA) dashboard served directly from the FastAPI root path (`/`).

---

## System Architecture

```text
               +------------------------------------------------------+
               |               EcoSphere Client UI                    |
               |       (Single Page Dashboard served at root '/')     |
               +---------------------------+--------------------------+
                                           |
                                   HTTP REST / JSON
                                           v
               +---------------------------+--------------------------+
               |              FastAPI Application Routing             |
               +--+------------------+------------------+-----------+-+
                  |                  |                  |           |
                  v                  v                  v           v
          +-------+-------+  +-------+-------+  +-------+-------+  ++----------+
          | Auth Router   |  | Dept Router   |  | Policy Router |  | AI Router |
          +-------+-------+  +-------+-------+  +-------+-------+  ++-----+----+
                  |                  |                  |                 |
                  v                  v                  v                 v
          +-------+-------+  +-------+-------+  +-------+-------+  +------+----+
          | Auth Service  |  | Dept Service  |  | Policy Service|  | Gemini    |
          +-------+-------+  +-------+-------+  +-------+-------+  | Service   |
                  |                  |                  |          +------+----+
                  v                  v                  v                 |
          +-------+-------+  +-------+-------+  +-------+-------+         |
          | User Repos    |  | Dept Repos    |  | Policy Repos  |         |
          +-------+-------+  +-------+-------+  +-------+-------+         |
                  |                  |                  |                 |
                  v                  v                  v                 v
         +--------+------------------+------------------+--------+ +------+-----+
         |                  SQLAlchemy ORM                       | | google-genai|
         +---------------------------+---------------------------+ +------+-----+
                                     |                                    |
                                     v                                    v
                            +--------+-------+                   +--------+-----+
                            |   PostgreSQL   |                   |  Google      |
                            |   (Or SQLite)  |                   |  Gemini API  |
                            +----------------+                   +--------------+
```

---

## Core Modules Description

- **`app/main.py`**: The application entry point. Initializes logging, configures CORS, mounts consolidated routers, sets up global error exception handlers, and serves the UI dashboard SPA at `/`.
- **`app/api/`**: Exposes RESTful endpoints. Bundles auth, departments, categories, policies, and AI services. Also exports the `/demo/seed` idempotent data seeder endpoint.
- **`app/ai/`**: Decouples the application from LLM providers using the abstract interface `BaseLLMService`. `GeminiService` implements this using the **`google-genai`** SDK, structured schema validations, configurable text prompts, and transient failures retry handlers.
- **`app/repositories/`**: Implements the Repository Pattern, abstracting database queries using generic SQLAlchemy 2.0 select structures.
- **`app/models/`**: Maps SQLAlchemy database tables (User, Department, Category, Policy).
- **`app/schemas/`**: Enforces strict Pydantic v2 data range validation for inputs and responses.
- **`app/middleware/exception_handler.py`**: Intercepts unhandled HTTP, validation, and database errors, formatting them into standardized JSON error envelopes.
- **`app/utils/deps.py`**: Provides session factories and verifies JWT permissions for Role-Based Access Control (RBAC).

---

## Running the Platform (Single Command)

### Option 1: Run with Docker Compose (Recommended)
Make sure you have Docker running, then execute:
```bash
docker compose up --build
```
Once healthy, access:
- **Interactive UI Dashboard**: [http://localhost:8000/](http://localhost:8000/)
- **Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### Option 2: Run Locally (Python 3.11)

1. **Activate the Virtual Environment**:
   ```bash
   .\venv\Scripts\activate
   ```

2. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure Environment Variables**:
   Verify your `.env` contains:
   ```bash
   DATABASE_URL=sqlite:///./ecosphere.db
   ENVIRONMENT=development
   GEMINI_API_KEY="YOUR_API_KEY"
   ```

4. **Start the Server**:
   ```bash
   python -m uvicorn app.main:app --reload
   ```
   Open **[http://localhost:8000/](http://localhost:8000/)** in your browser.

---

## Demo Mode & Default Credentials

We include a floating **"Activate Demo Mode (One-Click Setup)"** shortcut on the login screen. Clicking this button:
1. Seeds the database with default departments, policies, and categories.
2. Registers default test accounts.
3. Automatically authenticates the user as `admin@ecosphere.com` and redirects to the dashboard instantly.

### Manual Test Credentials
| Account Email | Password | Role |
| :--- | :--- | :--- |
| `admin@ecosphere.com` | `adminpassword` | **Admin** (Read/Write/Delete) |
| `manager@ecosphere.com` | `managerpassword` | **Manager** (Read/Write) |
| `employee@ecosphere.com` | `employeepassword` | **Employee** (Read-Only) |

---

## API Documentation

### 1. Authentication Endpoints
- `POST /api/v1/auth/register`: Register an Employee.
- `POST /api/v1/auth/login`: Retrieve OAuth2 Bearer JWT.
- `GET /api/v1/auth/me`: Fetch authenticated user profile details.

### 2. Department & Policy CRUD
- `GET /api/v1/departments/` & `GET /api/v1/departments/{id}`: List or retrieve departments.
- `POST /api/v1/departments/` & `PUT /api/v1/departments/{id}`: Create or update departments (restricted to Admin/Manager).
- `DELETE /api/v1/departments/{id}`: Hard-delete a department (restricted to Admin).
- `GET /api/v1/policies/` & `GET /api/v1/policies/{id}`: List or retrieve policies.
- `POST /api/v1/policies/` & `PUT /api/v1/policies/{id}`: Create or update policies (restricted to Admin/Manager).
- `DELETE /api/v1/policies/{id}`: Delete a policy (restricted to Admin).

### 3. AI Endpoints
- `POST /api/v1/ai/policy-summary`: Summarizes policies into exactly 3 compliance-focused bullet points.
- `POST /api/v1/ai/esg-insights`: Computes overall health ratings and structured markdown recommendations from department metrics.
- `POST /api/v1/ai/advisor`: Chat consultant answering queries based on department scores. Returns out-of-scope warning for non-ESG queries.

---

## Running Unit Tests
Validate code compilation, Pydantic constraints, and API guards using pytest:
```bash
python -m pytest tests/
```
Output:
```text
tests/test_ai.py .......                                                 [100%]
======================= 7 passed in 10.18s ========================
```
