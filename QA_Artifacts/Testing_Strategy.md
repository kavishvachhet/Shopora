# Shopora QA Testing Strategy

## 1. Functional Testing
**Objective**: To verify that the software system operates according to the designated requirements and specifications.
**Scope in Shopora**:
- User Authentication (Login, Registration, Logout)
- Core E-commerce flow (Browsing products, Adding to Cart, Checkout process)
- Payment Gateway Integration

## 2. Smoke Testing
**Objective**: To verify that the most crucial functions of the application work. It's a shallow and wide test. If smoke tests fail, the build is rejected.
**Shopora Smoke Test Suite**:
- Can the user load the homepage?
- Can the user log in with valid credentials?
- Can a product be added to the cart?
- Is the checkout page reachable?

## 3. Sanity Testing
**Objective**: To determine if a specific new functionality or bug fix works as expected. It is deep and narrow.
**Example Scenario in Shopora**:
- A developer fixes a bug where the "Apply Coupon" button was unresponsive on mobile devices.
- **Sanity Test**: The QA Engineer will test the coupon application thoroughly on various mobile viewports, without executing the full Regression Suite.

## 4. Regression Testing
**Objective**: To confirm that a recent program or code change has not adversely affected existing features.
**Scope in Shopora**:
- Executed before any major release to the Production environment.
- Involves running the complete suite of Functional, Boundary, and Negative test cases (e.g., all test cases in the `Test_Cases_Shopora.csv`).
- In an advanced setup, this is automated via CI/CD pipelines using tools like Cypress or Selenium.

## 5. Boundary-Value Testing
**Objective**: To test the boundaries of input fields, as errors often occur at the extreme ends of input domains.
**Shopora Boundary Examples**:
- **Passwords**: Testing passwords with exactly 7 chars (fail), 8 chars (pass), and 50 chars (max limit).
- **Cart Quantity**: Testing adding 0 items, 1 item, and 99 items (assuming 99 is the max).

## 6. Negative Testing
**Objective**: To ensure the application can handle invalid input or unexpected user behavior gracefully without crashing.
**Shopora Negative Examples**:
- Attempting to check out with zero items in the cart.
- Entering alphabetic characters into a credit card number field.
- Trying to apply an expired or non-existent coupon code.

## 7. API Testing
**Objective**: To validate the application programming interfaces directly, ensuring backend logic, response codes, and data schemas are correct independent of the UI.
**Scope in Shopora**:
- Verifying the `/api/users/login` endpoint returns a valid JWT token.
- Verifying error responses (400, 401, 403, 404, 500) are formatted correctly.
- *Refer to the `tests/api/Shopora_API_Tests.json` Postman collection.*
