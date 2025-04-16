<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

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
*   Node.js and npm installed on the Pi
*   PostgreSQL installed and running on the Pi (or accessible from it)
*   Git installed on the Pi
*   A process manager like `pm2` is recommended for running the backend service (`sudo npm install -g pm2`)

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

### 1. Clone Repository

Clone the project repository onto your Raspberry Pi:

```bash
git clone <your-repository-url> online-bar
cd online-bar
```

### 2. Setup PostgreSQL Database

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

### 3. Configure Backend

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
    *   `PAPERLESS_API_URL`, `PAPERLESS_API_TOKEN`, etc. (Update Paperless config if used in production)
    *   `ADMIN_TOKEN` (Set a secure admin token)
4.  Install dependencies:
    ```bash
    npm install --omit=dev
    ```
5.  Build the application (if using TypeScript):
    ```bash
    npm run build
    ```
6.  Start the backend using a process manager like `pm2`:
    ```bash
    pm2 start dist/main.js --name online-bar-backend
    pm2 save # Save the process list to restart on reboot
    pm2 startup # Follow instructions to enable startup script
    ```
    *(Alternatively, you can run `npm run start:prod` but using `pm2` is recommended for production)*

### 4. Configure Frontend

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

### 5. Serve Frontend

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
    sudo systemctl restart nginx
    ```

You should now be able to access your application by navigating to your Raspberry Pi's IP address (or the configured domain) in a web browser.

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
