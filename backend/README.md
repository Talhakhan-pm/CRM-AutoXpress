# AutoXpress CRM Backend

Backend API for AutoXpress CRM, a modern CRM for auto parts resellers.

## Setup

1. Clone the repository and navigate to the backend directory:
```bash
cd AutoXpress_CRM/backend
```

2. Create a virtual environment and activate it:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file from the example:
```bash
cp .env.example .env
```

5. Edit the `.env` file with your database credentials and other settings

## Database Setup

The application can use either PostgreSQL (recommended for production) or SQLite (for development).

### Using PostgreSQL

1. Make sure PostgreSQL is installed and running
2. Create a database for the application:
```sql
CREATE DATABASE autoxpress_crm;
```
3. Update the `DATABASE_URL` in your `.env` file:
```
DATABASE_URL=postgresql://username:password@localhost:5432/autoxpress_crm
```

### Using SQLite (for development)

1. Uncomment the SQLite `DATABASE_URL` in your `.env` file:
```
DATABASE_URL=sqlite:///./autoxpress_crm.db
```

## Migrations

Initialize the database and create tables:

```bash
# Create initial migration
alembic revision --autogenerate -m "Initial migration"

# Apply migrations
alembic upgrade head
```

## Running the Application

Start the development server:

```bash
uvicorn app.main:app --reload
```

The API will be available at http://localhost:8000

## API Documentation

Once the server is running, view the interactive API documentation at:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

### Callbacks

- `GET /api/v1/callbacks/` - List all callbacks (with optional filtering)
- `POST /api/v1/callbacks/` - Create a new callback
- `GET /api/v1/callbacks/{callback_id}` - Get a specific callback
- `PUT /api/v1/callbacks/{callback_id}` - Update a callback
- `DELETE /api/v1/callbacks/{callback_id}` - Delete a callback
- `GET /api/v1/callbacks/search/?query=search_term` - Search for callbacks