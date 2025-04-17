# Online Bar Monorepo

This is a monorepo containing both the frontend and backend components of the Online Bar application.

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v20 or higher)
- npm (comes with Node.js)
- PostgreSQL (v14 or higher)
- Git

To check your Node.js version:
```bash
node -v
```

If you need to upgrade Node.js, we recommend using nvm (Node Version Manager):
```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc  # or ~/.zshrc

# Install and use latest LTS version
nvm install --lts
nvm use --lts
```

## Environment Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd online-bar
```

2. Set up environment variables:
```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your database credentials

# Frontend
cp frontend/.env.example frontend/.env
```

3. Install dependencies:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

## Database Setup

1. Create the database:
```bash
# Connect to PostgreSQL
psql -U postgres

# Create the database
CREATE DATABASE online_bar;
```

2. Run migrations:
```bash
cd backend
npm run migration:run
```

3. Seed initial data:
```bash
npm run seed
```

## Development Mode

1. Start the backend server:
```bash
cd backend
npm run start:dev
```

2. Start the frontend server (in a new terminal):
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## Database Management

### Reset Database
To completely reset the database (useful for development):
```bash
cd backend
# Drop and recreate the database
psql -U postgres -c "DROP DATABASE IF EXISTS online_bar;"
psql -U postgres -c "CREATE DATABASE online_bar;"

# Run migrations and seed data
npm run migration:run
npm run seed
```

### Migration Commands
```bash
# Generate a new migration
npm run migration:generate -- -n MigrationName

# Run migrations
npm run migration:run

# Revert last migration
npm run migration:revert
```

## Project Structure

- `/frontend` - React frontend application ([Frontend README](./frontend/README.md))
- `/backend` - NestJS backend application ([Backend README](./backend/README.md))

## Production Mode

```bash
# Build both frontend and backend
npm run build

# Start both in production mode
npm start
```

## Detailed Documentation

- [Frontend Documentation](./frontend/README.md)
- [Backend Documentation](./backend/README.md)

## License

[MIT](LICENSE)
