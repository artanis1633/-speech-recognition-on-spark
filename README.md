# -speech-recognition-on-spark
# 离线会议同传终端 · 前端

> 面向 **NVIDIA DGX Spark** 单机部署的离线会议翻译与纪要系统的 Web 前端。
> 本仓库只包含前端页面、类型契约、Mock 数据与对接骨架。
> 本文档的目标读者是 **后端开发者**，用于了解前端结构、所需接口和实时协议，从而完成联调。

完整的设计文档见 [`docs/frontend-design-and-integration.md`](docs/frontend-design-and-integration.md)。

---

## 1. 项目简介

- 单机部署，强调"音频、文本、译文不出本地私有网络"。
- 5 个页面: 设备首页、同传主控大屏、PC 字幕、术语库管理、会议结束 / 导出。
- 当前阶段: **前端页面已完成视觉与结构**，使用 `lib/mock-data.ts` 提供静态数据；REST 与 WebSocket 客户端为骨架，等待后端实现后逐步替换。

## 2. 技术栈

| 模块 | 选型 |
| --- | --- |
| 框架 | Next.js 14 App Router (`14.2.23`) |
| UI 运行时 | React 18 (`18.3.1`) |
| 语言 | TypeScript 5 (`strict: true`) |
| 样式 | 全局 CSS 变量 + 单文件设计系统 (`app/globals.css`) |
| 图标 | `lucide-react` |
| 二维码 | `qrcode.react` |
| 包管理 | npm + lockfile |

后端期望: **FastAPI + WebSocket** (或任何兼容 HTTP/JSON + WebSocket 文本/二进制的实现)。

## 3. 快速启动

```bash
npm install
npm run dev          # http://localhost:3000
```

其他脚本:

```bash
npm run build        # 生产构建
npm run start        # 跑生产构建 (需先 build)
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
```

### 环境变量

在项目根创建 `.env.local`:

```bash
NEXT_PUBLIC_API_BASE_URL=http://<后端地址>:8000
NEXT_PUBLIC_WS_BASE_URL=ws://<后端地址>:8000
```

- `NEXT_PUBLIC_API_BASE_URL` 被 [`lib/api/client.ts`](lib/api/client.ts) 使用，未设置时退回相对路径。
- `NEXT_PUBLIC_WS_BASE_URL` 被 [`lib/websocket/realtime.ts`](lib/websocket/realtime.ts) 使用，未设置时退回 `ws://localhost:8000`。

## 4. 路由总览

| 路由 | 页面 | 主要使用者 | 数据来源 |
| --- | --- | --- | --- |
| `/` | 设备首页 / 入口 | 主持人、现场操作 | `GET /api/device/status` |
| `/meeting/live` | 同传主控 + 大屏 | 主持人 | WebSocket + `POST /api/meetings`、`POST /api/meetings/{id}/end` |
| `/caption` | PC 字幕查看 | 参会者 | WebSocket (只读 + 发送语言偏好) |
| `/terms` | 术语库管理 | 管理员 | `GET/POST/PATCH/DELETE /api/terms*` |
| `/meeting/summary` | 会议结束 / 导出 | 主持人、参会者 | `GET /api/meetings/{id}/summary`、`POST /api/meetings/{id}/exports` |


## 5. 字段与协议约定

为减少前后端转换成本，请后端尽量遵守:

- **JSON 字段命名**: 全部 `camelCase` (例如 `meetingId`、`sourceLang`、`durationSeconds`)。
- **时间字段**: ISO 8601 字符串带时区偏移，例如 `2026-06-16T10:30:25+08:00`。
- **语言代码**: BCP 47 短码，前端目前枚举为:

  ```ts
  type LanguageCode =
    | "zh-CN" | "en-US" | "ja-JP" | "fr-FR"
    | "es-ES" | "de-DE" | "ko-KR";
  ```

- **设备状态枚举**:

  ```ts
  type DeviceStatus =
    | "normal" | "connected" | "warning" | "error" | "disabled";
  ```

- **会议状态**: `"idle" | "live" | "ended"`。
- **导出格式**: `"word" | "pdf"`。
- **错误响应**: 建议统一为 `{ code: string; message: string }`，HTTP 非 2xx 即视为失败。

完整的前端类型定义见 [`lib/types.ts`](lib/types.ts)，**强烈建议后端按此结构返回**。

## 6. REST API 契约

> 全部接口由 [`lib/api/client.ts`](lib/api/client.ts) 调用，前缀 = `NEXT_PUBLIC_API_BASE_URL`。
> 当前阶段所有响应可由后端 mock，但字段名和类型必须一致。

### 6.1 设备与会议

| Method | Path | 用途 | 优先级 |
| --- | --- | --- | --- |
| `GET` | `/api/health` | 健康检查 | 低 |
| `GET` | `/api/device/status` | 麦克风、网络、存储等设备状态 | 高 |
| `POST` | `/api/meetings` | 创建会议，返回 `meetingId` | 高 |
| `GET` | `/api/meetings/{meetingId}` | 会议详情 | 中 |
| `POST` | `/api/meetings/{meetingId}/end` | 结束会议 | 高 |
| `GET` | `/api/meetings/{meetingId}/summary` | 会议结束页数据 | 高 |

**`GET /api/device/status` 响应示例**:

```json
{
  "microphone": "normal",
  "network": "connected",
  "microphoneLevel": 76,
  "networkStrength": 88,
  "storageFreeGb": 128,
  "storageUsagePercent": 28,
  "currentTime": "10:30:25"
}
```

字段说明:

- `microphoneLevel` / `networkStrength`: `0-100`，前端用来驱动音量柱、Wi-Fi 信号条动画。
- `storageUsagePercent` / `storageFreeGb`: 二选一最少返回一个，前端目前用 `storageFreeGb` 显示文案。

**`POST /api/meetings` 请求与响应**:

```json
// Request
{
  "title": "创新驱动发展 - 合作共赢未来",
  "sourceLang": "zh-CN",
  "targetLang": "en-US"
}

// Response
{
  "meetingId": "mtg_20260616_001",
  "title": "创新驱动发展 - 合作共赢未来",
  "sourceLang": "zh-CN",
  "targetLang": "en-US",
  "startedAt": "2026-06-16T10:30:25+08:00",
  "durationSeconds": 0,
  "connectedClients": 0,
  "status": "live"
}
```

**`GET /api/meetings/{meetingId}/summary` 响应示例**:

```json
{
  "meetingId": "mtg_20260616_001",
  "title": "创新驱动发展 - 合作共赢未来",
  "startedAt": "2026-06-16T10:30:00+08:00",
  "endedAt": "2026-06-16T11:03:45+08:00",
  "durationSeconds": 2025,
  "sourceLang": "zh-CN",
  "targetLang": "en-US",
  "sourceWordCount": 2568,
  "translatedWordCount": 2542,
  "termHitCount": 316,
  "previewSegments": [
    {
      "id": "seg_001",
      "meetingId": "mtg_20260616_001",
      "sourceText": "...",
      "translatedText": "...",
      "sourceLang": "zh-CN",
      "targetLang": "en-US",
      "isFinal": true,
      "latencyMs": 682,
      "termHits": 2,
      "timestamp": "2026-06-16T10:31:03+08:00"
    }
  ]
}
```

### 6.2 术语库

| Method | Path | 用途 |
| --- | --- | --- |
| `GET` | `/api/terms?page=1&pageSize=10&keyword=&category=&status=` | 列表 + 分页 + 筛选 |
| `POST` | `/api/terms/import` | 上传 CSV / Excel，触发入库 (multipart/form-data) |
| `GET` | `/api/terms/import-jobs/{jobId}` | 导入任务状态 |
| `PATCH` | `/api/terms/{termId}` | 修改单条 |
| `DELETE` | `/api/terms/{termId}` | 删除单条 |
| `POST` | `/api/terms/batch-delete` | 批量删除，body: `{ "ids": ["..."] }` |

**列表响应**:

```json
{
  "items": [
    {
      "id": "term_001",
      "sourceTerm": "人工智能",
      "targetTerm": "Artificial Intelligence",
      "code": "AI",
      "category": "技术类",
      "status": "enabled",
      "updatedAt": "2026-06-16T10:00:00+08:00"
    }
  ],
  "page": 1,
  "pageSize": 10,
  "total": 256
}
```

后端职责: 文件解析 → 去重 / 覆盖同名 → Embedding 向量化 → FAISS 索引更新。前端只展示进度与错误。

### 6.3 会议导出

| Method | Path | 用途 |
| --- | --- | --- |
| `POST` | `/api/meetings/{meetingId}/exports` | 创建导出任务，body: `{ "format": "word" \| "pdf" }` |
| `GET` | `/api/exports/{exportId}` | 查询任务状态 |
| `GET` | `/api/exports/{exportId}/download` | 下载文件 |

**任务响应**:

```json
{
  "exportId": "exp_001",
  "meetingId": "mtg_20260616_001",
  "format": "pdf",
  "status": "completed",
  "downloadUrl": "/api/exports/exp_001/download"
}
```

`status` 取值: `"pending" | "processing" | "completed" | "failed"`。前端可轮询，间隔建议 1.5s。

## 7. WebSocket 实时协议

由 [`lib/websocket/realtime.ts`](lib/websocket/realtime.ts) 封装。

### 7.1 连接地址

```
ws://{host}:8000/ws/audio?meetingId={meetingId}&clientType=host
ws://{host}:8000/ws/audio?meetingId={meetingId}&clientType=caption
```

- `clientType=host`: 主控端 (`/meeting/live`)，可上传音频、接收字幕、发送会议控制信令。
- `clientType=caption`: 字幕端 (`/caption`)，只接收字幕和状态，可发送个人语言偏好。

### 7.2 消息封包

**所有 JSON 文本消息统一格式**:

```ts
{
  type: string;
  meetingId: string;
  timestamp: string;       // ISO 8601
  payload: Record<string, unknown>;
}
```

**音频上行**: WebSocket **binary message**，PCM `16kHz / 16-bit / mono`。

### 7.3 前端发送的事件 (上行)

| Type | 发送方 | 用途 |
| --- | --- | --- |
| `start_session` | host | 开始会议 |
| `end_session` | host | 结束会议 |
| `audio_frame` | host | 二进制 PCM 音频帧 (binary，非 JSON) |
| `display_settings_changed` | host | 修改大屏显示配置 |
| `client_language_changed` | caption | 修改个人目标语言，payload `{ targetLang }` |
| `ping` | both | 心跳与延迟检测 |

### 7.4 后端推送的事件 (下行)

完整的判别联合类型见 [`lib/types.ts`](lib/types.ts) 的 `RealtimeEvent`。

**`session_started`**:

```json
{
  "type": "session_started",
  "meetingId": "mtg_20260616_001",
  "timestamp": "2026-06-16T10:30:25+08:00",
  "payload": {
    "title": "创新驱动发展 - 合作共赢未来",
    "sourceLang": "zh-CN",
    "targetLang": "en-US"
  }
}
```

**`transcript_partial`** (流式增量原文):

```json
{
  "type": "transcript_partial",
  "meetingId": "mtg_20260616_001",
  "timestamp": "2026-06-16T10:31:02+08:00",
  "payload": {
    "segmentId": "seg_001",
    "sourceText": "人工智能正在深刻改变各行各业，",
    "sourceLang": "zh-CN",
    "isFinal": false,
    "latencyMs": 320
  }
}
```

**`translation_final`** (最终原文 + 译文):

```json
{
  "type": "translation_final",
  "meetingId": "mtg_20260616_001",
  "timestamp": "2026-06-16T10:31:03+08:00",
  "payload": {
    "segmentId": "seg_001",
    "sourceText": "人工智能正在深刻改变各行各业，推动生产力的全面提升。",
    "translatedText": "Artificial intelligence is profoundly transforming industries and driving comprehensive improvements in productivity.",
    "sourceLang": "zh-CN",
    "targetLang": "en-US",
    "isFinal": true,
    "latencyMs": 680,
    "termHits": 2
  }
}
```

**`client_count_changed`**:

```json
{
  "type": "client_count_changed",
  "meetingId": "mtg_20260616_001",
  "timestamp": "2026-06-16T10:31:05+08:00",
  "payload": { "connectedClients": 8 }
}
```

**`session_ended`**:

```json
{
  "type": "session_ended",
  "meetingId": "mtg_20260616_001",
  "timestamp": "2026-06-16T11:03:45+08:00",
  "payload": { "summaryUrl": "/api/meetings/mtg_20260616_001/summary" }
}
```

**`error`**:

```json
{
  "type": "error",
  "meetingId": "mtg_20260616_001",
  "timestamp": "2026-06-16T10:31:10+08:00",
  "payload": { "code": "ASR_TIMEOUT", "message": "ASR service timed out" }
}
```

### 7.5 重连与心跳

前端策略 (待实现，后端可据此设计):

- 断开自动重连，间隔 1s → 退避到 10s。
- 字幕端重连成功后会重发当前 `targetLang`。
- 主控端断线时只标记网络异常，**不清空已显示的字幕**。
- 建议 30s 一次 `ping`，后端回 `pong` 即可。

## 8. 前端类型契约 (摘要)

完整版见 [`lib/types.ts`](lib/types.ts)。

```ts
export interface MeetingSession {
  meetingId: string;
  title: string;
  sourceLang: LanguageCode;
  targetLang: LanguageCode;
  startedAt: string;
  endedAt?: string;
  durationSeconds: number;
  connectedClients: number;
  status: "idle" | "live" | "ended";
}

export interface SubtitleSegment {
  id: string;
  meetingId: string;
  sourceText: string;
  translatedText: string;
  sourceLang: LanguageCode;
  targetLang: LanguageCode;
  isFinal: boolean;
  latencyMs?: number;
  termHits?: number;
  timestamp: string;
}

export interface TermEntry {
  id: string;
  sourceTerm: string;
  targetTerm: string;
  code?: string;
  category: string;
  status: "enabled" | "disabled";
  updatedAt: string;
}

export interface MeetingSummary {
  meetingId: string;
  title: string;
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
  sourceLang: LanguageCode;
  targetLang: LanguageCode;
  sourceWordCount: number;
  translatedWordCount: number;
  termHitCount: number;
  previewSegments: SubtitleSegment[];
}
```

## 9. Mock 与替换策略

当前 [`lib/mock-data.ts`](lib/mock-data.ts) 提供:

- `deviceHealth`: 首页设备状态
- `activeMeeting`: 进行中的会议元数据
- `subtitleSegments`: 双语字幕片段
- `terms`: 术语样本
- `meetingSummary`: 会议总结
- `languages`: 语言下拉项

**对接顺序建议** (摩擦最小):

1. 术语库列表 + 上传接口 → 跑通静态管理闭环
2. 创建会议 + 结束会议接口 → 跑通会议生命周期
3. WebSocket 字幕下行 → `/meeting/live` 与 `/caption` 同时联动
4. 主控端音频上行 (binary)
5. 会议总结接口
6. Word / PDF 导出接口

## 10. 联调检查清单

- [ ] 首页能读取真实设备状态 (`microphoneLevel`、`networkStrength` 驱动动画)
- [ ] 点击"开始同声传译"能返回真实 `meetingId`
- [ ] `/meeting/live` 能建立 WebSocket，发送 `start_session`
- [ ] 主控端能上行 PCM 音频帧
- [ ] 主控端能接收 `transcript_partial` 与 `translation_final`
- [ ] `/caption` 能接入同一 `meetingId` 接收译文
- [ ] 字幕端切换 `targetLang`，能在下一片段收到对应译文
- [ ] 术语库 CSV / Excel 上传能落库并影响后续翻译命中
- [ ] 结束会议后跳转 `/meeting/summary` 能拿到统计数据
- [ ] Word / PDF 导出能下载到正确格式
- [ ] 后端宕机时前端有可理解的错误提示

## 11. 目录结构

```text
app/
  layout.tsx              # 根布局
  globals.css             # 单文件设计系统 (CSS 变量 + 动效)
  page.tsx                # /
  meeting/
    live/page.tsx         # /meeting/live
    summary/page.tsx      # /meeting/summary
  caption/page.tsx        # /caption
  terms/page.tsx          # /terms
components/
  shared/
    PanelHeader.tsx
    StatusItem.tsx
    VideoStage.tsx
    WaveIndicator.tsx
    DynamicStatusIcon.tsx # Wi-Fi / 麦克风 / 存储 / 时间 动态图标
lib/
  types.ts                # 共享类型契约 (后端 ↔ 前端)
  mock-data.ts            # Mock 数据
  format.ts               # 时长 / 时间 / 数字格式化
  api/client.ts           # REST 客户端骨架
  websocket/realtime.ts   # WebSocket 客户端骨架
docs/
  frontend-design-and-integration.md   # 完整设计文档
  architecture-v2-design.pdf           # 架构图
  *.docx                                # 产品 PRD
```

## 12. 已知差异与待办

- `DeviceHealth` 当前未包含动态字段 (`microphoneLevel` / `networkStrength` / `storageUsagePercent`)，后端首次返回这些字段时需要前端同步类型。
- 字幕设置 (字号、显示开关) 暂未持久化，规划走 `localStorage`。
- WebSocket 重连 / 心跳 / 二进制音频上行尚未在 `realtime.ts` 实现，目前是连接骨架。
- 术语库的搜索、筛选、分页、批量选择当前为静态 UI，等接口落地后接客户端逻辑。
- 暂未引入 React Query / SWR，待接口稳定后再决定数据层方案。

## 13. 联系方式

- 前端: 见 git 提交记录中的 author。
- 设计文档: [`docs/frontend-design-and-integration.md`](docs/frontend-design-and-integration.md)
- 字段或协议变更，**优先更新 `lib/types.ts` 与 `docs/frontend-design-and-integration.md`，再同步本 README**。
