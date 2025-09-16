# Comprehensive BrainJar API Test Script
param(
    [string]$BaseUrl = "http://localhost:7000"
)

Write-Host "🧪 BrainJar API Testing Suite" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan
Write-Host "Base URL: $BaseUrl" -ForegroundColor White
Write-Host ""

$global:TestResults = @()
$global:AuthToken = $null
$global:TestUserId = $null

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        [object]$Body = $null,
        [hashtable]$Headers = @{},
        [bool]$RequiresAuth = $false
    )
    
    Write-Host "Testing: $Name" -ForegroundColor Yellow
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $Headers
        }
        
        if ($Body) {
            $params.Body = $Body
            $params.ContentType = "application/json"
        }
        
        if ($RequiresAuth -and $global:AuthToken) {
            $params.Headers["Authorization"] = "Bearer $global:AuthToken"
        }
        
        $response = Invoke-RestMethod @params
        Write-Host "✅ SUCCESS: $Name" -ForegroundColor Green
        $global:TestResults += @{
            Test = $Name
            Status = "PASS"
            Response = $response
        }
        return $response
    }
    catch {
        Write-Host "❌ FAILED: $Name" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.ErrorDetails.Message) {
            Write-Host "   Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
        }
        $global:TestResults += @{
            Test = $Name
            Status = "FAIL"
            Error = $_.Exception.Message
        }
        return $null
    }
}

# Test 1: Health Check
Write-Host "`n1️⃣ Testing Health Endpoint" -ForegroundColor Magenta
$healthResponse = Test-Endpoint -Name "Health Check" -Url "$BaseUrl/health"

# Test 2: User Registration
Write-Host "`n2️⃣ Testing Authentication Endpoints" -ForegroundColor Magenta
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$testUser = @{
    username = "testuser_$timestamp"
    email = "test_${timestamp}@example.com"
    password = "TestPassword123!"
} | ConvertTo-Json

$registerResponse = Test-Endpoint -Name "User Registration" -Url "$BaseUrl/api/auth/register" -Method "POST" -Body $testUser

if ($registerResponse) {
    $global:TestUserId = $registerResponse.id
}

# Test 3: User Login
$loginData = @{
    email = "test_${timestamp}@example.com"
    password = "TestPassword123!"
} | ConvertTo-Json

$loginResponse = Test-Endpoint -Name "User Login" -Url "$BaseUrl/api/auth/login" -Method "POST" -Body $loginData

if ($loginResponse -and $loginResponse.token) {
    $global:AuthToken = $loginResponse.token
    Write-Host "🔑 Auth token acquired for protected endpoints" -ForegroundColor Green
}

# Test 4: User Suggestions (requires auth)
Test-Endpoint -Name "User Suggestions" -Url "$BaseUrl/api/users/suggestions" -RequiresAuth $true

# Test 5: Problems Endpoints
Write-Host "`n3️⃣ Testing Problems Endpoints" -ForegroundColor Magenta
Test-Endpoint -Name "Get All Problems" -Url "$BaseUrl/api/problems"
Test-Endpoint -Name "Get Community Problems" -Url "$BaseUrl/api/problems/community"

if ($global:AuthToken) {
    Test-Endpoint -Name "Get User Problems" -Url "$BaseUrl/api/problems/user" -RequiresAuth $true
    
    # Create a test problem
    $testProblem = @{
        title = "Test Problem $timestamp"
        description = "This is a test problem created by the API test suite"
        difficulty = "easy"
        category = "algorithms"
    } | ConvertTo-Json
    
    $createdProblem = Test-Endpoint -Name "Create Problem" -Url "$BaseUrl/api/problems" -Method "POST" -Body $testProblem -RequiresAuth $true
    
    if ($createdProblem -and $createdProblem.id) {
        $problemId = $createdProblem.id
        Test-Endpoint -Name "Get Problem Solutions" -Url "$BaseUrl/api/problems/$problemId/solutions"
        
        # Submit a solution
        $testSolution = @{
            content = "function solve() { return 'test solution'; }"
            language = "javascript"
        } | ConvertTo-Json
        
        Test-Endpoint -Name "Submit Solution" -Url "$BaseUrl/api/problems/$problemId/solutions" -Method "POST" -Body $testSolution -RequiresAuth $true
    }
}

# Test 6: Streaks Endpoints
Write-Host "`n4️⃣ Testing Streaks Endpoints" -ForegroundColor Magenta
if ($global:AuthToken) {
    Test-Endpoint -Name "Get User Streaks" -Url "$BaseUrl/api/streaks" -RequiresAuth $true
}

# Test 7: Friends Endpoints
Write-Host "`n5️⃣ Testing Friends Endpoints" -ForegroundColor Magenta
if ($global:AuthToken) {
    Test-Endpoint -Name "Get Friends List" -Url "$BaseUrl/api/friends" -RequiresAuth $true
    Test-Endpoint -Name "Get Friend Requests" -Url "$BaseUrl/api/friends/requests" -RequiresAuth $true
}

# Test 8: Messages Endpoints
Write-Host "`n6️⃣ Testing Messages Endpoints" -ForegroundColor Magenta
if ($global:AuthToken) {
    # Note: These will likely fail without actual friends, but we'll test the endpoints
    $testFriendId = "550e8400-e29b-41d4-a716-446655440001"  # Sample UUID
    Test-Endpoint -Name "Get Conversation History" -Url "$BaseUrl/api/messages/$testFriendId" -RequiresAuth $true
}

# Test 9: Chat Endpoints
Write-Host "`n7️⃣ Testing Chat Endpoints" -ForegroundColor Magenta
if ($global:AuthToken) {
    Test-Endpoint -Name "Get Chat Users" -Url "$BaseUrl/api/chat/users" -RequiresAuth $true
    Test-Endpoint -Name "Get Conversations" -Url "$BaseUrl/api/chat/conversations" -RequiresAuth $true
}

# Test Summary
Write-Host "`n📊 TEST SUMMARY" -ForegroundColor Cyan
Write-Host "===============" -ForegroundColor Cyan

$passCount = ($global:TestResults | Where-Object { $_.Status -eq "PASS" }).Count
$failCount = ($global:TestResults | Where-Object { $_.Status -eq "FAIL" }).Count
$totalCount = $global:TestResults.Count

Write-Host "Total Tests: $totalCount" -ForegroundColor White
Write-Host "Passed: $passCount" -ForegroundColor Green
Write-Host "Failed: $failCount" -ForegroundColor Red

if ($failCount -gt 0) {
    Write-Host "`n❌ FAILED TESTS:" -ForegroundColor Red
    $global:TestResults | Where-Object { $_.Status -eq "FAIL" } | ForEach-Object {
        Write-Host "   - $($_.Test): $($_.Error)" -ForegroundColor Red
    }
}

Write-Host "`n✅ PASSED TESTS:" -ForegroundColor Green
$global:TestResults | Where-Object { $_.Status -eq "PASS" } | ForEach-Object {
    Write-Host "   - $($_.Test)" -ForegroundColor Green
}

if ($passCount -eq $totalCount) {
    Write-Host "`n🎉 ALL TESTS PASSED! API is working correctly." -ForegroundColor Green
} else {
    Write-Host "`n⚠️ Some tests failed. Review the failures above." -ForegroundColor Yellow
}

Write-Host "`nTest completed at $(Get-Date)" -ForegroundColor Gray