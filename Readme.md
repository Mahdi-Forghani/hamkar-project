# Hamkar

Hamkar is a web application for businesses to search for products, discover market offers, and manage their products.

**MVP project built with React, ASP.NET Core, PostgreSQL, and AI-powered services.**

## ✨ Features

* 🔎 Product search
* 📦 Product management
* 💰 Offer management
* 📱 Phone number authentication with OTP
* 🤖 AI-assisted product creation from a URL
* 👥 User access management
* 🔐 JWT-based authentication

## 🧰 Tech Stack

| Layer            | Technology                  |
| ---------------- | --------------------------- |
| Frontend         | React                       |
| Build Tool       | Vite                        |
| UI               | Ant Design                  |
| Routing          | React Router                |
| Backend          | ASP.NET Core                |
| ORM              | Entity Framework Core       |
| Authentication   | ASP.NET Core Identity + JWT |
| Database         | PostgreSQL                  |
| Reverse Proxy    | Nginx                       |
| Containerization | Docker + Docker Compose     |
| SMS              | Kavenegar                   |
| AI               | OpenAI                      |

## 🔐 Authentication

Hamkar uses **phone-number authentication with OTP**.

```mermaid
sequenceDiagram
    actor User
    participant Web as React App
    participant API as ASP.NET Core API
    participant SMS as Kavenegar

    User->>Web: Enter phone number
    Web->>API: Request OTP
    API->>SMS: Send OTP
    SMS-->>User: OTP
    User->>Web: Enter OTP
    Web->>API: Verify OTP
    API-->>Web: JWT
    Web-->>User: Authenticated
```

## 📂 Project Structure

```text
.
├── frontend/              # React application
├── backend/               # ASP.NET Core API
├── landing/               # Landing page
├── docker-compose.yml
├── .env.example
└── README.md
```

## 🚀 Getting Started

### Prerequisites

* Docker
* Docker Compose
* A **Kavenegar API Key**
* An **OpenAI API Key**

### 1. Clone the repository

```bash
git clone <repository-url>
cd hamkar
```

### 2. Configure environment variables

Create a `.env` file based on `.env.example`.

At minimum, you need to provide:

```env
POSTGRES_PASSWORD=your-password

SMS_APIKEY=your-kavenegar-api-key
AI_APIKEY=your-open-ai-api-key
```

> **You need an API key from both Kavenegar and OpenAI to run the complete application locally.**

> **Never commit `.env` files, API keys, passwords, or other secrets to the repository.**

### 3. Start the application

```bash
docker compose up -d
```

To view the application logs:

```bash
docker compose logs -f
```

To stop the application:

```bash
docker compose down
```

## 🔌 External Services

### Kavenegar

Used for sending OTP messages during phone-number authentication.

[Kavenegar](https://kavenegar.com)

**Required configuration:**

```env
KAVENEGAR_API_KEY=your-kavenegar-api-key
```

**Required configuration:**

```env
AI_APIKEY=your-open-ai-api-key
```

## 🌐 Deployment

The application is containerized using Docker Compose.

```mermaid
flowchart LR
    Internet["Internet"]

    Internet --> Nginx["Nginx"]

    Nginx --> Frontend["Frontend"]
    Nginx --> API["Backend API"]

    API --> PostgreSQL[("PostgreSQL")]
```

## 📌 Project Status

**MVP**

The current implementation focuses on the core product flow and MVP requirements.

It is **not intended to be a production-ready reference architecture**. Some areas such as testing, architecture, observability, security hardening, and scalability would require further work for a production environment.

## 📄 License
This project is available for educational and demonstration purposes.