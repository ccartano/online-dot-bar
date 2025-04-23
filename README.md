# Online Bar Monorepo

This is a monorepo containing both the frontend and backend components of the Online Bar application.

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v20 or higher)
- npm (comes with Node.js)
- PostgreSQL (v14 or higher)
- Redis (v7 or higher)
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

### Installing Redis on Ubuntu

1. Update package list and install Redis:
```bash
sudo apt update
sudo apt install redis-server
```

2. Configure Redis to start on boot:
```bash
sudo systemctl enable redis-server
```

3. Start Redis service:
```bash
sudo systemctl start redis-server
```

4. Verify Redis is running:
```bash
redis-cli ping
```
The command should return "PONG" if Redis is running correctly.

5. (Optional) Configure Redis password:
   - This step is only necessary if you need password protection for Redis
   - For local development, you can skip this step
   - If you do need a password, follow these steps:
```bash
# Open Redis configuration
sudo nano /etc/redis/redis.conf

# Find the line with '#requirepass foobared'
# Uncomment and replace 'foobared' with your password
# Save and exit

# Restart Redis
sudo systemctl restart redis-server
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
npm install --include=dev
npm run build
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

1. Install all dependencies (including dev dependencies):
```bash
# Install backend dependencies
cd backend
npm install --production=false

# Install frontend dependencies
cd ../frontend
npm install --production=false
```

2. Build both frontend and backend:
```bash
# Build backend
cd ../backend
npm run build

# Build frontend
cd ../frontend
npm run build
```

3. Start in production mode:
```bash
# Start backend
cd ../backend
npm run start:prod
```

The frontend build will be available in the `frontend/dist` directory, which you can serve using any static file server.

## Detailed Documentation

- [Frontend Documentation](./frontend/README.md)
- [Backend Documentation](./backend/README.md)

## License

[MIT](LICENSE)
