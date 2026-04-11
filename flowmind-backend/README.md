# FlowMind Backend Gateway

This is the FastAPI backend for the FlowMind Agentic MCP Gateway.

## Requirements
- Python 3.9+
- MongoDB

## MongoDB Setup & Connection Guide

The API uses **MongoDB** as its database. You do not need to manually create the database or the collections (`users`, `workflows`, etc.) — the backend's ORM (Beanie) will automatically create them for you on the first startup!

**Option A: Local MongoDB (Recommended for Dev)**
1. Download MongoDB Community Edition: https://www.mongodb.com/try/download/community
2. Install with default settings (includes MongoDB Compass GUI).
3. Ensure the MongoDB service is running on your machine.
4. Set the connection string in your `.env` file:
   ```env
   MONGODB_URL=mongodb://localhost:27017
   DB_NAME=flowmind
   ```

**Option B: MongoDB Atlas (Cloud)**
1. Go to https://cloud.mongodb.com and create a free tier cluster.
2. Under "Network Access", allow your IP address.
3. Under "Database Access", create a Database User and password.
4. Click "Connect" -> "Drivers" to get your connection string.
5. Set the connection string in your `.env` file:
   ```env
   MONGODB_URL=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   DB_NAME=flowmind
   ```

## Running the Backend

1. **Create Virtual Environment**
   ```bash
   python -m venv venv
   source venv/Scripts/activate  # Windows
   # or: source venv/bin/activate # Linux/Mac
   ```

2. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure Environment Variables**
   - Copy `.env.example` to `.env`
   - Set `SECRET_KEY` and `GOOGLE_CLIENT_ID`.
   - Ensure `MONGODB_URL` points to your MongoDB instance.

4. **Start Server**
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

## Development Mode vs MCP Integration

By default, the backend is configured to **mock** the MCP layer so you can develop the frontend without needing the AI service running.

To connect your actual MCP layer later:
1. Open `.env`
2. Set `MCP_DEV_MOCK=false`
3. Ensure `MCP_LAYER_URL` points to your running MCP service (e.g., `http://localhost:9000`).

See `MCP_CONNECTION_GUIDE.md` in the parent directory for full details on the MCP contract.
