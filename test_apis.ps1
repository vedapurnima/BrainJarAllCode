# Test script for BrainJar APIs
$baseUrl = "http://localhost:7000"

Write-Host "Testing BrainJar APIs..." -ForegroundColor Green

# Test 1: Health check
Write-Host "`n1. Testing health endpoint..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/health" -Method GET
    Write-Host "✅ Health check successful: $($health | ConvertTo-Json)" -ForegroundColor Green
} catch {
    Write-Host "❌ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Register a new user
Write-Host "`n2. Testing user registration..." -ForegroundColor Yellow
try {
    $registerData = @{
        username = "test_user_$(Get-Random)"
        email = "test$(Get-Random)@example.com"
        password = "testpassword123"
    } | ConvertTo-Json

    $register = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method POST -Body $registerData -ContentType "application/json"
    Write-Host "✅ Registration successful: $($register | ConvertTo-Json)" -ForegroundColor Green
    $global:testToken = $register.token
    $global:testUserId = $register.user.id
} catch {
    Write-Host "❌ Registration failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.ErrorDetails.Message)" -ForegroundColor Red
}

# Test 3: Login
Write-Host "`n3. Testing user login..." -ForegroundColor Yellow
try {
    $loginData = @{
        email = "test$(Get-Random)@example.com"
        password = "testpassword123"
    } | ConvertTo-Json

    $login = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    Write-Host "✅ Login successful" -ForegroundColor Green
} catch {
    Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.ErrorDetails.Message)" -ForegroundColor Red
}

# Test 4: Get problems (should work without auth for community problems)
Write-Host "`n4. Testing problems endpoint..." -ForegroundColor Yellow
try {
    $problems = Invoke-RestMethod -Uri "$baseUrl/api/problems" -Method GET
    Write-Host "✅ Problems endpoint successful: Found $($problems.Count) problems" -ForegroundColor Green
} catch {
    Write-Host "❌ Problems endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.ErrorDetails.Message)" -ForegroundColor Red
}

# Test 5: Get streaks (needs auth)
Write-Host "`n5. Testing streaks endpoint..." -ForegroundColor Yellow
try {
    if ($global:testToken) {
        $headers = @{ Authorization = "Bearer $global:testToken" }
        $streaks = Invoke-RestMethod -Uri "$baseUrl/api/streaks" -Method GET -Headers $headers
        Write-Host "✅ Streaks endpoint successful" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Skipping streaks test - no auth token" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Streaks endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.ErrorDetails.Message)" -ForegroundColor Red
}

Write-Host "`nAPI testing completed!" -ForegroundColor Green