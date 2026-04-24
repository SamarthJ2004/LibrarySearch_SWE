# 📚 Campus Library Resource Search Engine

A unified search engine and catalog that aggregates all library resources — books, journals, and digital resources — in one place.

## Architecture

```
┌──────────────┐     ┌──────────────────┐     ┌───────────────────┐
│  React UI    │────▶│  Express API     │────▶│  Elasticsearch    │
│  (Vite)      │     │  (Node.js)       │     │  8.x              │
│  Port 5173   │     │  Port 5000       │     │  Port 9200        │
└──────────────┘     └──────────────────┘     └───────────────────┘
```

## Features

- **Keyword Search** with partial matching and synonym support
- **Filters** by author, subject, publication year, and resource type
- **Metadata Display** with title, authors, publisher, and direct links
- **Admin Panel** for resource CRUD management
- **Relevance Ranking** powered by Elasticsearch

## Prerequisites

- **Node.js** >= 18
- **Docker Desktop** (for Elasticsearch)

## Quick Start

```bash
# 1. Start Elasticsearch
docker-compose up -d elasticsearch

# 2. Setup backend
cd backend
npm install
npm run seed    # Create index & seed sample data
npm run dev     # Start API server on :5000

# 3. Setup frontend (new terminal)
cd frontend
npm install
npm run dev     # Start UI on :5173
```

Open [http://localhost:5173](http://localhost:5173) to use the search engine.

## Admin Access

- Navigate to the Admin page from the top navigation
- Login: `admin` / `admin123`

## Testing

```bash
# Unit tests (no Elasticsearch needed)
cd backend && npm test -- --testPathPattern="unit"

# Integration tests (Elasticsearch must be running)
cd backend && npm test -- --testPathPattern="integration"
```

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend  | React + Vite |
| Backend   | Node.js + Express |
| Search    | Elasticsearch 8.x |
| Auth      | JWT |
| Testing   | Jest + Supertest |
| DevOps    | Docker Compose |

<img width="1152" height="648" alt="image" src="https://github.com/user-attachments/assets/7f8871cc-3df8-498f-bd38-2d29735ea136" />

<img width="1152" height="648" alt="image" src="https://github.com/user-attachments/assets/276548f4-3e08-4380-977b-6b6f8337683b" />


