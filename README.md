# Express.js RESTful API Assignment

This assignment focuses on building a RESTful API using Express.js, implementing proper routing, middleware, and error handling.

## Assignment Overview

You will:
1. Set up an Express.js server
2. Create RESTful API routes for a product resource
3. Implement custom middleware for logging, authentication, and validation
4. Add comprehensive error handling
5. Develop advanced features like filtering, pagination, and search

## Getting Started

1. Accept the GitHub Classroom assignment invitation
2. Clone your personal repository that was created by GitHub Classroom
3. Install dependencies:
   ```
   npm install
   ```
4. Run the server:
   ```
   # create a .env file from .env.example and (optionally) set API_KEY
   node server.js
   ```

## Files Included

- `Week2-Assignment.md`: Detailed assignment instructions
- `server.js`: Starter Express.js server file
- `.env.example`: Example environment variables file

## Requirements

- Node.js (v18 or higher)
- npm or yarn
- Postman, Insomnia, or curl for API testing

## API Endpoints

The API will have the following endpoints:

- `GET /api/products`: Get all products
- `GET /api/products/:id`: Get a specific product
- `POST /api/products`: Create a new product
- `PUT /api/products/:id`: Update a product
- `DELETE /api/products/:id`: Delete a product

Additional features implemented:

- Filtering by category: `GET /api/products?category=electronics`
- Pagination: `GET /api/products?page=2&limit=5`
- Search (query): `GET /api/products?search=phone`
- Explicit search endpoint: `GET /api/products/search?name=phone`
- Statistics: `GET /api/products/stats` (returns total, avgPrice, countByCategory)

Authentication:

- All `/api` routes require an API key provided via the `x-api-key` header (or `Authorization`).
- Default API key: `secret-key` (change in your `.env` file by setting `API_KEY`).

Sample requests (using curl):

```bash
# List products (with API key)
curl -H "x-api-key: secret-key" http://localhost:3000/api/products

# Create a product
curl -X POST -H "Content-Type: application/json" -H "x-api-key: secret-key" \
   -d '{"name":"Table","description":"Wooden dining table","price":250,"category":"furniture","inStock":true}' \
   http://localhost:3000/api/products
```

## Submission

Your work will be automatically submitted when you push to your GitHub Classroom repository. Make sure to:

1. Complete all the required API endpoints
2. Implement the middleware and error handling
3. Document your API in the README.md
4. Include examples of requests and responses

## Resources

- [Express.js Documentation](https://expressjs.com/)
- [RESTful API Design Best Practices](https://restfulapi.net/)
- [HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) 