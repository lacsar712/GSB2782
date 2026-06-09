#!/bin/bash

# 停车场管理系统API测试脚本

BASE_URL="http://localhost:3000"
TOKEN=""

echo "=========================================="
echo "停车场管理系统 API 测试"
echo "=========================================="
echo ""

# 颜色输出
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试函数
test_api() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    local auth=$5

    echo -e "${YELLOW}测试: ${name}${NC}"

    if [ "$auth" = "true" ]; then
        if [ -z "$TOKEN" ]; then
            echo -e "${RED}✗ 需要先登录获取token${NC}"
            return
        fi
        if [ -n "$data" ]; then
            response=$(curl -s -X $method "${BASE_URL}${endpoint}" \
                -H "Content-Type: application/json" \
                -H "Authorization: Bearer $TOKEN" \
                -d "$data")
        else
            response=$(curl -s -X $method "${BASE_URL}${endpoint}" \
                -H "Authorization: Bearer $TOKEN")
        fi
    else
        if [ -n "$data" ]; then
            response=$(curl -s -X $method "${BASE_URL}${endpoint}" \
                -H "Content-Type: application/json" \
                -d "$data")
        else
            response=$(curl -s -X $method "${BASE_URL}${endpoint}")
        fi
    fi

    code=$(echo $response | jq -r '.code' 2>/dev/null)

    if [ "$code" = "0" ]; then
        echo -e "${GREEN}✓ 成功${NC}"
        echo "$response" | jq '.' 2>/dev/null || echo "$response"
    else
        echo -e "${RED}✗ 失败${NC}"
        echo "$response" | jq '.' 2>/dev/null || echo "$response"
    fi
    echo ""
}

# 1. 测试健康检查
echo "1. 健康检查"
curl -s "${BASE_URL}/health" | jq '.'
echo ""

# 2. 测试登录
echo "2. 用户登录"
login_response=$(curl -s -X POST "${BASE_URL}/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"admin123"}')

echo "$login_response" | jq '.'

TOKEN=$(echo $login_response | jq -r '.data.token' 2>/dev/null)

if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
    echo -e "${GREEN}✓ 登录成功，已获取token${NC}"
else
    echo -e "${RED}✗ 登录失败，无法继续测试${NC}"
    exit 1
fi
echo ""

# 3. 测试获取当前用户信息
test_api "获取当前用户信息" "GET" "/api/auth/me" "" "true"

# 4. 测试Dashboard汇总数据
test_api "Dashboard汇总数据" "GET" "/api/dashboard/summary" "" "true"

# 5. 测试Dashboard图表数据
test_api "Dashboard图表数据(7天)" "GET" "/api/dashboard/charts?range=7" "" "true"

# 6. 测试获取系统设置
test_api "获取系统设置" "GET" "/api/settings" "" "true"

# 7. 测试获取收费规则
test_api "获取收费规则" "GET" "/api/fee-rule" "" "true"

# 8. 测试获取进出场记录
test_api "获取进出场记录" "GET" "/api/parking-records?page=1&pageSize=10" "" "true"

# 9. 测试生成模拟数据
test_api "生成模拟数据" "POST" "/api/parking-records/mock-generate" '{"count":10}' "true"

# 10. 测试获取会员车辆列表
test_api "获取会员车辆列表" "GET" "/api/member-vehicles?page=1&pageSize=10" "" "true"

# 11. 测试创建会员车辆
test_api "创建会员车辆" "POST" "/api/member-vehicles" \
    '{"plate_no":"京A12345","member_type":"month","expire_at":"2026-12-31 23:59:59","status":"enabled","remark":"测试会员"}' \
    "true"

# 12. 测试获取用户列表
test_api "获取用户列表" "GET" "/api/users?page=1&pageSize=10" "" "true"

# 13. 测试获取登录日志
test_api "获取登录日志" "GET" "/api/logs/login?page=1&pageSize=20" "" "true"

# 14. 测试获取操作日志
test_api "获取操作日志" "GET" "/api/logs/ops?page=1&pageSize=20" "" "true"

echo "=========================================="
echo "测试完成！"
echo "=========================================="
