@echo off
echo Starting backend...
start cmd /k "cd /d %~dp0 && node index.js"

timeout /t 3 /nobreak

echo Starting frontend...
start cmd /k "cd /d %~dp0todo-frontend && npm run dev"

timeout /t 4 /nobreak

start http://localhost:5173

exit