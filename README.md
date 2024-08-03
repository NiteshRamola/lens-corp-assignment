# Assignment

This project is built with Node.js and Express, with MongoDB for the database and Redis for caching. The project uses Docker Compose to run the application along with MongoDB and Redis.

### Demo Link - [https://lens-assignment.niteshramola.in/api-docs](https://lens-assignment.niteshramola.in/api-docs)

```sh
#Testing credentials

Role     Email             Password

Admin    admin@gmail.com   Admin@123
Manager  nitesh@gmail.com  string
User     ramola@gmail.com  string
```

## Table of Contents

- [Getting Started](#getting-started)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)

## Getting Started

These instructions will help you get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Make sure you have the following installed on your machine:

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Node.js](https://nodejs.org/) (v16 or higher)

### Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/NiteshRamola/lens-corp-assignment.git
   cd lens-corp-assignment
   ```

2. Install the dependencies:

   ```sh
   npm install
   ```

### Environment Variables

The following environment variables need to be set for the application to run properly:

- `PORT`: The port on which the application will run (e.g., 5001).
- `MONGO_URI`: The URI for connecting to the MongoDB instance (e.g., mongodb://localhost:27017/testDb).
- `REDIS_URL`: The URL for connecting to the Redis instance (e.g., redis://localhost:6379).
- `JWT_SECRET`: Secret key for signing JSON Web Tokens (JWT).
- `JWT_EXPIRE`: Expiration time for JWT (e.g., 1h, 7d).
- `JWT_REFRESH_SECRET`: Secret key for signing refresh tokens.
- `JWT_REFRESH_EXPIRE`: Expiration time for refresh tokens (e.g., 7d, 30d).

### Running the Application

1. Start the application with Docker Compose:

   ```sh
   docker-compose up --build
   ```

2. The application will be running on `http://localhost:5001` by default.

### API Documentation

The API documentation is available at `http://localhost:5001/api-docs` by default.

The live link for the API documentation is available at [https://lens-assignment.niteshramola.in/api-docs](https://lens-assignment.niteshramola.in/api-docs).
