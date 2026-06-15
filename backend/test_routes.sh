#!/bin/bash

BASE_URL="${BASE_URL:-http://localhost:8080}"

PASS=0
FAIL=0
SKIP=0

ACCESS_TOKEN=""
REFRESH_TOKEN=""
USER_ID=""
USER2_ID=""
CHAT_ID=""
MESSAGE_ID=""
SETTINGS_ID=""

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

test_route() {
  local LABEL="$1"
  local EXPECTED="$2"

  shift 2

  local RESPONSE
  RESPONSE=$(curl -s -o /tmp/signetix_body.json -w "%{http_code}" "$@")
  local BODY
  BODY=$(cat /tmp/signetix_body.json)

  if [ "$RESPONSE" = "$EXPECTED" ]; then
    echo -e "${GREEN}[PASS]${NC} $LABEL  (HTTP $RESPONSE)"
    PASS=$((PASS + 1))
  else
    echo -e "${RED}[FAIL]${NC} $LABEL  (expected $EXPECTED, got $RESPONSE)"
    echo -e "       Body: $BODY"
    FAIL=$((FAIL + 1))
  fi
}

skip_test() {
  echo -e "${YELLOW}[SKIP]${NC} $1"
  SKIP=$((SKIP + 1))
}

json_field() {
  echo "$1" | grep -o "\"$2\":\"[^\"]*\"" | head -1 | sed 's/.*":"\(.*\)"/\1/'
}

json_field_unquoted() {
  echo "$1" | grep -o "\"$2\":\"[^\"]*\"\|\"$2\":[^,}]*" | head -1 | sed 's/.*":\s*\"\?\([^",}]*\)\"\?/\1/'
}

echo ""
echo -e "${CYAN}======================================================${NC}"
echo -e "${CYAN}  Signetix Backend Route Tests                        ${NC}"
echo -e "${CYAN}  Target: $BASE_URL                                   ${NC}"
echo -e "${CYAN}======================================================${NC}"
echo ""

echo -e "${CYAN}--- [1] Root / Health Check ---${NC}"

test_route "GET / (home)" 200 \
  -X GET "$BASE_URL/"

echo ""
echo -e "${CYAN}--- [2] Auth: Create Users ---${NC}"

PHONE1="+10000000001"
PHONE2="+10000000002"

RESP1=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/auth/users/create" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test User One\",\"phoneNumber\":\"$PHONE1\",\"password\":\"TestPass123\"}")

HTTP1=$(echo "$RESP1" | tail -1)
BODY1=$(echo "$RESP1" | head -n -1)

if [ "$HTTP1" = "200" ]; then
  ACCESS_TOKEN=$(json_field "$BODY1" "accessToken")
  REFRESH_TOKEN=$(json_field "$BODY1" "refreshToken")
  USER_ID=$(json_field "$BODY1" "_id")

  REFRESH_TOKEN=$(echo "$BODY1" | grep -o '"refreshToken":"[^"]*"' | head -1 | sed 's/.*":"\(.*\)"/\1/')
  echo -e "${GREEN}[PASS]${NC} POST /auth/users/create (User 1)  (HTTP $HTTP1)"
  echo "       USER_ID    = $USER_ID"
  echo "       AccessToken= ${ACCESS_TOKEN:0:40}..."
  PASS=$((PASS + 1))
else
  echo -e "${YELLOW}[WARN]${NC} POST /auth/users/create (User 1) returned $HTTP1 — user may already exist, attempting login..."
  FAIL=$((FAIL + 1))
fi


RESP2=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/auth/users/create" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test User Two\",\"phoneNumber\":\"$PHONE2\",\"password\":\"TestPass123\"}")

HTTP2=$(echo "$RESP2" | tail -1)
BODY2=$(echo "$RESP2" | head -n -1)

if [ "$HTTP2" = "200" ]; then
  USER2_ID=$(json_field "$BODY2" "_id")
  echo -e "${GREEN}[PASS]${NC} POST /auth/users/create (User 2)  (HTTP $HTTP2)"
  echo "       USER2_ID = $USER2_ID"
  PASS=$((PASS + 1))
else
  echo -e "${YELLOW}[WARN]${NC} POST /auth/users/create (User 2) returned $HTTP2 — user may already exist"
  FAIL=$((FAIL + 1))
fi

echo ""
echo -e "${CYAN}--- [3] Auth: Login ---${NC}"

RESP_LOGIN=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/auth/users/login" \
  -H "Content-Type: application/json" \
  -d "{\"phoneNumber\":\"$PHONE1\",\"password\":\"TestPass123\"}")

HTTP_LOGIN=$(echo "$RESP_LOGIN" | tail -1)
BODY_LOGIN=$(echo "$RESP_LOGIN" | head -n -1)

if [ "$HTTP_LOGIN" = "200" ]; then
  ACCESS_TOKEN=$(json_field "$BODY_LOGIN" "accessToken")

  REFRESH_TOKEN=$(echo "$BODY_LOGIN" | grep -o '"refreshToken":"[^"]*"' | head -1 | sed 's/.*":"\(.*\)"/\1/')
  USER_ID=$(json_field "$BODY_LOGIN" "_id")
  echo -e "${GREEN}[PASS]${NC} POST /auth/users/login  (HTTP $HTTP_LOGIN)"
  echo "       USER_ID     = $USER_ID"
  echo "       AccessToken = ${ACCESS_TOKEN:0:40}..."
  PASS=$((PASS + 1))
else
  echo -e "${RED}[FAIL]${NC} POST /auth/users/login  (expected 200, got $HTTP_LOGIN)"
  echo "       Body: $BODY_LOGIN"
  FAIL=$((FAIL + 1))
fi

if [ -z "$ACCESS_TOKEN" ]; then
  echo -e "${RED}[ERROR]${NC} No access token available. Skipping all authenticated tests."
  echo ""
  echo "======================================================="
  echo "  Results: PASS=$PASS  FAIL=$FAIL  SKIP=$SKIP"
  echo "======================================================="
  exit 1
fi

AUTH_HEADER="Authorization: Bearer $ACCESS_TOKEN"

echo ""
echo -e "${CYAN}--- [4] JWT ---${NC}"

test_route "POST /jwt/refresh (missing body → 400)" 400 \
  -X POST "$BASE_URL/jwt/refresh" \
  -H "Content-Type: application/json" \
  -d "{}"

if [ -n "$REFRESH_TOKEN" ]; then
  RESP_JWT=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/jwt/refresh" \
    -H "Content-Type: application/json" \
    -d "{\"phoneNumber\":\"$PHONE1\",\"refreshToken\":\"$REFRESH_TOKEN\"}")
  HTTP_JWT=$(echo "$RESP_JWT" | tail -1)
  BODY_JWT=$(echo "$RESP_JWT" | head -n -1)
  if [ "$HTTP_JWT" = "200" ]; then

    NEW_ACCESS=$(json_field "$BODY_JWT" "accessToken")
    if [ -n "$NEW_ACCESS" ]; then
      ACCESS_TOKEN="$NEW_ACCESS"
      AUTH_HEADER="Authorization: Bearer $ACCESS_TOKEN"
    fi
    echo -e "${GREEN}[PASS]${NC} POST /jwt/refresh (valid token)  (HTTP $HTTP_JWT)"
    PASS=$((PASS + 1))
  else
    echo -e "${RED}[FAIL]${NC} POST /jwt/refresh (valid token)  (expected 200, got $HTTP_JWT)"
    echo "       Body: $BODY_JWT"
    FAIL=$((FAIL + 1))
  fi
else
  skip_test "POST /jwt/refresh (valid token) — no refresh token captured"
fi

echo ""
echo -e "${CYAN}--- [5] Users ---${NC}"

test_route "GET /users/all" 200 \
  -X GET "$BASE_URL/users/all" \
  -H "$AUTH_HEADER"

if [ -n "$USER_ID" ]; then
  test_route "GET /users/:id" 200 \
    -X GET "$BASE_URL/users/$USER_ID" \
    -H "$AUTH_HEADER"
else
  skip_test "GET /users/:id — no USER_ID"
fi

test_route "GET /users/phone/:phoneNumber" 200 \
  -X GET "$BASE_URL/users/phone/$PHONE1" \
  -H "$AUTH_HEADER"

test_route "PUT /users/update" 200 \
  -X PUT "$BASE_URL/users/update" \
  -H "Content-Type: application/json" \
  -d "{\"phoneNumber\":\"$PHONE1\",\"name\":\"Updated User One\"}"

test_route "GET /users/phone/:phoneNumber (missing user → 400)" 400 \
  -X GET "$BASE_URL/users/phone/+19999999999" \
  -H "$AUTH_HEADER"

echo ""
echo -e "${CYAN}--- [6] User Authentication ---${NC}"

test_route "GET /userAuthentication/:phoneNumber" 200 \
  -X GET "$BASE_URL/userAuthentication/$PHONE1" \
  -H "$AUTH_HEADER"

test_route "PUT /userAuthentication/update (bypass OTP → set isVerified=true)" 200 \
  -X PUT "$BASE_URL/userAuthentication/update" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER" \
  -d "{\"phoneNumber\":\"$PHONE1\",\"isVerified\":true}"

echo ""
echo -e "${CYAN}--- [7] Contacts ---${NC}"

test_route "GET /contacts/all" 200 \
  -X GET "$BASE_URL/contacts/all" \
  -H "$AUTH_HEADER"

test_route "GET /contacts/:phoneNumber" 200 \
  -X GET "$BASE_URL/contacts/$PHONE1" \
  -H "$AUTH_HEADER"

test_route "POST /contacts/create" 200 \
  -X POST "$BASE_URL/contacts/create" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER" \
  -d "{\"userPhoneNumber\":\"$PHONE1\",\"contacts\":[\"$PHONE2\"]}"

echo ""
echo -e "${CYAN}--- [8] Chats ---${NC}"

RESP_CHAT=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/chats/create" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER" \
  -d "{\"mainUserPhoneNumber\":\"$PHONE1\",\"participants\":[\"$PHONE2\"]}")

HTTP_CHAT=$(echo "$RESP_CHAT" | tail -1)
BODY_CHAT=$(echo "$RESP_CHAT" | head -n -1)

if [ "$HTTP_CHAT" = "200" ]; then
  CHAT_ID=$(echo "$BODY_CHAT" | grep -o '"_id":"[^"]*"' | head -1 | sed 's/.*":"\(.*\)"/\1/')
  echo -e "${GREEN}[PASS]${NC} POST /chats/create  (HTTP $HTTP_CHAT)"
  echo "       CHAT_ID = $CHAT_ID"
  PASS=$((PASS + 1))
elif [ "$HTTP_CHAT" = "400" ]; then
  CHAT_ID=$(echo "$BODY_CHAT" | grep -o 'chatId: [a-f0-9]*' | sed 's/chatId: //')
  if [ -z "$CHAT_ID" ]; then
    CHAT_ID=$(echo "$BODY_CHAT" | grep -o '"_id":"[^"]*"' | head -1 | sed 's/.*":"\(.*\)"/\1/')
  fi
  echo -e "${YELLOW}[WARN]${NC} POST /chats/create returned 400 (chat already exists) — CHAT_ID=$CHAT_ID"
  FAIL=$((FAIL + 1))
else
  echo -e "${RED}[FAIL]${NC} POST /chats/create  (expected 200, got $HTTP_CHAT)"
  echo "       Body: $BODY_CHAT"
  FAIL=$((FAIL + 1))
fi

test_route "GET /chats/:phoneNumber" 200 \
  -X GET "$BASE_URL/chats/$PHONE1" \
  -H "$AUTH_HEADER"

if [ -n "$CHAT_ID" ]; then
  test_route "GET /chats/custom/id/:chatId" 200 \
    -X GET "$BASE_URL/chats/custom/id/$CHAT_ID" \
    -H "$AUTH_HEADER"
else
  skip_test "GET /chats/custom/id/:chatId — no CHAT_ID"
fi

if [ -n "$CHAT_ID" ]; then
  test_route "POST /chats/pin" 200 \
    -X POST "$BASE_URL/chats/pin" \
    -H "Content-Type: application/json" \
    -H "$AUTH_HEADER" \
    -d "{\"userPhoneNumber\":\"$PHONE1\",\"chatId\":\"$CHAT_ID\",\"isPinned\":true}"
else
  skip_test "POST /chats/pin — no CHAT_ID"
fi

if [ -n "$CHAT_ID" ]; then
  test_route "POST /chats/archive" 200 \
    -X POST "$BASE_URL/chats/archive" \
    -H "Content-Type: application/json" \
    -H "$AUTH_HEADER" \
    -d "{\"userPhoneNumber\":\"$PHONE1\",\"chatId\":\"$CHAT_ID\",\"isArchived\":true}"
else
  skip_test "POST /chats/archive — no CHAT_ID"
fi

echo ""
echo -e "${CYAN}--- [9] Messages ---${NC}"

RESP_MSG=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/messages/create" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER" \
  -d "{\"mainUserPhoneNumber\":\"$PHONE1\",\"targetUserPhoneNumbers\":[\"$PHONE2\"],\"message\":\"Hello from test script!\"}")

HTTP_MSG=$(echo "$RESP_MSG" | tail -1)
BODY_MSG=$(echo "$RESP_MSG" | head -n -1)

if [ "$HTTP_MSG" = "200" ]; then
  MESSAGE_ID=$(echo "$BODY_MSG" | grep -o '"_id":"[^"]*"' | head -1 | sed 's/.*":"\(.*\)"/\1/')

  if [ -z "$CHAT_ID" ]; then
    CHAT_ID=$(echo "$BODY_MSG" | grep -o '"chatId":"[^"]*"' | head -1 | sed 's/.*":"\(.*\)"/\1/')
  fi
  echo -e "${GREEN}[PASS]${NC} POST /messages/create  (HTTP $HTTP_MSG)"
  echo "       MESSAGE_ID = $MESSAGE_ID"
  PASS=$((PASS + 1))
else
  echo -e "${RED}[FAIL]${NC} POST /messages/create  (expected 200, got $HTTP_MSG)"
  echo "       Body: $BODY_MSG"
  FAIL=$((FAIL + 1))
fi

if [ -n "$MESSAGE_ID" ]; then
  test_route "PUT /messages/edit" 200 \
    -X PUT "$BASE_URL/messages/edit" \
    -H "Content-Type: application/json" \
    -H "$AUTH_HEADER" \
    -d "{\"senderPhoneNumber\":\"$PHONE1\",\"messageId\":\"$MESSAGE_ID\",\"newContent\":\"Edited content\"}"
else
  skip_test "PUT /messages/edit — no MESSAGE_ID"
fi

if [ -n "$MESSAGE_ID" ]; then
  test_route "POST /messages/pin" 200 \
    -X POST "$BASE_URL/messages/pin" \
    -H "Content-Type: application/json" \
    -H "$AUTH_HEADER" \
    -d "{\"userPhoneNumber\":\"$PHONE1\",\"messageId\":\"$MESSAGE_ID\",\"isPinned\":true}"
else
  skip_test "POST /messages/pin — no MESSAGE_ID"
fi

if [ -n "$MESSAGE_ID" ]; then
  test_route "POST /messages/read-status" 200 \
    -X POST "$BASE_URL/messages/read-status" \
    -H "Content-Type: application/json" \
    -H "$AUTH_HEADER" \
    -d "{\"userPhoneNumber\":\"$PHONE2\",\"messageId\":\"$MESSAGE_ID\",\"isRead\":true}"
else
  skip_test "POST /messages/read-status — no MESSAGE_ID"
fi

test_route "GET /messages/unread-count/:phone" 200 \
  -X GET "$BASE_URL/messages/unread-count/$PHONE1" \
  -H "$AUTH_HEADER"

if [ -n "$CHAT_ID" ]; then
  test_route "GET /messages/unread-count/:phone/:chatId" 200 \
    -X GET "$BASE_URL/messages/unread-count/$PHONE1/$CHAT_ID" \
    -H "$AUTH_HEADER"
else
  skip_test "GET /messages/unread-count/:phone/:chatId — no CHAT_ID"
fi

if [ -n "$MESSAGE_ID" ]; then
  test_route "GET /messages/replies/:messageId" 200 \
    -X GET "$BASE_URL/messages/replies/$MESSAGE_ID" \
    -H "$AUTH_HEADER"
else
  skip_test "GET /messages/replies/:messageId — no MESSAGE_ID"
fi

if [ -n "$MESSAGE_ID" ]; then
  test_route "POST /messages/forward" 200 \
    -X POST "$BASE_URL/messages/forward" \
    -H "Content-Type: application/json" \
    -H "$AUTH_HEADER" \
    -d "{\"senderPhoneNumber\":\"$PHONE1\",\"messageId\":\"$MESSAGE_ID\",\"targetUserPhoneNumbers\":[\"$PHONE2\"]}"
else
  skip_test "POST /messages/forward — no MESSAGE_ID"
fi

if [ -n "$MESSAGE_ID" ]; then
  test_route "DELETE /messages/delete" 200 \
    -X DELETE "$BASE_URL/messages/delete" \
    -H "Content-Type: application/json" \
    -H "$AUTH_HEADER" \
    -d "{\"senderPhoneNumber\":\"$PHONE1\",\"messageId\":\"$MESSAGE_ID\"}"
else
  skip_test "DELETE /messages/delete — no MESSAGE_ID"
fi

echo ""
echo -e "${CYAN}--- [10] Call History ---${NC}"

test_route "GET /callHistory/:phoneNumber" 200 \
  -X GET "$BASE_URL/callHistory/$PHONE1" \
  -H "$AUTH_HEADER"

test_route "GET /callHistory/ (missing phone → 400)" 400 \
  -X GET "$BASE_URL/callHistory/" \
  -H "$AUTH_HEADER"

test_route "DELETE /callHistory/delete (empty array → 400)" 400 \
  -X DELETE "$BASE_URL/callHistory/delete" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER" \
  -d "{\"phoneNumber\":\"$PHONE1\",\"callHistoryLogIds\":[]}"

echo ""
echo -e "${CYAN}--- [11] Settings ---${NC}"

test_route "GET /settings/:phoneNumber" 200 \
  -X GET "$BASE_URL/settings/$PHONE1" \
  -H "$AUTH_HEADER"

RESP_SETTINGS=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/settings/default/create" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER" \
  -d "{\"userId\":\"$USER_ID\"}")

HTTP_SETTINGS=$(echo "$RESP_SETTINGS" | tail -1)
BODY_SETTINGS=$(echo "$RESP_SETTINGS" | head -n -1)

if [ "$HTTP_SETTINGS" = "200" ]; then
  SETTINGS_ID=$(echo "$BODY_SETTINGS" | grep -o '"_id":"[^"]*"' | head -1 | sed 's/.*":"\(.*\)"/\1/')
  echo -e "${GREEN}[PASS]${NC} POST /settings/default/create  (HTTP $HTTP_SETTINGS)"
  echo "       SETTINGS_ID = $SETTINGS_ID"
  PASS=$((PASS + 1))
else
  echo -e "${RED}[FAIL]${NC} POST /settings/default/create  (expected 200, got $HTTP_SETTINGS)"
  echo "       Body: $BODY_SETTINGS"
  FAIL=$((FAIL + 1))
fi

if [ -n "$SETTINGS_ID" ]; then
  test_route "GET /settings/id/:id" 200 \
    -X GET "$BASE_URL/settings/id/$SETTINGS_ID" \
    -H "$AUTH_HEADER"
else
  skip_test "GET /settings/id/:id — no SETTINGS_ID"
fi

test_route "PUT /settings/update" 200 \
  -X PUT "$BASE_URL/settings/update" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER" \
  -d "{\"phoneNumber\":\"$PHONE1\",\"theme\":\"DARK\",\"notificationEnabled\":true}"

echo ""
echo -e "${CYAN}--- [12] Chats: Delete (cleanup) ---${NC}"

if [ -n "$CHAT_ID" ]; then
  test_route "DELETE /chats/delete" 200 \
    -X DELETE "$BASE_URL/chats/delete" \
    -H "Content-Type: application/json" \
    -H "$AUTH_HEADER" \
    -d "{\"userPhoneNumber\":\"$PHONE1\",\"chatId\":\"$CHAT_ID\"}"
else
  skip_test "DELETE /chats/delete — no CHAT_ID"
fi

echo ""
echo -e "${CYAN}--- [13] Twilio OTP (SKIPPED — not configured) ---${NC}"

skip_test "GET /twilio/getOtp/:phoneNumber — Twilio not configured"
skip_test "POST /twilio/verifyOtp           — Twilio not configured"
echo ""
echo "  OTP BYPASS: isVerified was set to true via PUT /userAuthentication/update"
echo "  (already done in step 6 above)"

echo ""
echo -e "${CYAN}--- [14] Amazon S3 (SKIPPED — not configured) ---${NC}"

skip_test "POST /amazon/s3 — AWS S3 not configured"

echo ""
echo -e "${CYAN}--- [15] Media / Notifications / Reactions / Reports ---${NC}"

skip_test "GET /media/all    — route not mounted in server.js"
skip_test "GET /notifications/all — route not mounted in server.js"
skip_test "GET /reactions/all     — route not mounted in server.js"
skip_test "GET /reports/all       — route not mounted in server.js"

echo ""
echo -e "${CYAN}--- [16] Validation / Error Cases ---${NC}"

test_route "POST /auth/users/login (wrong password → 401)" 401 \
  -X POST "$BASE_URL/auth/users/login" \
  -H "Content-Type: application/json" \
  -d "{\"phoneNumber\":\"$PHONE1\",\"password\":\"WrongPassword\"}"

test_route "GET /users/all (no auth → 403)" 403 \
  -X GET "$BASE_URL/users/all"

test_route "GET /users/all (invalid token → 401)" 401 \
  -X GET "$BASE_URL/users/all" \
  -H "Authorization: Bearer invalidtoken"

test_route "POST /auth/users/create (missing name → 400)" 400 \
  -X POST "$BASE_URL/auth/users/create" \
  -H "Content-Type: application/json" \
  -d "{\"phoneNumber\":\"+10000000099\",\"password\":\"pass\"}"

test_route "POST /messages/create (missing message → 400)" 400 \
  -X POST "$BASE_URL/messages/create" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER" \
  -d "{\"mainUserPhoneNumber\":\"$PHONE1\",\"targetUserPhoneNumbers\":[\"$PHONE2\"]}"

echo ""
echo -e "${CYAN}======================================================${NC}"
echo -e "${CYAN}  Test Summary                                        ${NC}"
echo -e "${CYAN}======================================================${NC}"
echo -e "  ${GREEN}PASS${NC}: $PASS"
echo -e "  ${RED}FAIL${NC}: $FAIL"
echo -e "  ${YELLOW}SKIP${NC}: $SKIP"
echo -e "  TOTAL: $((PASS + FAIL + SKIP))"
echo ""

if [ "$FAIL" -eq 0 ]; then
  echo -e "${GREEN}All executed tests passed!${NC}"
else
  echo -e "${RED}Some tests failed. Review output above.${NC}"
fi
echo ""
