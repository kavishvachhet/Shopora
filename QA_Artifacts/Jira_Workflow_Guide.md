# Jira Workflow Guide for Shopora QA

## 1. Project Setup & Organization

When setting up the Jira board for Shopora, use the following hierarchy to organize work effectively:

- **Epic**: A large body of work. E.g., `[SHOP-100] User Authentication System` or `[SHOP-200] E-commerce Checkout Flow`.
- **User Story**: A specific feature within an Epic. E.g., `[SHOP-101] As a user, I want to be able to log in using my email and password.`
- **Test Case (using Zephyr/Xray)**: The specific steps to validate the User Story. E.g., `[SHOP-TEST-101] Verify successful login with valid credentials.`
- **Bug**: A defect found during execution. E.g., `[SHOP-BUG-5] Login button remains disabled after entering valid email.`

## 2. Managing Test Cases

### Importing Test Cases
In a real environment, you wouldn't write hundreds of test cases manually in the Jira UI. You write them in Excel/CSV (like the `Test_Cases_Shopora.csv` provided in this project) and import them.
1. Use the Jira plugin (like Zephyr Scale or Xray).
2. Go to "Test Cases" -> "Import from CSV".
3. Map the CSV columns (Test Summary, Preconditions, Test Steps, Expected Results) to the Jira fields.

### Linking to Requirements
Always ensure **Traceability**. Every Test Case must be linked to a User Story (Requirement). This ensures that when the Story is completed, QA has verified it.

## 3. The Test Execution Cycle

### Creating a Test Cycle
A Test Cycle is a container for test executions. For example, before a release, you create a Test Cycle called `Release 1.2 Regression Cycle`.
1. Add the relevant test cases to the Test Cycle.
2. Assign the test cases to QA team members (yourself).

### Executing Tests
For each test case in the cycle, you execute the steps against the Shopora application.
- Mark the status as **PASS**, **FAIL**, **BLOCKED**, or **WIP**.
- If a test fails, you **MUST** link a Defect (Bug) to the specific failed test step.

## 4. Writing a Professional Bug Report

If you find a defect, your bug report in Jira must be crystal clear to developers. Follow this template:

**Title**: `[Cart] - Quantity does not update when clicking '+' rapidly`

**Description**:
- **Environment**: Staging (Windows 11, Chrome v116)
- **Preconditions**: User must be logged in and have at least 1 item in the cart.
- **Steps to Reproduce**:
  1. Navigate to `http://shopora.local/cart`
  2. Click the '+' button on any product's quantity 5 times rapidly.
  3. Observe the total quantity and price.
- **Expected Result**: The quantity should update to 6, and the total price should recalculate accordingly.
- **Actual Result**: The quantity only updates to 3, and the total price reflects 3 items. Network tab shows concurrent API requests returning 409 Conflict.
- **Severity**: High (Impacting core cart functionality)
- **Priority**: Medium (Edge case, but noticeable)
- **Attachments**: Attach a screenshot or a short video recording of the issue, and the browser console logs.

## 5. Daily QA Routine in Jira
1. **Standup**: Check the active Sprint board. See which User Stories have been moved to the "Ready for QA" column by developers.
2. **Execution**: Execute the test cases linked to those stories.
3. **Bug Triage**: If bugs are found, log them and bring them up in the daily triage meeting with the Product Manager and Developers to prioritize them.
4. **Sign-off**: Once all tests for a story pass, move the ticket to "Done" or "Closed".
