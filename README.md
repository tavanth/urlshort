# URL Shortener

A small URL shortener built with Node.js, Express, and PostgreSQL.

Submit a long `http` or `https` URL, get back a short URL, then visit the short URL to redirect back to the original destination.

## Features

- `POST /shorten` creates a short URL
- `GET /:code` redirects a short code to the stored long URL
- PostgreSQL storage with a committed `schema.sql`
- Random 6-character short codes using `A-Z`, `a-z`, and `0-9`
- Duplicate short-code retry handling using the database `UNIQUE` constraint
- URL validation with Node's built-in `URL` parser
- Only allows `http:` and `https:` URLs
- Rate limiting on `POST /shorten`
- Environment variables loaded with `dotenv`
- Configurable server port with `PORT`
- Configurable public base URL with `BASE_URL`
- Interactive CLI client in `app.js`

## Requirements

- Node.js 18+
- npm
- PostgreSQL

## Install

```sh
npm install
```

## Database setup

Create a PostgreSQL database, then run:

```sh
psql your_database_name < schema.sql
```

Current schema:

```sql
CREATE TABLE IF NOT EXISTS url_mapping (
    id SERIAL PRIMARY KEY,
    long_url TEXT NOT NULL,
    short_code TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Environment setup

Create a `.env` file in the project root:

```env
DATABASE_URL=postgres://username:password@localhost:5432/your_database_name
BASE_URL=http://localhost:3000
```

## Run the server

Development mode with auto-restart:

```sh
npm run dev
```

Basic start:

```sh
npm start
```

## Using the CLI client

Start the server first, then run:

```sh
node app.js
```

Enter a URL when prompted:

```txt
Enter your long URL: https://example.com/some/long/path
```

Example output:

```json
{
  "message": "URL shortened successfully",
  "shortUrl": "http://localhost:3000/abc123"
}
```

The CLI posts to:

```txt
${BASE_URL}/shorten
```

So `BASE_URL` must point to your running server.

## API usage

### Shorten a URL

```http
POST /shorten
Content-Type: application/json
```

Request body:

```json
{
  "longUrl": "https://example.com/some/long/path"
}
```

Success response:

```json
{
  "message": "URL shortened successfully",
  "shortUrl": "http://localhost:3000/abc123"
}
```

Invalid URL response:

```json
{
  "error": "Invalid URL"
}
```

Server failure response:

```json
{
  "error": "Failed to shorten URL"
}
```

### Redirect a short URL

Visit:

```txt
http://localhost:3000/abc123
```

## How it works

```txt
app.js/client -> POST /shorten -> server.js -> INSERT into url_mapping -> JSON shortUrl
browser       -> GET /:code    -> server.js -> SELECT from url_mapping -> redirect
```

## Project files

| File | Purpose |
|---|---|
| `server.js` | Express app, database connection, routes, rate limiter, short-code generation |
| `app.js` | Interactive CLI client |
| `schema.sql` | PostgreSQL schema |
| `improvements.md` | Improvement checklist |
| `diagram.md` | Request-flow diagram |
| `project-breakdown.md` | Learning notes/project explanation |
| `project-guide.md` | Step-by-step build guide |
| `todo.md` | Older notes |

## Known limitations

- Same long URL can be shortened multiple times into different codes.
- Redirect errors are plain text, while `/shorten` errors are JSON.
- Stored redirect targets are trusted after insertion; there is no re-validation before `res.redirect`.
- No click tracking, expiry, delete endpoint, metadata endpoint, custom aliases, tests, linter, or UI.
- Not production-ready without more security work, especially around redirect abuse, CORS, and headers.
