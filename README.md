# Url Shortener 

Simple and very primitive one file URL shortener built with Node.js, Express, and PostgreSQL. It allows users to submit a long URL and receive a shortened version that redirects to the original URL when accessed.

This was just a personal project of mine with limited AI use to practice building a backend application and working with databases. It is not meant for production use and lacks features like error handling, validation, and security measures, but could be improved with additional development and time.

# To run the project
Clone the repository and navigate to the project directory.

Setup a PostgreSQL database and create a table with the following:
```sql
CREATE TABLE url_mapping (
    id SERIAL PRIMARY KEY,
    long_url TEXT NOT NULL,
    short_code VARCHAR(10) NOT NULL UNIQUE
);
``` 

Then, create a `.env` file in the root of your project with the following content:
```
DATABASE_URL=your_postgresql_connection_string
PORT=your_port_number
BASE_URL=your_url
```

Finally, run the server with:
```
npm install
npm run dev
```

## API Usage
- To shorten a URL, simply just run app.js and input your long URL when prompted
- The response will contain the shortened URL:
```json
{
    "message": "Short URL created successfully!",
    "shortUrl": "http://localhost:3000/abc123"
}
```
