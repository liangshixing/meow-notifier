# 发布 meow-notifier 到 npm

## 发布前准备

1. **确保你有 npm 账户**
   ```bash
   npm login
   ```

2. **更新 package.json 中的仓库信息**
   - 将 `repository.url` 中的 `liangshixing` 替换为你的 GitHub 用户名
   - 更新 `bugs.url` 和 `homepage` 字段
   - 填写 `author` 字段

3. **版本管理**
   ```bash
   # 补丁版本 (1.0.0 -> 1.0.1)
   npm version patch
   
   # 小版本 (1.0.0 -> 1.1.0)
   npm version minor
   
   # 大版本 (1.0.0 -> 2.0.0)
   npm version major
   ```

## 发布步骤

1. **构建项目**
   ```bash
   npm run build
   ```

2. **测试包内容**
   ```bash
   npm pack
   # 检查生成的 .tgz 文件内容是否正确
   ```

3. **发布到 npm**
   ```bash
   npm publish
   ```

## 使用 npx 运行

发布后，用户可以通过以下方式使用：

```bash
# 直接运行（需要环境变量）
MEOW_NICKNAMES="nickname1,nickname2" npx meow-notifier

# 或者作为 MCP 服务器使用
npx meow-notifier
```

## 环境变量配置

用户需要设置 `MEOW_NICKNAMES` 环境变量：

```bash
# 单个 nickname
export MEOW_NICKNAMES="your-nickname"

# 多个 nicknames（逗号分隔）
export MEOW_NICKNAMES="nickname1,nickname2,nickname3"

# 或者 JSON 数组格式
export MEOW_NICKNAMES='["nickname1","nickname2","nickname3"]'
```

## 验证发布

发布成功后，可以通过以下方式验证：

```bash
# 查看包信息
npm info meow-notifier

# 测试安装
npm install -g meow-notifier

# 测试运行
MEOW_NICKNAMES="test" meow-notifier
```

## 注意事项

- 确保在发布前运行 `npm run build` 构建最新版本
- 每次发布前都要更新版本号
- 发布的包只包含 `build/`、`README.md` 和 `package.json` 文件
- 源代码和开发文件不会被包含在发布的包中