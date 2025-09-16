# Simple BrainJar API Test Script
$BaseUrl = "http://localhost:7000"

Write-Host "Testing BrainJar APIs..." -ForegroundColor Green
Write-Host "Base URL: $BaseUrl" -ForegroundColor Yellow

# Test 1: Health Check
Write-Host "`n1. Testing Health Endpoint..." -ForegroundColor Cyan
try {
    $health = Invoke-RestMethod -Uri "$BaseUrl/health" -Method GET -TimeoutSec 10
    Write-Host "SUCCESS: Health check passed" -ForegroundColor Green
    Write-Host "Response: $($health | ConvertTo-Json -Compress)" -ForegroundColor Gray
} catch {
    Write-Host "FAILED: Health check failed - $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: User Registration
Write-Host "`n2. Testing User Registration..." -ForegroundColor Cyan
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$registerData = @{
    username = "testuser_$timestamp"
    email = "test_${timestamp}@example.com"
    password = "TestPassword123!"
} | ConvertTo-Json

try {
    $register = Invoke-RestMethod -Uri "$BaseUrl/api/auth/register" -Method POST -Body $registerData -ContentType "application/json" -TimeoutSec 10
    Write-Host "SUCCESS: User registration passed" -ForegroundColor Green
    $userId = $register.id
} catch {
    Write-Host "FAILED: User registration failed - $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

# Test 3: User Login
Write-Host "`n3. Testing User Login..." -ForegroundColor Cyan
$loginData = @{
    email = "test_${timestamp}@example.com"
    password = "TestPassword123!"
} | ConvertTo-Json

try {
    $login = Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" -Method POST -Body $loginData -ContentType "application/json" -TimeoutSec 10
    Write-Host "SUCCESS: User login passed" -ForegroundColor Green
    $token = $login.token
    $headers = @{ Authorization = "Bearer $token" }
} catch {
    Write-Host "FAILED: User login failed - $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

# Test 4: Get Problems
Write-Host "`n4. Testing Problems Endpoint..." -ForegroundColor Cyan
try {
    $problems = Invoke-RestMethod -Uri "$BaseUrl/api/problems" -Method GET -TimeoutSec 10
    Write-Host "SUCCESS: Problems endpoint passed" -ForegroundColor Green
    Write-Host "Found $($problems.Count) problems" -ForegroundColor Gray
} catch {
    Write-Host "FAILED: Problems endpoint failed - $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Get User Suggestions (requires auth)
if ($headers) {
    Write-Host "`n5. Testing User Suggestions (Auth Required)..." -ForegroundColor Cyan
    try {
        $suggestions = Invoke-RestMethod -Uri "$BaseUrl/api/users/suggestions" -Method GET -Headers $headers -TimeoutSec 10
        Write-Host "SUCCESS: User suggestions passed" -ForegroundColor Green
    } catch {
        Write-Host "FAILED: User suggestions failed - $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "`n5. SKIPPED: User suggestions (no auth token)" -ForegroundColor Yellow
}

# Test 6: Get Streaks (requires auth)
if ($headers) {
    Write-Host "`n6. Testing Streaks Endpoint (Auth Required)..." -ForegroundColor Cyan
    try {
        $streaks = Invoke-RestMethod -Uri "$BaseUrl/api/streaks" -Method GET -Headers $headers -TimeoutSec 10
        Write-Host "SUCCESS: Streaks endpoint passed" -ForegroundColor Green
    } catch {
        Write-Host "FAILED: Streaks endpoint failed - $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "`n6. SKIPPED: Streaks endpoint (no auth token)" -ForegroundColor Yellow
}

# Test 7: Get Friends (requires auth)
if ($headers) {
    Write-Host "`n7. Testing Friends Endpoint (Auth Required)..." -ForegroundColor Cyan
    try {
        $friends = Invoke-RestMethod -Uri "$BaseUrl/api/friends" -Method GET -Headers $headers -TimeoutSec 10
        Write-Host "SUCCESS: Friends endpoint passed" -ForegroundColor Green
    } catch {
        Write-Host "FAILED: Friends endpoint failed - $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "`n7. SKIPPED: Friends endpoint (no auth token)" -ForegroundColor Yellow
}

Write-Host "`nAPI testing completed!" -ForegroundColor Green