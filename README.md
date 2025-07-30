# AiApply - Stellar Job Seeker Hub 🚀

![banner](https://i.imgur.com/EXAMPLE.png) <!-- Replace with a cool project banner -->

[![Go Version](https://img.shields.io/badge/go-1.24+-blue.svg)](https://golang.org)
[![React Version](https://img.shields.io/badge/react-18.3-blue.svg)](https://reactjs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

A full-stack application designed to streamline your job search. Scrape job listings, manage applications, and track your progress with our analytics dashboard.

## ✨ Features

- **Job Scraping:** Automatically scrape job listings from various platforms.
- **Application Management:** Keep track of all your job applications in one place.
- **User Authentication:** Secure user registration and login with JWT and Google OAuth.
- **Analytics Dashboard:** Visualize your job application stats and track your progress.
- **Profile Management:** Create and manage your user profile.
- **Modern UI:** A sleek and responsive user interface built with React and Tailwind CSS.

## 🛠️ Tech Stack

### Backend

- **Go:** A fast and efficient language for building web services.
- **Gin:** A popular and high-performance web framework for Go.
- **GORM:** A developer-friendly ORM library for Go.
- **PostgreSQL:** A powerful, open-source object-relational database system.
- **JWT-Go:** For handling JSON Web Tokens.

### Frontend

- **React:** A JavaScript library for building user interfaces.
- **Vite:** A next-generation frontend tooling that is fast and lean.
- **TypeScript:** A typed superset of JavaScript that compiles to plain JavaScript.
- **Tailwind CSS:** A utility-first CSS framework for rapid UI development.
- **Shadcn/UI:** A collection of re-usable components for React.
- **React Query:** For data fetching, caching, and state management.
- **React Router:** For declarative routing in your React application.

## 🚀 Getting Started

### Prerequisites

- [Go](https://golang.org/doc/install) (version 1.24+)
- [Node.js](https://nodejs.org/en/download/) (version 18+)
- [PostgreSQL](https://www.postgresql.org/download/)

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/aiapply.git
    cd aiapply
    ```

2.  **Backend Setup:**
    - Navigate to the root directory.
    - Create a `.env` file and add your database credentials and other environment variables. See `.env.example` for reference.
    - Install Go dependencies:
      ```bash
      go mod tidy
      ```
    - Run the database migrations:
      The migrations run automatically when the server starts.
    - Start the backend server:
      ```bash
      go run main.go
      ```
    The backend server will be running on `http://localhost:8090`.

3.  **Frontend Setup:**
    - Navigate to the `frontend/stellar-job-seeker-hub` directory.
    - Install Node.js dependencies:
      ```bash
      npm install
      ```
    - Start the frontend development server:
      ```bash
      npm run dev
      ```
    The frontend development server will be running on `http://localhost:8080`.

## API Endpoints

The backend exposes the following REST API endpoints:

- `POST /login`: User login.
- `POST /register`: User registration.
- `POST /google`: Google OAuth login.

### Protected Routes (require JWT)

- `GET /api/profile`: Get user profile.
- `PUT /api/profile`: Update user profile.
- `GET /api/analytics`: Get user analytics.
- `GET /api/users`: List all users.
- `GET /api/users/:id`: Get a specific user.
- `PUT /api/users/:id`: Update a user.
- `DELETE /api/users/:id`: Delete a user.
- `POST /api/scrape/:platform`: Scrape jobs from a specific platform.
- `POST /api/applications`: Create a new job application.
- `GET /api/applications`: Get all job applications for the user.

## 📂 Folder Structure

```
.
├── database/       # Database connection and setup
├── emailer/        # Emailing functionalities
├── frontend/       # React frontend application
├── handler/        # Gin HTTP handlers
├── linkedin/       # LinkedIn specific logic
├── middleware/     # Gin middleware (e.g., auth)
├── models/         # GORM database models
├── utils/          # Utility functions
├── wellfound/      # Wellfound specific logic
├── go.mod          # Go module dependencies
├── main.go         # Main application entry point
└── README.md
```

## 🤝 Contributing

Contributions are welcome! Please read our [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute to this project.

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.