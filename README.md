# Healthcare Backend System

A Node.js backend system for managing healthcare records, built with Express.js and PostgreSQL.

## Features

- User authentication with JWT
- Patient management
- Doctor management
- Patient-Doctor mapping
- RESTful API endpoints
- Data validation
- Error handling
- PostgreSQL database with Sequelize ORM

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd healthcare-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
PORT=3000
NODE_ENV=development
DB_NAME=healthcare_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=24h
```

4. Create the PostgreSQL database:
```bash
createdb healthcare_db
```

5. Run database migrations:
```bash
npx sequelize-cli db:migrate
```

6. Start the server:
```bash
npm run dev
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
  - Body: `{ "name": "string", "email": "string", "password": "string" }`

- `POST /api/auth/login` - Login user
  - Body: `{ "email": "string", "password": "string" }`

### Patients

- `POST /api/patients` - Create a new patient
  - Body: `{ "firstName": "string", "lastName": "string", "dateOfBirth": "date", "gender": "string", "contactNumber": "string", "address": "string", "medicalHistory": "string" }`

- `GET /api/patients` - Get all patients for the authenticated user

- `GET /api/patients/:id` - Get a specific patient

- `PUT /api/patients/:id` - Update a patient
  - Body: Same as create, all fields optional

- `DELETE /api/patients/:id` - Delete a patient

### Doctors

- `POST /api/doctors` - Create a new doctor
  - Body: `{ "firstName": "string", "lastName": "string", "specialization": "string", "licenseNumber": "string", "contactNumber": "string", "email": "string" }`

- `GET /api/doctors` - Get all doctors

- `GET /api/doctors/:id` - Get a specific doctor

- `PUT /api/doctors/:id` - Update a doctor
  - Body: Same as create, all fields optional

- `DELETE /api/doctors/:id` - Delete a doctor

### Patient-Doctor Mappings

- `POST /api/mappings` - Create a new mapping
  - Body: `{ "patientId": "uuid", "doctorId": "uuid" }`

- `GET /api/mappings` - Get all mappings for the authenticated user's patients

- `GET /api/mappings/:patientId` - Get all doctors for a specific patient

- `DELETE /api/mappings/:id` - Delete a mapping

## Authentication

All endpoints except `/api/auth/register` and `/api/auth/login` require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Error Handling

The API uses standard HTTP status codes and returns errors in the following format:

```json
{
  "status": "error",
  "message": "Error message"
}
```

## Development

- `npm run dev` - Start development server with hot reload
- `npm start` - Start production server
- `npm test` - Run tests

## Security

- Passwords are hashed using bcrypt
- JWT tokens are used for authentication
- Input validation using express-validator
- Environment variables for sensitive data

## License

ISC 