## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Database Setup

This project uses PostgreSQL as its database. Follow these steps to set up the database:

1. Install PostgreSQL if you haven't already:
   ```bash
   # On macOS with Homebrew
   brew install postgresql@14
   brew services start postgresql@14
   ```

2. Create the database:
   ```bash
   # Method 1: Using createdb
   createdb online_bar

   # Method 2: Using psql (connect to postgres database first)
   psql postgres
   CREATE DATABASE online_bar;
   ```

3. Configure your environment variables in `.env`:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=calvincartano
   DB_PASSWORD=
   DB_NAME=online_bar
   NODE_ENV=development
   ```

4. The application will automatically create tables based on your entities when you start it (in development mode).

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Production Deployment (Raspberry Pi)

This section outlines the steps to deploy the Online Bar application (frontend and backend) to a Raspberry Pi for production use.

### Prerequisites

*   Raspberry Pi (with Raspberry Pi OS or similar Linux distribution)
*   Node.js and npm installed on the Pi. **Node.js v20 or higher is recommended.** 
    *   If your Node.js version is lower (check with `node -v`), use Node Version Manager (nvm) to upgrade:
        1. Install `nvm` (you might need `sudo apt install curl` first):
           ```bash
           curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
           ```
        2. Reload shell config (or close/reopen terminal):
           ```bash
           source ~/.bashrc # Or ~/.zshrc
           ```
        3. Install Node.js LTS (v20+):
           ```bash
           nvm install --lts
           ```
        4. Set it as default:
           ```bash
           nvm alias default lts/*
           ```
        5. Verify: `node -v` should show v20 or higher.
    *   Ensure `npm` is also installed (usually comes with Node.js).
*   PostgreSQL installed and running on the Pi (or accessible from it)
*   Git installed on the Pi
*   A process manager like `pm2` is recommended for running the backend service:
    ```bash
    # Install PM2 globally
    sudo npm install -g pm2
    
    # Create PM2 log directory
    sudo mkdir -p /var/log/pm2
    sudo chown -R $USER:$USER /var/log/pm2
    
    # Create PM2 startup script (run as root)
    sudo pm2 startup
    ```

### SSH Key Setup (on Raspberry Pi)

Before cloning the repository using SSH, ensure the Raspberry Pi has an SSH key that is registered with your GitHub account:

1.  **Log into your Raspberry Pi.**
2.  **Check for existing keys:** `ls -al ~/.ssh`
3.  **If no `id_ed25519.pub` or `id_rsa.pub` exists, generate a new key:**
    ```bash
    ssh-keygen -t ed25519 -C "your_email@example.com" 
    # Press Enter to accept default file location and optionally set a passphrase
    ```
4.  **Display the public key:**
    ```bash
    cat ~/.ssh/id_ed25519.pub 
    ```
5.  **Copy the displayed public key output.**
6.  **Add the copied key to your GitHub account:**
    *   Go to GitHub > Settings > SSH and GPG keys > New SSH key.
    *   Paste the key and give it a title (e.g., "Raspberry Pi Key").
7.  **Test the connection *from the Pi***:
    ```bash
    ssh -T git@github.com
    # You should see a success message confirming authentication.
    ```

### 1. Install PostgreSQL (if not already installed)

If you haven't installed PostgreSQL on your Raspberry Pi, you can do so with:

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```
This will also install the `psql` command-line tool.

### 2. Clone Repository

Clone the project repository onto your Raspberry Pi:

```bash
git clone <your-repository-url> online-bar
cd online-bar
```

### 3. Setup PostgreSQL Database

1.  Connect to PostgreSQL:
    ```bash
    sudo -u postgres psql
    ```
2.  Create a production user and database (replace `prod_user` and `prod_password` with secure credentials):
    ```sql
    CREATE USER prod_user WITH PASSWORD 'prod_password';
    CREATE DATABASE online_bar_prod OWNER prod_user;
    \q
    ```

### 4. Configure Backend

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Copy the production environment file:
    ```bash
    cp .env.production .env
    ```
3.  **Edit `.env`** and replace the placeholder values with your actual production settings:
    *   `DB_USERNAME=prod_user`
    *   `DB_PASSWORD=prod_password`
    *   `DB_NAME=online_bar_prod`
    *   `NODE_ENV=production`  # Important: Set this to production for production deployment
    *   `PAPERLESS_API_URL`, `PAPERLESS_API_TOKEN`, etc. (Update Paperless config if used in production)
    *   `ADMIN_TOKEN` (Set a secure admin token)
4.  Install dependencies (including dev dependencies needed for build):
    ```bash
    npm install
    ```
5.  Build the application:
    ```bash
    npm run build
    ```
6.  Remove development dependencies and install only production dependencies:
    ```bash
    npm install --omit=dev
    ```
7.  Start the backend in production mode (in the background):
    ```bash
    nohup npm run start:prod > backend.log 2>&1 &
    ```
    You can check the logs with:
    ```bash
    tail -f backend.log
    ```

### 5. Configure Frontend

1.  Navigate to the frontend directory:
    ```bash
    cd ../frontend
    ```
2.  Copy the production environment file:
    ```bash
    cp .env.production .env
    ```
3.  **Edit `.env`** and set the correct `VITE_API_URL` to point to your backend (e.g., `http://<pi_ip_address>:3001/api` or `http://localhost:3001/api` if served on the same machine) and the `VITE_ADMIN_TOKEN`.
4.  Install dependencies:
    ```bash
    npm install --omit=dev
    ```
5.  Build the frontend:
    ```bash
    npm run build
    ```

### 6. Serve Frontend

The frontend build artifacts are typically located in the `frontend/dist` directory. You need a web server to serve these static files.

**Option 1: Using `serve` (Simple)**

1.  Install `serve`:
    ```bash
    sudo npm install -g serve
    ```
2.  Serve the build directory (run from the `frontend` directory):
    ```bash
    serve -s dist -l 80 # Serve on port 80 (requires sudo) or another port like 5000
    ```
    *(You might want to run this using `pm2` as well for resilience)*

**Option 2: Using `nginx` (Recommended for Production)**

1.  Install nginx:
    ```bash
    sudo apt update && sudo apt install nginx
    ```
2.  Configure nginx to serve the frontend files and optionally proxy API requests to the backend. Create a configuration file in `/etc/nginx/sites-available/online-bar`:
    ```nginx
    server {
        listen 80;
        server_name <your_pi_ip_address_or_domain>; # Replace with your Pi's IP or domain

        root /path/to/your/online-bar/frontend/dist; # Replace with the actual path
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }

        # Optional: Proxy API requests to the backend
        location /api/ {
            proxy_pass http://localhost:3001/api/; # Adjust port if backend runs elsewhere
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
    ```
3.  Enable the site and restart nginx:
    ```bash
    sudo ln -s /etc/nginx/sites-available/online-bar /etc/nginx/sites-enabled/
    sudo nginx -t # Test configuration
    sudo systemctl reload nginx
    ```

You should now be able to access your application by navigating to your Raspberry Pi's IP address (or the configured domain) in a web browser.
