@echo off
echo ========================================================
echo        🚀 Starting Shopora Enterprise Environment       
echo ========================================================
echo.

echo [1/3] Starting Redis (Cache) via Docker...
docker-compose up -d
echo Redis is running!
echo.

echo [2/3] Starting Node.js Backend Server...
:: Opens a new command prompt window to run the backend
start "Shopora Backend" cmd /k "npm install && npx nodemon server.js"

echo [3/3] Starting React Frontend...
:: Opens a new command prompt window to run the frontend
start "Shopora Frontend" cmd /k "cd client && npm install && npm run dev"

echo.
echo ========================================================
echo ✅ All services have been launched in separate windows!
echo 🌐 Frontend: http://localhost:5173
echo ⚙️  Backend:  http://localhost:3000
echo ========================================================
pause
