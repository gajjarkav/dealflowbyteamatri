# DealFlow API Backend

## Setup Instructions

1. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Environment Variables**
   Create a `.env` file based on `.env.example`. Make sure to provide a valid database URL (NeonDB/Postgres) and SMTP credentials if you plan to use `EMAIL_BACKEND=smtp`.

3. **Run Migrations**
   ```bash
   alembic upgrade head
   ```

4. **Seed Database**
   Creates default Admin, Manager, Rep, Finance, and Demo Customer accounts.
   ```bash
   python -m app.db.seed
   ```

5. **Start the Server**
   ```bash
   uvicorn main:app --reload
   ```

API Documentation (Swagger) is available at `http://127.0.0.1:8000/docs`.
