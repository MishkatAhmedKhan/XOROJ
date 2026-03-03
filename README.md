# Online Judge Project

An online platform for submitting and evaluating code. This project uses **PostgreSQL** for the database, **Docker** for secure code execution, and **local file storage** for problem artifacts and user submissions.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technologies Used](#technologies-used)
3. [Developer Setup](#developer-setup)

   * [Backend Setup](#backend-setup)
   * [Frontend Setup](#frontend-setup)
   * [Docker Setup](#docker-setup)
4. [Running the Application](#running-the-application)
5. [User Guide](#user-guide)
6. [Configuration](#configuration)

---

## Project Overview

This online judge allows users to:

* Submit code in multiple languages.
* Create problems and contests.
* Evaluate submissions in a secure, sandboxed environment using Docker.
* Store submissions and problem artifacts locally.

The problem creation page is intuitive for users familiar with standard online judge platforms.

---

## Technologies Used

* **Backend:** Spring Boot (Java), Maven
* **Frontend:** Vite + React (or other frontend framework)
* **Database:** PostgreSQL
* **Code Execution:** Docker containers
* **Storage:** Local file storage for submissions and problem data

---

## Developer Setup

### Backend Setup

1. **Install PostgreSQL**
   Download and install from [PostgreSQL Official Site](https://www.postgresql.org/download/).

2. **Set Environment Variables**
   Create a `.env` file in the same directory as `application.yml`:

   ```env
   DB_USERNAME=your_username
   DB_NAME=your_database_name
   DB_PASSWORD=your_password
   ```

3. **Run Backend**

   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```

   * The backend runs on **localhost:8081** by default.
   * To change the port, update `application.yml` and also update `vite.config.js` in the frontend with the new backend IP/port.

---

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run the frontend:

   ```bash
   npm run dev
   ```

   * The frontend runs on **localhost:5173** by default.

---

### Docker Setup

1. **Build the Docker Image**

   ```bash
   docker build -t gcc-time:13 .
   ```

2. **Update Docker Image in Backend**
   Open `cppExecutor.java` and ensure the image name/tag matches the one you built:

   ```java
   // Example
   String dockerImage = "gcc-time:13";
   ```

3. Docker is used to securely execute user-submitted code in a sandboxed environment.

---

## Running the Full Application

1. Start PostgreSQL.
2. Run backend: `./mvnw spring-boot:run` (inside backend).
3. Run frontend: `npm run dev` (inside frontend).
4. Ensure backend port matches frontend configuration (`vite.config.js`).

---

## User Guide

* **Creating Problems and Contests**
  Anyone can create problems or contests. The interface is intuitive and similar to other online judges.

* **Submitting Code**
  Users can submit code to problems, which is executed in Docker containers for sandboxing.

* **Viewing Results**
  Submission results and scores are displayed on the frontend in real-time.

---

## Configuration

* **Backend port:** `application.yml` (default 8081)

* **Frontend backend URL:** `vite.config.js`

* **Docker image name:** `cppExecutor.java`

* **Local storage paths:**

  * Problem artifacts: `/uploads/problems/`
  * Submissions: `/uploads/submissions/`
  This can be changed in application.yml file
