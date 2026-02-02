# 快速开始指南

5 分钟快速部署 openclaw-feishu 插件。

---

## VPS (Linux) 快速部署

### 1. 安装 Node.js

```bash
# 使用 nvm（推荐）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install --lts
nvm use --lts
```

### 2. 安装 OpenClaw 和插件

```bash
# 安装 OpenClaw
npm install -g openclaw

# 安装 feishu 插件
openclaw plugins install @m1heng-clawd/feishu
```

### 3. 配置

```bash
# 替换为你的实际值
openclaw config set channels.feishu.appId "cli_xxxxx"
openclaw config set channels.feishu.appSecret "your_app_secret"
openclaw config set channels.feishu.enabled true
```

### 4. 启动

```bash
# 后台运行
openclaw start --daemon

# 查看日志
openclaw logs
```

### 5. 生产环境（使用 PM2）

```bash
# 安装 PM2
npm install -g pm2

# 启动服务
pm2 start openclaw --name feishu-bot -- start

# 保存并设置开机自启
pm2 save
pm2 startup
```

---

## Mac 快速部署

### 1. 安装 Homebrew 和 Node.js

```bash
# 安装 Homebrew（如果还没有）
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 安装 Node.js
brew install node@20
```

### 2-4. 同 Linux 步骤 2-4

---

## Docker 快速部署

### 1. 创建 docker-compose.yml

```yaml
version: '3.8'
services:
  openclaw:
    image: node:20-alpine
    container_name: openclaw-feishu
    restart: unless-stopped
    environment:
      - OPENCLAW_FEISHU_APP_ID=cli_xxxxx
      - OPENCLAW_FEISHU_APP_SECRET=your_secret
    volumes:
      - ./data:/root/.openclaw
    command: >
      sh -c "npm install -g openclaw &&
             openclaw plugins install @m1heng-clawd/feishu &&
             openclaw config set channels.feishu.enabled true &&
             openclaw start"
```

### 2. 启动

```bash
docker-compose up -d
docker-compose logs -f
```

---

## 验证

### 1. 检查状态

```bash
openclaw status
```

### 2. 测试机器人

在飞书中：
1. 搜索你的机器人名称
2. 发送 "你好"
3. 应该收到回复

### 3. 测试新工具

```
# 测试 Bitable
列出我的多维表格

# 测试 Calendar
查看今天的日程
```

---

## 常见问题

### 收不到消息？

检查飞书开放平台：
1. 事件订阅 → 长连接模式
2. 添加 `im.message.receive_v1` 事件
3. 权限已审核通过

### 权限错误？

```bash
# 使用 nvm 或修改 npm 全局目录
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

---

## 完整文档

详细部署指南请参阅: [DEPLOYMENT.md](./DEPLOYMENT.md)

---

**就这么简单！** 🚀
