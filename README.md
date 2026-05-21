# Team Task Manager

A lightweight, production-ready Project Management web application built with the MERN stack.

## Tech Stack
* **Backend:** Node.js, Express, MongoDB
* **Frontend:** React (Vite), Tailwind CSS, React Router
* **Authentication:** JWT & bcrypt

## Project Structure
* `/server` - Backend Express API
* `/client` - Frontend React application

## Setup Instructions

### Prerequisites
- Node.js installed
- MongoDB connection string (Atlas or local)

### Backend Setup
1. Navigate to the `server` directory: `cd server`
2. Install dependencies: `npm install`
3. Create a `.env` file based on `.env.example`:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```
4. Start the backend server: `npm start` (or `node server.js`)

### Frontend Setup
1. Navigate to the `client` directory: `cd client`
2. Install dependencies: `npm install`
3. Start the Vite development server: `npm run dev`

The application will be accessible at `http://localhost:5173`.
