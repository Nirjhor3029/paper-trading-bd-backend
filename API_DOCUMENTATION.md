# DSE Trading Backend API - Documentation

**Base URL:** `http://localhost:5000`  
**API Prefix:** `/api`  
**Content-Type:** `application/json`

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [API Endpoints](#api-endpoints)
3. [Response Format](#response-format)
4. [Examples](#examples)
5. [Error Handling](#error-handling)

---

## Getting Started

### Start the Server

```bash
cd E:\dev\projects\Trading\back-end
npm install
npm start
```

Server will start at: **http://localhost:5000**

### Health Check

```bash
GET http://localhost:5000/api/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2026-04-28T12:13:18.000Z",
  "uptime": 15.5
}
```

---

## API Endpoints

### 1. Get API Info

**Endpoint:** `GET /`  
**Description:** Get basic API information

#### Request
```http
GET http://localhost:5000/
```

#### Response
```json
{
  "message": "DSE Trading Backend API",
  "version": "1.0.0",
  "status": "running"
}
```

---

### 2. Get All Latest Stock Prices

**Endpoint:** `GET /api/stocks`  
**Description:** Retrieve latest stock prices for all active stocks

#### Request
```http
GET http://localhost:5000/api/stocks
```

#### Response
```json
{
  "success": true,
  "count": 350,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "stockId": "507f1f77bcf86cd799439012",
      "stockCode": "ACI",
      "stockName": "ACI LIMITED",
      "sector": "Pharmaceuticals",
      "date": "2026-04-28T00:00:00.000Z",
      "ltp": 245.50,
      "high": 250.00,
      "low": 243.00,
      "close": 245.50,
      "ycp": 242.00,
      "change": 3.50,
      "trade": 1250,
      "value": 15.75,
      "volume": 850000,
      "dseIndex": 1,
      "changePercent": "1.45"
    }
  ]
}
```

---

### 3. Get Specific Stock Data

**Endpoint:** `GET /api/stocks/:code`  
**Description:** Get stock metadata with latest price

#### Request
```http
GET http://localhost:5000/api/stocks/ACI
```

#### Response
```json
{
  "success": true,
  "data": {
    "stock": {
      "_id": "507f1f77bcf86cd799439012",
      "code": "ACI",
      "name": "ACI LIMITED",
      "sector": "Pharmaceuticals",
      "isActive": true,
      "lastUpdated": "2026-04-28T10:30:00.000Z",
      "createdAt": "2026-01-15T08:00:00.000Z",
      "updatedAt": "2026-04-28T10:30:00.000Z"
    },
    "latestPrice": {
      "_id": "507f1f77bcf86cd799439013",
      "stockId": "507f1f77bcf86cd799439012",
      "date": "2026-04-28T00:00:00.000Z",
      "ltp": 245.50,
      "high": 250.00,
      "low": 243.00,
      "close": 245.50,
      "ycp": 242.00,
      "change": 3.50,
      "trade": 1250,
      "value": 15.75,
      "volume": 850000,
      "dseIndex": 1,
      "scrapedAt": "2026-04-28T10:30:00.000Z"
    }
  }
}
```

---

### 4. Get Historical Data

**Endpoint:** `GET /api/stocks/:code/history`  
**Description:** Get historical price data for a specific stock

#### Request
```http
GET http://localhost:5000/api/stocks/ACI/history?days=30
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| days | Number | 30 | Number of days of history to retrieve |

#### Response
```json
{
  "success": true,
  "stockCode": "ACI",
  "days": 30,
  "count": 22,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "stockId": "507f1f77bcf86cd799439012",
      "date": "2026-04-28T00:00:00.000Z",
      "open": 240.50,
      "ltp": 245.50,
      "high": 250.00,
      "low": 243.00,
      "close": 245.50,
      "ycp": 242.00,
      "change": 3.50,
      "trade": 1250,
      "value": 15.75,
      "volume": 850000,
      "dseIndex": 1,
      "scrapedAt": "2026-04-28T10:30:00.000Z"
    }
  ]
}
```

---

### 5. Get All Stock Metadata

**Endpoint:** `GET /api/stocks/metadata`  
**Description:** Get metadata for all active stocks

#### Request
```http
GET http://localhost:5000/api/stocks/metadata
```

#### Response
```json
{
  "success": true,
  "count": 350,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "code": "ACI",
      "name": "ACI LIMITED",
      "sector": "Pharmaceuticals",
      "isActive": true,
      "lastUpdated": "2026-04-28T10:30:00.000Z",
      "createdAt": "2026-01-15T08:00:00.000Z",
      "updatedAt": "2026-04-28T10:30:00.000Z"
    }
  ]
}
```

---

### 6. Update Stock Metadata

**Endpoint:** `PUT /api/stocks/:code/metadata`  
**Description:** Update metadata for a specific stock

#### Request
```http
PUT http://localhost:5000/api/stocks/ACI/metadata
Content-Type: application/json

{
  "name": "ACI Limited (Updated)",
  "sector": "Pharmaceuticals & Chemicals",
  "isActive": true
}
```

**Request Body Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | String | No | Stock name |
| sector | String | No | Industry sector |
| isActive | Boolean | No | Active status |

#### Response
```json
{
  "success": true,
  "message": "Stock ACI metadata updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "code": "ACI",
    "name": "ACI Limited (Updated)",
    "sector": "Pharmaceuticals & Chemicals",
    "isActive": true,
    "lastUpdated": "2026-04-28T12:00:00.000Z",
    "createdAt": "2026-01-15T08:00:00.000Z",
    "updatedAt": "2026-04-28T12:00:00.000Z"
  }
}
```

---

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "stack": "Error stack (only in development)"
}
```

---

## Examples

### Using cURL

```bash
# Health check
curl http://localhost:5000/api/health

# Get all latest stocks
curl http://localhost:5000/api/stocks

# Get specific stock
curl http://localhost:5000/api/stocks/ACI

# Get historical data (last 7 days)
curl "http://localhost:5000/api/stocks/ACI/history?days=7"

# Get all metadata
curl http://localhost:5000/api/stocks/metadata

# Update stock metadata
curl -X PUT http://localhost:5000/api/stocks/ACI/metadata \
  -H "Content-Type: application/json" \
  -d '{"sector": "Pharmaceuticals", "name": "ACI LIMITED"}'
```

### Using JavaScript (Fetch)

```javascript
// Get all latest stocks
const response = await fetch('http://localhost:5000/api/stocks');
const data = await response.json();
console.log(data);

// Get historical data
const history = await fetch('http://localhost:5000/api/stocks/ACI/history?days=30');
const historyData = await history.json();

// Update metadata
const update = await fetch('http://localhost:5000/api/stocks/ACI/metadata', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ sector: 'Pharmaceuticals' })
});
```

### Using Postman

1. Set request type (GET, PUT, etc.)
2. Enter URL: `http://localhost:5000/api/stocks`
3. For PUT requests, add header: `Content-Type: application/json`
4. For PUT requests, add body in raw JSON format

---

## Error Handling

### Common HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request (validation error) |
| 404 | Resource Not Found |
| 500 | Internal Server Error |

### Error Examples

**404 - Stock Not Found:**
```json
{
  "success": false,
  "message": "Stock with code INVALID not found"
}
```

**400 - Validation Error:**
```json
{
  "success": false,
  "message": "Validation error",
  "details": [
    "\"sector\" length must be less than or equal to 100 characters"
  ]
}
```

**500 - Server Error:**
```json
{
  "success": false,
  "message": "Internal server error description"
}
```

---

## Data Fields Description

### StockPrice Fields

| Field | Type | Description |
|-------|------|-------------|
| `open` | Number | Day's Opening Price (first scrape of the day) |
| `open` | Number | Day's Opening Price (first scrape of day) |
| `ltp` | Number | Last Trading Price |
| `high` | Number | Day's Highest Price |
| `low` | Number | Day's Lowest Price |
| `close` | Number | Closing Price |
| `ycp` | Number | Yesterday's Closing Price |
| `change` | Number | Price Change (LTP - YCP) |
| `trade` | Number | Number of Trades |
| `value` | Number | Trading Value (in millions BDT) |
| `volume` | Number | Trading Volume (shares) |
| `dseIndex` | Number | DSE Index Row Number |
| `changePercent` | Virtual | Change percentage (change/ycp * 100) |

### StockMetadata Fields

| Field | Type | Description |
|-------|------|-------------|
| `code` | String | Stock trading code (unique) |
| `name` | String | Full company name |
| `sector` | String | Industry sector |
| `isActive` | Boolean | Whether stock is actively traded |
| `lastUpdated` | Date | Last metadata update |

---

## Postman Collection

You can import this API collection to Postman:

1. Open Postman
2. Click "Import" → "Link" or "File"
3. Create requests for each endpoint listed above
4. Set Base URL variable: `http://localhost:5000`

---

**API Documentation Version:** 1.0.0  
**Last Updated:** April 28, 2026
