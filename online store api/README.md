# Mini Online Store API

A small Express (CommonJS) REST API organized with a simple MVC-ish structure:

- `routes/` → URL mapping
- `controllers/` → request handlers
- `middleware/` → logging, auth, error handling
- `config/` → app configuration

## Requirements

- Node.js (recommended: latest LTS)
- npm

## Install

```bash
npm install
```

### Windows PowerShell note (npm.ps1 blocked)

If you see:

> `npm.ps1 cannot be loaded because running scripts is disabled on this system`

Run npm via `npm.cmd`:

```powershell
& "$env:ProgramFiles\nodejs\npm.cmd" install
```

## Run

### Option A: using npm script

```bash
npm start
```

### Option B: direct

```bash
node app.js
```

Server log on success:

- `Mini Online Store API listening on port 3000`

## Configuration

- Port is read from `process.env.PORT`, otherwise defaults to `3000`.
- See `config/server.js`.

Examples:

```powershell
$env:PORT=5000
npm start
```

## API

Base URL (default):

- `http://localhost:3000`

### Response shape

Most endpoints return:

```json
{ "data": "..." }
```

Errors return:

```json
{ "error": "...", "message": "..." }
```

## Endpoints

### Products

- `GET /products` → list demo products
- `GET /products/:id` → get a product by id
- `POST /products` → create a product (demo/in-memory)

Example:

```bash
curl http://localhost:3000/products
```

### Users (protected)

All `/users/*` routes require a token (router-level auth middleware).

Accepted headers:

- `Authorization: Bearer demo-token`
- OR `x-auth-token: demo-token`

Endpoints:

- `GET /users/:id`
- `POST /users`

Examples:

```bash
# Unauthorized (no token)
curl -i http://localhost:3000/users/1

# Authorized
auth="Authorization: Bearer demo-token"
curl -i -H "$auth" http://localhost:3000/users/1
```

## Output screenshots 

Put your screenshots in `docs/images/` and they will render here.

### 1)  output

![WhatsApp Image 2026-02-26 at 7 34 15 PM](https://github.com/user-attachments/assets/6edb5f5c-7e6b-4c11-a461-c8abc383614a)



### 2)  unauthorized/authorized output
![WhatsApp Image 2026-02-26 at 7 33 26 PM](https://github.com/user-attachments/assets/8278fa82-db75-44a3-94d3-60c6f53ae7f9)



## Project structure

```text
.
├─ app.js
├─ package.json
├─ config/
│  └─ server.js
├─ controllers/
│  ├─ productController.js
│  └─ userController.js
├─ middleware/
│  ├─ auth.js
│  ├─ errorHandler.js
│  └─ logger.js
└─ routes/
   ├─ products.js
   └─ users.js
```

## Notes

- `middleware/auth.js` is a demo auth guard; it validates a fixed token (`demo-token`) and attaches `req.user`.
- `middleware/errorHandler.js` should remain the last middleware registered in `app.js`.
