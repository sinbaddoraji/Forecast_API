#!/bin/bash

# Script to reproduce the authorization error

echo "Testing authorization error reproduction..."
echo ""

# The error shows user ID being used as space ID
USER_ID="67e69d6c-a0e8-462b-879c-cb347a77c306"
CORRECT_SPACE_ID="209c0d6f-8d02-43ab-950e-76b06a93cd51"

echo "Error pattern:"
echo "- User ID: $USER_ID"
echo "- User's actual space: $CORRECT_SPACE_ID"
echo "- Error shows User ID used as Space ID"
echo ""

if [ -z "$TOKEN" ]; then
    echo "Please set TOKEN environment variable with your JWT token"
    exit 1
fi

BASE_URL="http://localhost:5000"

echo "1. Testing with USER_ID as space ID (should fail):"
curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/api/authtest/space/$USER_ID" | jq .

echo ""
echo "2. Testing with correct space ID (should succeed if user is member):"
curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/api/authtest/space/$CORRECT_SPACE_ID" | jq .

echo ""
echo "3. Getting user debug info to verify:"
curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/api/authtest/debug" | jq '.user.userId, .spaces'