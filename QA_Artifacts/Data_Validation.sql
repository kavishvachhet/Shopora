-- ==============================================================================
-- Shopora QA Data Validation Scripts (PostgreSQL/MySQL Syntax)
-- Purpose: To validate backend data integrity during and after test executions.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Verify User Created Correctly
-- Scenario: After registering a new user via the UI/API, verify the record exists.
-- ------------------------------------------------------------------------------
SELECT id, email, first_name, last_name, created_at, status 
FROM users 
WHERE email = 'qa_test_user@example.com';
-- Expected Result: 1 row returned. Status should be 'Active'.

-- ------------------------------------------------------------------------------
-- 2. Verify Order Amount is Correct
-- Scenario: Verify the total_amount in the orders table matches the sum of 
-- the individual order items (quantity * unit_price).
-- ------------------------------------------------------------------------------
SELECT 
    o.id AS order_id, 
    o.total_amount AS recorded_total, 
    SUM(oi.quantity * oi.unit_price) AS calculated_total
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
WHERE o.id = 'ORD-10045'
GROUP BY o.id, o.total_amount
HAVING o.total_amount != SUM(oi.quantity * oi.unit_price);
-- Expected Result: 0 rows returned. If rows are returned, there is a calculation bug.

-- ------------------------------------------------------------------------------
-- 3. Verify Product Stock Decreases
-- Scenario: Record product stock before checkout, perform checkout, and verify 
-- stock is deducted by exactly the order quantity.
-- ------------------------------------------------------------------------------
-- Step A: Get stock before order (Manual Check)
-- SELECT id, name, stock_quantity FROM products WHERE id = 'PROD-77';

-- Step B: Validate stock after order
SELECT 
    p.id AS product_id,
    p.name,
    p.stock_quantity AS current_stock,
    -- Assuming we have an audit log or we know the previous stock was 50, and order qty was 2
    (50 - 2) AS expected_stock
FROM products p
WHERE p.id = 'PROD-77';
-- Expected Result: current_stock should equal expected_stock.

-- ------------------------------------------------------------------------------
-- 4. Verify Cart Items are Removed After Checkout
-- Scenario: After a successful order placement, the user's active cart should be empty.
-- ------------------------------------------------------------------------------
SELECT c.id AS cart_id, ci.product_id, ci.quantity
FROM carts c
LEFT JOIN cart_items ci ON c.id = ci.cart_id
WHERE c.user_id = (SELECT id FROM users WHERE email = 'qa_test_user@example.com')
  AND c.status = 'Active';
-- Expected Result: 0 rows returned in cart_items for the active cart.

-- ------------------------------------------------------------------------------
-- 5. Verify Order Status Changes Correctly
-- Scenario: Validate that after an admin marks an order as shipped, the status updates.
-- ------------------------------------------------------------------------------
SELECT id, status, updated_at 
FROM orders 
WHERE id = 'ORD-10045';
-- Expected Result: status should be 'Shipped', and updated_at should reflect recent time.
