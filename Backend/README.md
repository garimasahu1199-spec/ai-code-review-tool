# AI Code Review Tool - Backend

A production-ready Node.js/Express backend for AI-powered code review with hybrid analysis combining rule-based checks and OpenAI-powered deep analysis.

## Features

- **Hybrid Analysis Engine**: Combines fast rule-based analysis with intelligent AI review
- **Multi-Language Support**: JavaScript, TypeScript, Python, Java, C++, C#, Go, Rust, and more
- **Security Detection**: Identifies hardcoded secrets, XSS risks, and injection vulnerabilities
- **Performance Analysis**: Detects inefficient patterns and suggests optimizations
- **RESTful API**: Clean, documented endpoints with proper error handling
- **Production Ready**: Rate limiting, security headers, and comprehensive logging

## Architecture

```
Backend/
├── server.js              # Express server setup
├── routes/
│   └── reviewRoute.js     # API endpoints
├── services/
│   ├── ruleEngine.js      # Rule-based analysis
│   └── aiEngine.js        # OpenAI integration
├── utils/
│   └── formatter.js       # Result merging & formatting
├── package.json
├── .env.example
└── .gitignore
```

## Quick Start

### 1. Install Dependencies

```bash
cd Backend
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env and add your OpenAI API key
```

### 3. Start Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Server runs on `http://localhost:5000`

## API Endpoints

### POST `/api/review`
Main code review endpoint - runs hybrid analysis.

**Request:**
```json
{
  "code": "function add(a, b) { return a + b; }",
  "language": "javascript"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": "Excellent code quality. No issues detected.",
    "overallScore": 95,
    "issues": [],
    "securityWarnings": [],
    "suggestions": [...],
    "optimizedCode": "...",
    "reviewedAt": "2024-01-15T10:30:00.000Z",
    "metadata": {
      "processingTimeMs": 2500,
      "language": "javascript",
      "enginesUsed": { "ruleEngine": true, "aiEngine": true }
    }
  }
}
```

### POST `/api/review/quick`
Fast rule-based analysis only (no AI).

### GET `/api/review/supported-languages`
Returns list of supported programming languages.

### GET `/health`
Health check endpoint.

## Rule Engine

Detects:
- `var` usage (recommend let/const)
- Long functions (>50 lines)
- Console.log statements
- Unused variables
- Hardcoded secrets/credentials
- `eval()` usage
- `innerHTML` (XSS risk)
- Empty catch blocks
- Double equality (== vs ===)
- Debugger statements
- TODO/FIXME comments
- Nested callbacks
- Magic numbers
- Duplicate code

## AI Engine

Uses OpenAI GPT-4o-mini (configurable) for:
- Deep code understanding
- Logic error detection
- Performance optimization suggestions
- Best practice recommendations
- Optimized code generation

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 5000 | Server port |
| `OPENAI_API_KEY` | - | OpenAI API key (required for AI analysis) |
| `OPENAI_MODEL` | gpt-4o-mini | OpenAI model to use |
| `NODE_ENV` | development | Environment mode |
| `RATE_LIMIT_WINDOW_MS` | 900000 | Rate limit window (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | 100 | Max requests per window |
| `REQUEST_TIMEOUT` | 30000 | API request timeout (ms) |

## Environment Setup

Create `.env` file:

```env
# Required for AI analysis
OPENAI_API_KEY=sk-your-api-key-here

# Optional configuration
OPENAI_MODEL=gpt-4o-mini
PORT=5000
NODE_ENV=development
```

**Note:** Without `OPENAI_API_KEY`, the backend will only provide rule-based analysis.

## Testing

Example using curl:

```bash
curl -X POST http://localhost:5000/api/review \
  -H "Content-Type: application/json" \
  -d '{
    "code": "function sum(a, b) { var result = a + b; console.log(result); return result; }",
    "language": "javascript"
  }'
```

## Frontend Integration

The backend is configured to work with the React frontend:

1. Backend runs on port 5000
2. Frontend proxy is configured in `vite.config.js`
3. Frontend API service at `src/services/api.js`

## Error Handling

The API returns structured error responses:

```json
{
  "success": false,
  "error": "Description of what went wrong",
  "code": "ERROR_CODE"
}
```

Common error codes:
- `MISSING_CODE`: No code provided
- `EMPTY_CODE`: Code is empty
- `CODE_TOO_LARGE`: Code exceeds 100k characters
- `UNSUPPORTED_LANGUAGE`: Language not supported
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `AI_ANALYSIS_FAILED`: OpenAI API error

## Security

- Helmet.js for security headers
- Express rate limiting
- CORS configuration
- Request size limits
- Input validation

## License

MIT
