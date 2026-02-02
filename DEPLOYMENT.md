# 部署指南

本文档详细说明如何在 VPS（Linux）和 Mac 上部署 openclaw-feishu 插件。

---

## 目录

- [前置要求](#前置要求)
- [VPS (Linux) 部署](#vps-linux-部署)
- [Mac 部署](#mac-部署)
- [配置步骤](#配置步骤)
- [验证安装](#验证安装)
- [故障排除](#故障排除)

---

## 前置要求

### 1. 系统要求

| 平台 | 最低要求 |
|------|---------|
| **Linux (VPS)** | Ubuntu 20.04+, Debian 11+, CentOS 8+ |
| **Mac** | macOS 12.0+ (Monterey) |
| **内存** | 最低 2GB，推荐 4GB+ |
| **磁盘** | 最低 10GB 可用空间 |

### 2. 软件依赖

- **Node.js**: v18.0.0 或更高
- **npm**: v9.0.0 或更高
- **Git**: 任意版本

### 3. 飞书应用准备

在开始部署前，请先在[飞书开放平台](https://open.feishu.cn)完成：

1. ✅ 创建自建应用
2. ✅ 获取 App ID 和 App Secret
3. ✅ 申请必要权限（见 README.md）
4. ✅ 配置事件订阅（长连接模式）

---

## VPS (Linux) 部署

### 方式 1: 使用 npm 安装（推荐）

#### 步骤 1: 安装 Node.js

**Ubuntu/Debian**:
```bash
# 使用 NodeSource 仓库安装 Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证安装
node --version  # 应显示 v20.x.x
npm --version   # 应显示 10.x.x
```

**CentOS/RHEL**:
```bash
# 使用 NodeSource 仓库
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs

# 验证安装
node --version
npm --version
```

**使用 nvm（推荐，适用于所有 Linux 发行版）**:
```bash
# 安装 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# 重新加载 shell 配置
source ~/.bashrc  # 或 source ~/.zshrc

# 安装 Node.js LTS
nvm install --lts
nvm use --lts

# 验证
node --version
npm --version
```

#### 步骤 2: 安装 OpenClaw

```bash
# 全局安装 OpenClaw
npm install -g openclaw

# 验证安装
openclaw --version
```

#### 步骤 3: 安装 feishu 插件

```bash
# 方式 1: 从 npm 安装（如果已发布）
openclaw plugins install @m1heng-clawd/feishu

# 方式 2: 从本地目录安装（开发版本）
# 先上传代码到 VPS，然后：
cd /path/to/openclaw-feishu
npm install
openclaw plugins install .

# 方式 3: 从 Git 安装
openclaw plugins install https://github.com/your-username/openclaw-feishu.git
```

#### 步骤 4: 配置插件

```bash
# 配置飞书应用凭证
openclaw config set channels.feishu.appId "cli_xxxxx"
openclaw config set channels.feishu.appSecret "your_app_secret"
openclaw config set channels.feishu.enabled true

# 可选：配置其他选项
openclaw config set channels.feishu.domain "feishu"  # 或 "lark"
openclaw config set channels.feishu.renderMode "auto"
```

#### 步骤 5: 启动服务

```bash
# 前台运行（测试用）
openclaw start

# 或者后台运行（推荐）
openclaw start --daemon

# 查看日志
openclaw logs

# 查看状态
openclaw status
```

---

### 方式 2: 使用 Docker 部署（推荐生产环境）

#### 步骤 1: 安装 Docker

**Ubuntu/Debian**:
```bash
# 安装 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 启动 Docker
sudo systemctl start docker
sudo systemctl enable docker

# 验证
docker --version
```

#### 步骤 2: 创建 Dockerfile

在项目根目录创建 `Dockerfile`:

```dockerfile
FROM node:20-alpine

# 安装 OpenClaw
RUN npm install -g openclaw

# 设置工作目录
WORKDIR /app

# 复制插件代码
COPY . .
RUN npm install

# 安装插件
RUN openclaw plugins install .

# 暴露端口（如果需要 webhook）
EXPOSE 3000

# 启动命令
CMD ["openclaw", "start"]
```

#### 步骤 3: 创建 docker-compose.yml

```yaml
version: '3.8'

services:
  openclaw-feishu:
    build: .
    container_name: openclaw-feishu
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - OPENCLAW_FEISHU_APP_ID=cli_xxxxx
      - OPENCLAW_FEISHU_APP_SECRET=your_secret
    volumes:
      - ./data:/root/.openclaw
    ports:
      - "3000:3000"
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

#### 步骤 4: 启动容器

```bash
# 构建并启动
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止
docker-compose down
```

---

### 方式 3: 使用 PM2 管理进程（推荐生产环境）

#### 步骤 1: 安装 PM2

```bash
npm install -g pm2
```

#### 步骤 2: 创建启动脚本

创建 `start.sh`:

```bash
#!/bin/bash
export OPENCLAW_FEISHU_APP_ID="cli_xxxxx"
export OPENCLAW_FEISHU_APP_SECRET="your_secret"
openclaw start
```

```bash
chmod +x start.sh
```

#### 步骤 3: 使用 PM2 启动

```bash
# 启动
pm2 start start.sh --name openclaw-feishu

# 保存进程列表
pm2 save

# 设置开机自启
pm2 startup
# 按照输出的命令执行

# 查看状态
pm2 status

# 查看日志
pm2 logs openclaw-feishu

# 重启
pm2 restart openclaw-feishu

# 停止
pm2 stop openclaw-feishu
```

---

## Mac 部署

### 方式 1: 使用 Homebrew（推荐）

#### 步骤 1: 安装 Homebrew

```bash
# 如果还没有安装 Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

#### 步骤 2: 安装 Node.js

```bash
# 安装 Node.js
brew install node@20

# 验证
node --version
npm --version
```

#### 步骤 3: 安装 OpenClaw

```bash
# 全局安装
npm install -g openclaw

# 验证
openclaw --version
```

#### 步骤 4: 安装 feishu 插件

```bash
# 从 npm 安装
openclaw plugins install @m1heng-clawd/feishu

# 或从本地安装（开发版本）
cd /path/to/openclaw-feishu
npm install
openclaw plugins install .
```

#### 步骤 5: 配置并启动

```bash
# 配置
openclaw config set channels.feishu.appId "cli_xxxxx"
openclaw config set channels.feishu.appSecret "your_app_secret"
openclaw config set channels.feishu.enabled true

# 启动
openclaw start

# 或后台运行
openclaw start --daemon
```

---

### 方式 2: 使用 nvm（推荐开发环境）

#### 步骤 1: 安装 nvm

```bash
# 安装 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# 重新加载配置
source ~/.zshrc  # 或 source ~/.bash_profile
```

#### 步骤 2: 安装 Node.js

```bash
# 安装 LTS 版本
nvm install --lts
nvm use --lts

# 验证
node --version
npm --version
```

#### 步骤 3: 后续步骤同方式 1

---

## 配置步骤

### 1. 基础配置

```bash
# 查看当前配置
openclaw config list

# 设置飞书凭证
openclaw config set channels.feishu.appId "cli_xxxxx"
openclaw config set channels.feishu.appSecret "your_secret"
openclaw config set channels.feishu.enabled true
```

### 2. 可选配置

```bash
# 域名设置（国内用 feishu，国际用 lark）
openclaw config set channels.feishu.domain "feishu"

# 连接模式（websocket 或 webhook）
openclaw config set channels.feishu.connectionMode "websocket"

# 渲染模式（auto, raw, card）
openclaw config set channels.feishu.renderMode "auto"

# 私聊策略
openclaw config set channels.feishu.dmPolicy "pairing"

# 群聊策略
openclaw config set channels.feishu.groupPolicy "allowlist"

# 工具配置（可选，默认全部启用）
openclaw config set channels.feishu.tools.bitable true
openclaw config set channels.feishu.tools.calendar true
openclaw config set channels.feishu.tools.minutes false  # Minutes 有限制，可禁用
```

### 3. 配置文件位置

配置文件默认保存在：
- **Linux/Mac**: `~/.openclaw/config.yaml`
- **Docker**: `/root/.openclaw/config.yaml`

可以直接编辑此文件：

```yaml
channels:
  feishu:
    enabled: true
    appId: "cli_xxxxx"
    appSecret: "your_secret"
    domain: "feishu"
    connectionMode: "websocket"
    renderMode: "auto"
    dmPolicy: "pairing"
    groupPolicy: "allowlist"
    requireMention: true
    tools:
      doc: true
      wiki: true
      drive: true
      bitable: true
      calendar: true
      minutes: false
```

---

## 验证安装

### 1. 检查插件状态

```bash
# 列出已安装插件
openclaw plugins list

# 应该看到 feishu 插件
```

### 2. 检查服务状态

```bash
# 查看运行状态
openclaw status

# 查看日志
openclaw logs

# 应该看到 "Connected to Feishu" 或类似消息
```

### 3. 测试飞书连接

在飞书中：
1. 搜索你的机器人
2. 发送测试消息（如 "你好"）
3. 检查机器人是否回复

### 4. 测试工具功能

在飞书中测试新工具：

**测试 Bitable**:
```
帮我列出多维表格 [你的 app_id]
```

**测试 Calendar**:
```
查看今天的日程
```

---

## 故障排除

### 问题 1: 机器人收不到消息

**症状**: 发送消息后没有回复

**解决方案**:
```bash
# 1. 检查服务是否运行
openclaw status

# 2. 检查日志
openclaw logs | grep -i error

# 3. 检查飞书配置
# - 事件订阅是否配置（长连接模式）
# - im.message.receive_v1 事件是否添加
# - 权限是否审核通过

# 4. 重启服务
openclaw restart
```

### 问题 2: Node.js 版本过低

**症状**: `Error: Unsupported Node.js version`

**解决方案**:
```bash
# 升级 Node.js 到 v18+
nvm install --lts
nvm use --lts

# 或使用 n
npm install -g n
sudo n lts
```

### 问题 3: 权限错误

**症状**: `EACCES: permission denied`

**解决方案**:
```bash
# 方式 1: 使用 sudo（不推荐）
sudo npm install -g openclaw

# 方式 2: 修改 npm 全局目录权限（推荐）
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# 然后重新安装
npm install -g openclaw
```

### 问题 4: 端口冲突

**症状**: `Error: listen EADDRINUSE: address already in use`

**解决方案**:
```bash
# 查找占用端口的进程
lsof -i :3000  # 或你使用的端口

# 杀死进程
kill -9 [PID]

# 或更改 OpenClaw 端口
openclaw config set port 3001
```

### 问题 5: Docker 容器启动失败

**症状**: `Error: Cannot find module 'openclaw'`

**解决方案**:
```bash
# 1. 检查 Dockerfile
# 确保 npm install -g openclaw 在 COPY 之前

# 2. 重新构建镜像
docker-compose build --no-cache

# 3. 查看容器日志
docker-compose logs -f
```

### 问题 6: Bitable 工具 403 错误

**症状**: 使用 Bitable 工具时返回 403

**解决方案**:
1. 检查是否使用 **Base 表格**（不是 Wiki 表格）
2. 确认权限 `bitable:app:readonly` 已申请并通过
3. 检查表格是否分享给机器人

### 问题 7: Calendar 工具权限错误

**症状**: Calendar 工具返回权限错误

**解决方案**:
```bash
# 1. 检查权限
# calendar:calendar:readonly 或 calendar:calendar

# 2. 查看日志中的具体错误码
openclaw logs | grep -i calendar

# 3. 参考 Calendar 测试指南
cat CALENDAR-TEST-GUIDE.md  # 如果有
```

---

## 生产环境建议

### 1. 使用进程管理器

**推荐**: PM2 或 systemd

**PM2 示例**:
```bash
pm2 start openclaw --name feishu-bot
pm2 save
pm2 startup
```

**systemd 示例** (`/etc/systemd/system/openclaw-feishu.service`):
```ini
[Unit]
Description=OpenClaw Feishu Bot
After=network.target

[Service]
Type=simple
User=your-user
Environment="PATH=/usr/local/bin:/usr/bin:/bin"
Environment="OPENCLAW_FEISHU_APP_ID=cli_xxxxx"
Environment="OPENCLAW_FEISHU_APP_SECRET=your_secret"
ExecStart=/usr/local/bin/openclaw start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable openclaw-feishu
sudo systemctl start openclaw-feishu
```

### 2. 配置日志轮转

创建 `/etc/logrotate.d/openclaw`:
```
/var/log/openclaw/*.log {
    daily
    rotate 7
    compress
    delaycompress
    notifempty
    create 0640 your-user your-group
    sharedscripts
    postrotate
        systemctl reload openclaw-feishu > /dev/null 2>&1 || true
    endscript
}
```

### 3. 监控和告警

**使用 PM2 监控**:
```bash
pm2 monitor
```

**使用 Prometheus + Grafana** (需要额外配置)

### 4. 备份配置

```bash
# 定期备份配置文件
cp ~/.openclaw/config.yaml ~/.openclaw/config.yaml.backup

# 或使用 cron
crontab -e
# 添加: 0 2 * * * cp ~/.openclaw/config.yaml ~/.openclaw/config.yaml.backup
```

### 5. 安全建议

```bash
# 1. 不要在日志中暴露 appSecret
# 2. 使用环境变量存储敏感信息
# 3. 限制配置文件权限
chmod 600 ~/.openclaw/config.yaml

# 4. 定期更新依赖
npm update -g openclaw
openclaw plugins update feishu

# 5. 启用防火墙（如果使用 webhook）
sudo ufw allow 3000/tcp
```

---

## 快速参考命令

### OpenClaw 常用命令

```bash
openclaw --help              # 查看帮助
openclaw start               # 启动服务
openclaw start --daemon      # 后台启动
openclaw stop                # 停止服务
openclaw restart             # 重启服务
openclaw status              # 查看状态
openclaw logs                # 查看日志
openclaw logs -f             # 实时日志
openclaw config list         # 列出配置
openclaw plugins list        # 列出插件
openclaw plugins update      # 更新插件
```

### 插件管理

```bash
openclaw plugins install <package>   # 安装插件
openclaw plugins update <name>       # 更新插件
openclaw plugins uninstall <name>    # 卸载插件
openclaw plugins list                # 列出已安装插件
```

---

## 额外资源

- [OpenClaw 官方文档](https://github.com/openclaw/openclaw)
- [飞书开放平台](https://open.feishu.cn)
- [项目 README](./README.md)
- [CHANGELOG](./CHANGELOG.md)
- [故障排除指南](./TROUBLESHOOTING.md)

---

## 联系支持

如遇到部署问题：
1. 查看项目 Issues: [GitHub Issues](#)
2. 查看日志: `openclaw logs`
3. 提交新 Issue 并附上日志

---

**版本**: v1.0.0
**更新时间**: 2026-02-02
