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

## Quick Start

1. Clone the repository:
```bash
git clone <repository-url>
cd online-bar
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database (see Backend README for detailed instructions)

4. Start the development servers:
```bash
npm run dev
```

This will start both frontend and backend in development mode.

## Project Structure

- `/frontend` - React frontend application ([Frontend README](./frontend/README.md))
- `/backend` - NestJS backend application ([Backend README](./backend/README.md))

## Development Mode

```bash
# Start both frontend and backend in development mode
npm run dev

# Start only frontend
npm run dev:frontend

# Start only backend
npm run dev:backend
```

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
