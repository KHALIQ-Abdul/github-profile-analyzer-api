# GitHub Profile Analyzer API

A Node.js + Express.js backend assignment project that analyzes a public GitHub user profile using the GitHub REST API and stores useful insights in a MySQL database.

Built for the **Junior Node.js Developer** selection assignment.

---

## ✅ Features

- Fetch GitHub public profile data by username
- Analyze useful profile insights:
  - Public repositories
  - Followers and following
  - Public gists
  - Total repository stars
  - Total repository forks
  - Total watchers
  - Original vs forked repositories
  - Archived repositories
  - Top programming languages
  - Top repositories by stars/forks
  - Recently updated repositories
  - Repository topics
  - Simple profile analysis score out of 100
  - Human-readable insight summary
- Store/update analyzed results in MySQL
- Fetch all stored analyzed profiles with pagination, search and sorting
- Fetch a single stored profile analysis
- Delete stored profile analysis
- Error handling, request validation, CORS, Helmet security headers and rate limiting

---

## 🛠 Tech Stack

- Node.js
- Express.js
- MySQL
- GitHub REST API
- mysql2
- Axios
- Joi

---

## 📁 Project Structure

```txt
github-profile-analyzer-api/
├── database/
│   └── schema.sql
├── postman/
│   └── GitHub_Profile_Analyzer_API.postman_collection.json
├── src/
│   ├── config/
│   │   ├── db.js
│   │   └── env.js
│   ├── controllers/
│   │   └── profile.controller.js
│   ├── middleware/
│   │   ├── errorHandler.js
│   │   └── notFound.js
│   ├── repositories/
│   │   └── profile.repository.js
│   ├── routes/
│   │   └── profile.routes.js
│   ├── services/
│   │   └── github.service.js
│   ├── utils/
│   │   ├── apiResponse.js
│   │   └── asyncHandler.js
│   ├── app.js
│   └── server.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## 🚀 Local Setup Instructions

### 1. Clone the repository

```bash
git clone <your-github-repository-link>
cd github-profile-analyzer-api
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create MySQL database and table

Open MySQL and run:

```bash
mysql -u root -p < database/schema.sql
```

Or manually run the SQL from:

```txt
database/schema.sql
```

### 4. Configure environment variables

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Update values:

```env
PORT=5055
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=github_profile_analyzer

GITHUB_TOKEN=
CLIENT_ORIGIN=*
```

> `GITHUB_TOKEN` is optional, but recommended. Without a token, GitHub allows only around 60 unauthenticated requests per hour. With a token, the limit is much higher.

### 5. Start the server

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

Server runs at:

```txt
http://localhost:5000
```

---

## 📌 API Endpoints

### Health Check

```http
GET /health
```

Example:

```bash
curl http://localhost:5000/health
```

---

### Analyze and Store GitHub Profile

```http
POST /api/analyze/:username
```

Example:

```bash
curl -X POST http://localhost:5000/api/analyze/octocat
```

Response example:

```json
{
  "success": true,
  "message": "GitHub profile analyzed and stored successfully",
  "data": {
    "username": "octocat",
    "public_repos": 8,
    "followers": 18000,
    "total_stars": 12000,
    "top_language": "Ruby",
    "analysis_score": "75.25"
  }
}
```

---

### Get All Stored Profile Analyses

```http
GET /api/profiles
```

Query parameters:

| Parameter | Description | Example |
|---|---|---|
| `page` | Page number | `1` |
| `limit` | Items per page, max 100 | `10` |
| `search` | Search by username, name or language | `node` |
| `sortBy` | `analyzed_at`, `followers`, `public_repos`, `analysis_score`, `total_stars`, `username` | `followers` |
| `order` | `ASC` or `DESC` | `DESC` |

Example:

```bash
curl "http://localhost:5000/api/profiles?page=1&limit=10&sortBy=followers&order=DESC"
```

---

### Get Single Stored Profile Analysis

```http
GET /api/profiles/:username
```

Example:

```bash
curl http://localhost:5000/api/profiles/octocat
```

---

### Delete Stored Profile Analysis

```http
DELETE /api/profiles/:username
```

Example:

```bash
curl -X DELETE http://localhost:5000/api/profiles/octocat
```

---

## 🗄 Database Schema

The database schema/export is available at:

```txt
database/schema.sql
```

Main table:

```txt
github_profiles
```

Important columns:

- `username`
- `github_id`
- `public_repos`
- `followers`
- `following`
- `total_stars`
- `total_forks`
- `top_language`
- `languages`
- `top_repositories`
- `recent_repositories`
- `analysis_score`
- `insight_summary`
- `analyzed_at`

---

## 📮 Postman Collection

A Postman collection is included at:

```txt
postman/GitHub_Profile_Analyzer_API.postman_collection.json
```

Import it into Postman and set:

```txt
base_url = http://localhost:5000
```

---

## 🌐 Deployment Suggestions

You can deploy this API using:

- Render
- Railway
- Cyclic
- Fly.io
- AWS EC2
- DigitalOcean

For MySQL hosting, you can use:

- Railway MySQL
- PlanetScale
- Aiven MySQL
- AWS RDS
- Clever Cloud MySQL

After deployment, update the README with:

```txt
Live deployed API URL: Will be updated after deployment
GitHub repository link: https://github.com/KHALIQ-Abdul/github-profile-analyzer-api
```

---

## 🧪 Quick Testing Flow

1. Start server.
2. Analyze a profile:

```bash
curl -X POST http://localhost:5000/api/analyze/torvalds
```

3. Fetch all stored profiles:

```bash
curl http://localhost:5000/api/profiles
```

4. Fetch one stored profile:

```bash
curl http://localhost:5000/api/profiles/torvalds
```

---

## Notes

- The GitHub repositories endpoint is paginated. This project analyzes up to 300 recently updated public repositories per user to keep response time reasonable.
- Re-analyzing the same username updates the existing database row instead of creating duplicates.

## Submission Links

GitHub repository link: https://github.com/KHALIQ-Abdul/github-profile-analyzer-api

Live deployed API URL: https://github-profile-analyzer-api-production-ceb8.up.railway.app
