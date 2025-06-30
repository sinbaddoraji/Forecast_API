#!/bin/bash

# Test authentication flow for the Forecast API

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Base URL - adjust if needed
BASE_URL="http://localhost:5000"

# Function to print colored output
print_test() {
    echo -e "${YELLOW}Testing: $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Function to make authenticated request
make_request() {
    local endpoint="$1"
    local method="${2:-GET}"
    local data="$3"
    
    if [ -z "$TOKEN" ]; then
        echo "No token set. Please set TOKEN environment variable."
        return 1
    fi
    
    if [ "$method" == "POST" ] && [ -n "$data" ]; then
        curl -s -X "$method" \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$BASE_URL$endpoint"
    else
        curl -s -X "$method" \
            -H "Authorization: Bearer $TOKEN" \
            "$BASE_URL$endpoint"
    fi
}

echo "=== Forecast API Authentication Test ==="
echo ""

# Test 1: Public endpoint
print_test "Public endpoint (no auth required)"
response=$(curl -s "$BASE_URL/api/authtest/public")
if echo "$response" | grep -q "public endpoint"; then
    print_success "Public endpoint accessible"
else
    print_error "Public endpoint failed"
fi

echo ""

# Check if token is provided
if [ -z "$TOKEN" ]; then
    echo "Please provide a JWT token:"
    echo "export TOKEN=\"your-jwt-token\""
    echo ""
    echo "You can get a token from your OAuth provider (Zitadel)"
    exit 1
fi

# Test 2: Protected endpoint
print_test "Protected endpoint (auth required)"
response=$(make_request "/api/authtest/protected")
if echo "$response" | grep -q "protected endpoint"; then
    print_success "Protected endpoint accessible"
    echo "Response: $response" | jq . 2>/dev/null || echo "$response"
else
    print_error "Protected endpoint failed"
    echo "Response: $response"
fi

echo ""

# Test 3: Debug user info
print_test "User debug information"
response=$(make_request "/api/authtest/debug")
if echo "$response" | grep -q "debug information"; then
    print_success "Retrieved user debug info"
    echo "Response: $response" | jq . 2>/dev/null || echo "$response"
    
    # Extract user spaces
    spaces=$(echo "$response" | jq -r '.spaces[]?.spaceId' 2>/dev/null)
else
    print_error "Failed to get user debug info"
    echo "Response: $response"
fi

echo ""

# Test 4: Create test space
print_test "Creating test space"
response=$(make_request "/api/authtest/create-test-space" "POST")
if echo "$response" | grep -q "created successfully"; then
    print_success "Test space created"
    echo "Response: $response" | jq . 2>/dev/null || echo "$response"
    
    # Extract the new space ID
    new_space_id=$(echo "$response" | jq -r '.space.spaceId' 2>/dev/null)
    echo "New Space ID: $new_space_id"
else
    print_error "Failed to create test space"
    echo "Response: $response"
fi

echo ""

# Test 5: Access space-protected endpoint
if [ -n "$new_space_id" ]; then
    print_test "Accessing space-protected endpoint with new space"
    response=$(make_request "/api/authtest/space/$new_space_id")
    if echo "$response" | grep -q "space membership"; then
        print_success "Space access authorized"
        echo "Response: $response" | jq . 2>/dev/null || echo "$response"
    else
        print_error "Space access denied"
        echo "Response: $response"
    fi
else
    # Try with a hardcoded space ID (the one from the error)
    print_test "Accessing space-protected endpoint with hardcoded ID"
    response=$(make_request "/api/authtest/space/67e69d6c-a0e8-462b-879c-cb347a77c306")
    echo "Response: $response"
fi

echo ""

# Test 6: Get updated user info
print_test "Getting updated user info"
response=$(make_request "/api/authtest/debug")
if echo "$response" | grep -q "debug information"; then
    print_success "Retrieved updated user info"
    echo "User spaces:"
    echo "$response" | jq '.spaces[]' 2>/dev/null || echo "No spaces found"
else
    print_error "Failed to get updated user info"
fi

echo ""
echo "=== Test Complete ==="