# Shopora 🛍️ | QA Automation & Testing Portfolio

[![CI/CD Pipeline](https://github.com/kavishvachhet/Shopora/actions/workflows/ci.yml/badge.svg)](https://github.com/kavishvachhet/Shopora/actions/workflows/ci.yml)

Shopora is a premium, full-stack e-commerce application serving as a **comprehensive showcase of modern Quality Assurance methodologies**, automated testing pipelines, and manual testing artifacts. 

While the application features a robust MERN stack architecture (React, Express, MongoDB, Redis), this repository is primarily geared towards demonstrating enterprise-grade QA practices, from Jira test management to CI/CD pipeline automation.

## 🧪 Comprehensive QA & Testing Suite

This project contains a dedicated `QA_Artifacts` directory and automated test suites that highlight end-to-end testing capabilities:

### 1. Test Management & Jira Integration
- **Manual Test Cases**: Includes a comprehensive `Test_Cases_Shopora.csv` containing Functional, Boundary-Value, and Negative test cases, perfectly formatted for immediate import into Jira test management plugins like **Zephyr Scale** or **Xray**.
- **Bug Reporting & Workflow**: Includes a documented Jira workflow guide demonstrating professional bug reporting, traceability, and test cycle execution.

### 2. Database Validation & Integrity (SQL)
- **Data Validation Scripts**: Contains `Data_Validation.sql` (PostgreSQL/MySQL syntax) demonstrating the ability to independently query and verify backend data integrity, such as verifying order total calculations (`SUM(quantity * price)`), stock deductions, and status state changes.

### 3. API Test Automation
- **Postman & Newman**: Includes a full Postman API testing collection (`Shopora_API_Tests.json`) with assertions for status codes, JSON schemas, and response validation.
- **CI/CD Integration**: The Postman API tests are automatically executed via **Newman** within the GitHub Actions CI pipeline on every push.

### 4. Automated Integration & Unit Testing
- **In-Memory Testing**: The backend utilizes `mongodb-memory-server` and `supertest` to run **88 automated integration tests** lightning-fast without requiring a live database connection.
- **Coverage**: Tests cover critical paths including JWT authentication, password hashing utilities, cart state management, and product sorting algorithms.

### 5. Testing Strategy
- **Methodology Documentation**: Includes a formal `Testing_Strategy.md` defining how and when Smoke Testing, Sanity Testing, and Regression Testing are applied across the application lifecycle.

## 🛠️ QA Tech Stack

- **Test Management**: Jira, Zephyr Scale / Xray (CSV Imports)
- **API Automation**: Postman, Newman
- **Backend Testing**: Jest, Supertest, mongodb-memory-server
- **Frontend Testing**: Vitest, React Testing Library
- **CI/CD Pipeline**: GitHub Actions
- **Data Validation**: SQL (MySQL/PostgreSQL mock queries), MongoDB
- **Version Control**: Git, Husky (Pre-commit hooks)

---

## 🚀 Application Architecture (SDE Highlights)

To provide a realistic testing environment, the Shopora application itself is engineered with enterprise scalability in mind:

- **High-Speed Redis Caching**: Dockerized Redis instance for server-side caching of the product catalog to reduce API latency.
- **PM2 Clustering**: Utilizes Node.js cluster mode via PM2 to leverage all CPU cores, handling peaks of nearly 1,000 requests per second.
- **MongoDB Indexing**: Strategic indexing on Mongoose schemas translating slow database collection scans into instant index scans.
- **Cloudinary CDN**: Optimized, lightning-fast image delivery.
- **Razorpay Integration**: Secure checkout with server-side cryptographic signature verification.

## 🏁 Getting Started for QA Review

### Prerequisites
- Node.js (v18+)
- Newman (Install globally: `npm install -g newman`)

### Installation & Running Tests

1. Clone the repository and install dependencies:
   ```bash
   git clone https://github.com/kavishvachhet/Shopora.git
   cd Shopora
   npm install
   ```

2. Run the Automated Backend Integration Tests (Jest):
   ```bash
   npm test
   ```

3. Run the Automated API Tests (Newman):
   ```bash
   # Make sure the dev server is running first (npm run dev)
   npx newman run tests/api/Shopora_API_Tests.json
   ```

4. **Review QA Artifacts**: Open the `QA_Artifacts` directory to view the SQL validation scripts, Testing Strategy, and Jira Test Case CSVs.

---
*Built & Tested by Kavish Vachheta*
