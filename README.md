# XorOJ — Online Judge

A competitive programming online judge platform. Built with **Spring Boot**, **React**, and **PostgreSQL**. Code execution is handled natively via `g++` and `ProcessBuilder` — no Docker required.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technologies Used](#technologies-used)
3. [Developer Setup](#developer-setup)
   * [Prerequisites](#prerequisites)
   * [Backend Setup](#backend-setup)
   * [Frontend Setup](#frontend-setup)
4. [Running the Application](#running-the-application)
5. [User Guide](#user-guide)
6. [Configuration](#configuration)

---

## Project Overview

XorOJ allows users to:

* Submit C++ code to problems and receive instant verdicts.
* Create and manage problems with test cases, validators, and custom checkers.
* Participate in contests with ICPC-style standings.
* Track progress via leaderboards, activity heatmaps, and submission analytics.
* Read and write blog posts, vote, comment, and bookmark content.
* Store submissions and problem artifacts locally on the filesystem.

---

## Technologies Used

* **Backend:** Java 24, Spring Boot 3.5, Spring Security, Spring Data JPA, JWT
* **Frontend:** React 19, Vite 7, Tailwind CSS, DaisyUI, Monaco Editor, MathJax
* **Database:** PostgreSQL 14+ (triggers, stored functions, materialized views, cursors)
* **Code Execution:** Native `g++` compilation and `ProcessBuilder` execution (`CppExecutor`)
* **Storage:** Local file storage for submissions and problem data

---

## Developer Setup

### Prerequisites

* **Java 24** (or compatible JDK)
* **Node.js** (v18+)
* **PostgreSQL 14+**
* **g++** (GCC) installed and available on PATH

### Backend Setup

1. **Install PostgreSQL**
   Download and install from [PostgreSQL Official Site](https://www.postgresql.org/download/).

2. **Set Environment Variables**
   Create a `.env` file in the `backend/` directory (same level as `application.yml`):

   ```env
   POSTGRES_URL=jdbc:postgresql://localhost:5432/your_database_name
   POSTGRES_USERNAME=your_username
   POSTGRES_PASSWORD=your_password
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

## Running the Full Application

1. Start PostgreSQL.
2. Ensure `g++` is installed and on your PATH.
3. Run backend: `./mvnw spring-boot:run` (inside `backend/`).
4. Run frontend: `npm run dev` (inside `frontend/`).
5. Ensure backend port matches frontend configuration (`vite.config.js`).

---

## User Guide

* **Creating Problems and Contests**
  Anyone can create problems or contests. The interface is intuitive and similar to other online judges.

* **Submitting Code**
  Users submit C++ code, which is compiled with `g++` and executed natively via `ProcessBuilder` with time and memory limits.

* **Viewing Results**
  Submission results (AC, WA, TLE, MLE, RE, CE) and scores are displayed on the frontend.

---

## Configuration

* **Backend port:** `application.yml` (default 8081)

* **Frontend backend URL:** `vite.config.js`

* **Local storage paths:**

  * Problem artifacts: `uploads/problems/`
  * Submissions: `uploads/submissions/`
  This can be changed in application.yml file
