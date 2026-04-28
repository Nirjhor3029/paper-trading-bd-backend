# DSE Trading Backend API

Professional RESTful API backend for DSE (Dhaka Stock Exchange) stock data.

## Quick Start

```bash
# Install dependencies
npm install

# Set environment variables (edit .env file)
# MONGODB_URI=mongodb://localhost:27017/dse_scraper
# PORT=5000

# Start development server
npm run dev

# Start production server
npm start
```

## Server Endpoints

Once the server is running, the following endpoints are available:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `http://localhost:5000/` | API info |
| GET | `http://localhost:5000/api/health` | Health check |
| GET | `http://localhost:5000/api/stocks` | Get all latest stock prices |
| GET | `http://localhost:5000/api/stocks/metadata` | Get all stock metadata |
| GET | `http://localhost:5000/api/stocks/:code` | Get specific stock data |
| GET | `http://localhost:5000/api/stocks/:code/history?days=30` | Get historical data |
| PUT | `http://localhost:5000/api/stocks/:code/metadata` | Update stock metadata |

## Project Structure

```
back-end/
├── src/
│   ├── config/          # Database & environment config
│   ├── controllers/     # Request handlers
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API route definitions
│   ├── services/        # Business logic
│   ├── middlewares/     # Error & validation handlers
│   └── utils/           # Logger & helpers
├── server.js            # Entry point
├── package.json
└── .env                 # Environment variables
```

## Technologies

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Validation:** Joi
- **Logging:** Winston
- **Security:** Helmet, CORS

## Database

Uses existing MongoDB database `dse_scraper` with collections:
- `stockmetadatas` - Stock metadata (code, name, sector)
- `stockprices` - Daily price data (ltp, high, low, close, etc.)

## Development

```bash
# Run with auto-reload
npm run dev

# Server starts at http://localhost:5000
```
