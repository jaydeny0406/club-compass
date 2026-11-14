@echo off
setlocal

set "PROJECT_ROOT=%~dp0"
set "NODE_DIR=%PROJECT_ROOT%.tools\node-v24.20.0-win-x64"
set "DOCKER_USER_BIN=%LOCALAPPDATA%\Programs\DockerDesktop\resources\bin"
set "DOCKER_SYSTEM_BIN=%ProgramFiles%\Docker\Docker\resources\bin"

if not exist "%NODE_DIR%\node.exe" (
  echo Project-local Node.js was not found.
  echo Install Node.js 24 LTS, then run the requested npm script normally.
  exit /b 1
)

if "%~1"=="" goto usage

set "PATH=%NODE_DIR%;%PATH%"
if exist "%DOCKER_USER_BIN%\docker.exe" set "PATH=%DOCKER_USER_BIN%;%PATH%"
if exist "%DOCKER_SYSTEM_BIN%\docker.exe" set "PATH=%DOCKER_SYSTEM_BIN%;%PATH%"
cd /d "%PROJECT_ROOT%"
call "%NODE_DIR%\npm.cmd" run %~1
exit /b %errorlevel%

:usage
echo Usage: .\club-compass.cmd SCRIPT
echo.
echo Common scripts:
echo   dev       Start the web application
echo   check     Run tests, type checking, and linting
echo   build     Create a production build
echo   db:start  Start local Supabase ^(Docker required^)
echo   db:configure  Fill .env.local from the running local Supabase project
echo   db:migrate  Apply local migrations without resetting data
echo   db:reset  Recreate the local database
echo   db:test   Run the database security tests
echo   db:test-users  Create/update six local role test accounts
echo   db:types  Generate TypeScript types from the local schema
echo   test:e2e  Run the browser sign-in and permissions tests
echo   db:stop   Stop local Supabase
exit /b 1
