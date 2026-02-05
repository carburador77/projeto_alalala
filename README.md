# Projeto Alalala

## Stack definida
- Frontend: React + Vite
- Backend: Node.js + Express
- Banco de dados: SQLite (migrações com Knex)

## Estrutura
```
frontend/
backend/
```

## Como iniciar

### Backend
```bash
cd backend
npm install
npm run migrate
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Healthchecks
- `GET /health`
- `GET /health/db`
