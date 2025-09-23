#!/bin/bash

# 测试 semantic-release 配置
echo "测试 semantic-release 配置..."

# 安装依赖
npm ci

# 运行 semantic-release 的 dry-run 模式
npx semantic-release --dry-run --no-ci

echo "测试完成！如果看到版本更新信息，说明配置正确。"