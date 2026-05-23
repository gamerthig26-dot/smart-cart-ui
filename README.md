# Smart Cart UI

Smart Cart UI is an Express, SQLite, bcrypt, and vanilla frontend project with a complete authentication flow.

## Project Structure

```text
smart-cart-ui/
  auth/
    authService.js       User validation, bcrypt hashing, registration, and login checks
    token.js             JWT creation, verification, and secure cookie helpers
  database/
    database.js          SQLite connection and automatic users table creation
  public/
    index.html           Smart Cart UI, login form, register form, app header, cart, and scanner modal
    script.js            Fetch API integration, session restore, logout, products, cart, and scanner logic
    style.css            Responsive modern UI styles
    new-products/        Product images used by the cart
  routes/
    authRoutes.js        POST /register, POST /login, POST /logout, and GET /user
  .env.example           Deployment environment variable example
  database.db            Auto-created SQLite database
  package.json           Scripts and dependencies
  server.js              Express app entry point
```

## Start The Server

```bash
npm install
npm start
```

Then open:

```text
http://localhost:3000
```

On Windows PowerShell, if `npm` is blocked by execution policy, use:

```bash
npm.cmd start
```

## Test The System

1. Open `http://localhost:3000`.
2. Click `Cadastro`.
3. Create a username with at least 3 characters and a password with at least 6 characters.
4. The app logs you in automatically.
5. Refresh the page. The session remains active because the browser has an auth cookie.
6. Click `Sair` to log out.
7. Try registering the same username again. The API prevents duplicates.

Run syntax checks:

```bash
npm test
```

## How SQLite Works Here

The app creates `database.db` automatically in the project root. When `server.js` starts, it calls `initializeDatabase()` from `database/database.js`, which creates the `users` table if it does not already exist.

The table stores:

```sql
id INTEGER PRIMARY KEY AUTOINCREMENT
username TEXT NOT NULL UNIQUE
password TEXT NOT NULL
created_at DATETIME DEFAULT CURRENT_TIMESTAMP
```

SQLite stores the data in one local file, so users remain saved after the server stops.

## How Authentication Works

Registration validates the fields, checks if the username already exists, hashes the password with bcrypt, and saves only the hash in SQLite.

Login finds the user by username and uses `bcrypt.compare()` to check the submitted password against the saved hash. Plain text passwords are never stored.

After login or registration, the server creates a signed JWT and sends it as an `HttpOnly` cookie. The frontend calls `GET /user` on page load; if the cookie is valid, the user stays logged in. Logout clears the cookie.

Before deployment, set a strong secret:

```bash
SESSION_SECRET=your-long-random-secret
NODE_ENV=production
```
