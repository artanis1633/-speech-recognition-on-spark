# 前端配置说明

## WebSocket 连接配置

如果你看到 "WebSocket 连接失败" 错误，请按以下步骤检查：

### 1. 本地开发（前后端都在本机）

`.env.local` 配置：
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_WS_BASE_URL=ws://localhost:8000
```

### 2. 远程访问（前端在浏览器，后端在服务器）

假设服务器 IP 是 `192.168.1.100`：

`.env.local` 配置：
```bash
NEXT_PUBLIC_API_BASE_URL=http://192.168.1.100:8000
NEXT_PUBLIC_WS_BASE_URL=ws://192.168.1.100:8000
```

**重要：修改 .env.local 后需要重启 Next.js 开发服务器！**

```bash
# 停止当前服务器 (Ctrl+C)
# 重新启动
export PATH="/tmp/node-v20.18.1-linux-arm64/bin:$PATH" && npm run dev
```

### 3. 检查后端是否运行

```bash
# 检查后端健康状态
curl http://localhost:8000/health

# 应该返回: {"status":"ok"}
```

### 4. 检查防火墙

如果是远程访问，确保服务器防火墙允许 8000 端口：

```bash
# 查看防火墙状态
sudo ufw status

# 如果需要开放端口
sudo ufw allow 8000
```

### 5. 浏览器开发者工具

打开浏览器控制台 (F12) 查看详细错误信息：
- Console 标签：查看 WebSocket 连接日志
- Network 标签：查看 WS 连接状态

## 麦克风权限

首次使用需要授权麦克风：
- Chrome/Edge: 点击地址栏左侧的锁图标 → 允许麦克风
- Firefox: 点击地址栏左侧的麦克风图标 → 允许

## 故障排查流程

1. ✅ 确认后端运行: `curl http://localhost:8000/health`
2. ✅ 确认 .env.local 配置正确（IP地址匹配）
3. ✅ 重启 Next.js 开发服务器
4. ✅ 刷新浏览器页面
5. ✅ 查看浏览器控制台错误信息
6. ✅ 检查防火墙和网络连通性

## 当前运行状态

- 前端: http://localhost:3000
- 后端 API: http://localhost:8000
- 后端 WebSocket: ws://localhost:8000/ws/audio
