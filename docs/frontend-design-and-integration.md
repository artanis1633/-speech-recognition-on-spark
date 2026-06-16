# 离线会议翻译平台前端设计与后端对接文档

> 维护约定：本文档是前端主设计文档。后续每次新增页面、调整路由、变更 Mock 数据结构、确认后端接口或完成联调，都需要同步更新本文档。

## 1. 项目背景与前端目标

本项目计划基于 NVIDIA DGX Spark 单机环境，实现本地 AI 离线语音翻译与会议纪要能力。系统面向高安全、弱联网或完全离线的企业会议场景，核心价值是让音频、转写文本、译文、术语库和会议纪要全程留在本地私有环境内。

前端在本阶段的主要目标：

- 使用 Next.js 14 + React 18 + TypeScript 复刻现有预览图中的 5 个功能页面。（已建立首版页面）
- 在后端接口尚未完全就绪时，使用本地 Mock 数据和模拟 WebSocket 事件完成可演示页面。（已建立 Mock 类型和对接骨架）
- 保持页面结构、数据模型和接口边界清晰，方便后端同事后续按约定接入真实 REST API 与 WebSocket 服务。
- 视觉上优先还原预览图的深色会议大屏风格，包括蓝黑背景、发光边框、状态色、控制面板、字幕卡片和导出操作区。

当前已确认的前端技术栈：

- Framework: Next.js 14 App Router
- Runtime UI: React 18
- Language: TypeScript
- Styling: 建议使用 CSS Modules、Tailwind CSS 或全局 CSS 变量均可；最终实现应保持一致，不混用多套风格系统
- Backend phase: 当前先 Mock，后续对接 FastAPI + WebSocket 后端

说明：架构 PDF 中曾出现 Vue SPA 描述，当前以前端实现要求为准，统一采用 Next.js 14 + React 18 + TypeScript。

## 2. 页面业务逻辑

### 2.1 `/` 设备首页 / 会议入口页

首页是会议室设备的大屏入口，面向主持人、会议管理员或现场操作人员。

核心功能：

- 展示系统名称：会议室语音转译终端系统。
- 提供 4 个主入口：
  - 开始语音转译：进入实时会议主控和大屏展示页。
  - PC 字幕查看：展示或进入参会者 PC 字幕访问页。
  - 专业术语库管理：进入管理员术语库页面。
  - 历史会议 / 文档：后续用于会议记录与导出文档管理，当前可先预留。
- 展示设备状态：
  - 麦克风状态：正常 / 异常 / 未授权。
  - 网络状态：已连接 / 未连接。
  - 存储空间：剩余容量。
  - 当前时间。

交互建议：

- 点击“开始语音转译”跳转 `/meeting/live`，并在未来触发创建会议会话。
- 点击“PC 字幕查看”跳转 `/caption` 或弹出局域网访问二维码。
- 点击“专业术语库管理”跳转 `/terms`。
- 点击“历史会议 / 文档”后续跳转会议记录页；当前如页面未实现，可展示禁用态或进入 `/meeting/summary` 演示导出闭环。

### 2.2 `/meeting/live` 语音转译主控 + 会议室大屏展示页

该页面是会中核心页面，同时承担会议室大屏展示与主持人主控能力。

核心功能：

- 展示会议现场画面或占位图。
- 实时展示原文字幕和译文字幕。
- 展示源语言、目标语言、麦克风状态、网络状态、会议时长。
- 展示局域网访问地址和 PC 扫码访问二维码。
- 展示已连接 PC 数量。
- 提供“显示设置”和“结束会议”操作。

数据来源：

- 当前阶段使用本地 Mock 字幕流。
- 后续通过 WebSocket 接收后端推送的转写、翻译、状态和连接数事件。

关键状态：

- `meetingId`: 当前会议 ID。
- `meetingTitle`: 当前会议名称。
- `sourceLang`: 源语言，例如 `zh-CN`。
- `targetLang`: 目标语言，例如 `en-US`。
- `microphoneStatus`: 麦克风状态。
- `networkStatus`: 网络状态。
- `durationSeconds`: 会议计时。
- `connectedClients`: 已连接 PC 数。
- `currentTranscript`: 当前原文字幕。
- `currentTranslation`: 当前译文字幕。

结束会议流程：

1. 用户点击“结束会议”。
2. 前端向后端发送结束控制信令或调用结束会议接口。
3. 后端停止音频处理，固化会议转写、译文和统计数据。
4. 前端跳转 `/meeting/summary?meetingId=...`。

### 2.3 `/caption` PC 字幕查看页

PC 字幕页面向参会者。参会者通过同一局域网访问主机地址，在个人电脑或移动设备查看字幕。

核心功能：

- 展示连接状态与本地设备信息。
- 展示会议名称、网络延迟和连接状态。
- 展示直播画面或会议画面占位。
- 实时展示原文和译文字幕。
- 支持参会者自行设置：
  - 源语言。
  - 目标语言。
  - 是否显示原文。
  - 是否显示译文。
  - 字体大小。

交互建议：

- 语言下拉框改变后，前端向后端发送 `client_language_changed` 控制事件。
- 字幕显示开关和字体大小属于本地 UI 偏好，可优先保存在组件状态或 localStorage。
- PC 字幕页只读会议内容，不提供结束会议能力。

### 2.4 `/terms` 专业术语库管理页

术语库管理页面向管理员，用于会前维护企业专业术语、行业词汇和 RAG 知识库语料。

核心功能：

- 展示统计信息：
  - 术语总数。
  - 当前状态。
  - 最后导入时间。
  - 导入来源。
- 支持导入：
  - CSV。
  - Excel。
  - U 盘文件。
- 支持查询与筛选：
  - 关键词搜索。
  - 分类筛选。
  - 状态筛选。
- 支持术语列表管理：
  - 查看中文术语、英文术语、编号、分类、状态。
  - 勾选多条术语。
  - 批量删除。
  - 单条删除。
  - 启用 / 禁用术语。
  - 分页。

当前阶段：

- 使用 Mock 术语列表和前端本地筛选。
- 导入按钮可先实现文件选择和前端提示，不必真正解析入库。

后端对接后：

- 文件上传由后端负责解析、去重、覆盖同名或相同词条、Embedding 向量化和 FAISS 索引更新。
- 前端只展示导入进度、成功结果和错误信息。

### 2.5 `/meeting/summary` 会议结束 / 文档导出页

会议结束页是会后闭环页面，用于展示会议统计、内容预览和文档导出入口。

核心功能：

- 展示会议已结束状态。
- 展示会议信息：
  - 会议主题。
  - 开始时间。
  - 结束时间。
  - 会议时长。
  - 源语言。
  - 默认目标语言。
- 展示统计数据：
  - 原文字数总数。
  - 译文字数总数。
  - 术语命中总数。
- 展示内容预览：
  - 原文片段。
  - 译文片段。
  - 更多内容折叠提示。
- 提供操作按钮：
  - 导出 Word。
  - 导出 PDF。
  - 查看会议记录。
  - 返回首页。

导出流程建议：

1. 用户点击导出 Word 或 PDF。
2. 前端调用导出接口创建导出任务。
3. 后端返回文件下载地址，或返回异步任务 ID。
4. 前端下载文件或轮询导出任务状态。

## 3. 路由规划

| 路由 | 页面 | 用户 | 当前实现状态 | 后端依赖 |
| --- | --- | --- | --- | --- |
| `/` | 设备首页 / 会议入口页 | 主持人 / 现场操作人员 | 已实现 / 待联调 | 设备状态、创建会议 |
| `/meeting/live` | 语音转译主控 + 会议室大屏展示页 | 主持人 / 现场操作人员 | 已实现 / 待联调 | WebSocket、会议控制 |
| `/caption` | PC 字幕查看页 | 参会者 | 已实现 / 待联调 | WebSocket、语言设置 |
| `/terms` | 专业术语库管理页 | 管理员 | 已实现 / 待联调 | 术语 CRUD、文件上传 |
| `/meeting/summary` | 会议结束 / 文档导出页 | 主持人 / 参会者 | 已实现 / 待联调 | 会议详情、导出接口 |

建议目录结构：

```text
app/
  page.tsx
  globals.css
  layout.tsx
  meeting/
    live/
      page.tsx
    summary/
      page.tsx
  caption/
    page.tsx
  terms/
    page.tsx
components/
  shared/
    PanelHeader.tsx
    StatusItem.tsx
    VideoStage.tsx
    WaveIndicator.tsx
lib/
  api/
    client.ts
  mock/
  types/
  mock-data.ts
  format.ts
  websocket/
    realtime.ts
styles/
```

当前代码说明：

- `lib/types.ts` 定义会议、字幕、术语、导出任务与 WebSocket 事件类型。
- `lib/mock-data.ts` 提供 5 个页面的首版 Mock 数据。
- `lib/api/client.ts` 预留 REST API client，后续可通过 `NEXT_PUBLIC_API_BASE_URL` 切换后端地址。
- `lib/websocket/realtime.ts` 预留 WebSocket client，后续可通过 `NEXT_PUBLIC_WS_BASE_URL` 切换后端地址。
- `app/globals.css` 承载当前首版深色大屏视觉系统。
- `components/shared/DynamicStatusIcon.tsx` 承载 Wi-Fi、麦克风、存储和时间的动态状态图标，后续可由后端实时指标驱动。

## 4. 组件拆分方案

### 4.1 通用组件

- `AppShell`: 页面整体背景、最大宽度、安全边距。
- `GlassPanel`: 深色透明面板，带描边和轻微发光。
- `StatusBadge`: 状态标签，支持正常、已连接、异常、禁用等状态。
- `IconButton`: 图标按钮。
- `MetricCard`: 数值统计卡。
- `LanguageSelect`: 语言选择器。
- `WaveIndicator`: 字幕下方的音频波形动效。
- `DynamicStatusIcon`: 动态状态图标，包含 Wi-Fi 信号强度、麦克风收音电平、存储余量环、时间脉冲。
- `QRCodePanel`: 局域网访问地址和二维码展示。

### 4.2 首页组件

- `HomeHero`: 系统标题和背景。
- `EntryCardGrid`: 4 个入口卡片。
- `DeviceStatusBar`: 麦克风、网络、存储和时间状态。

### 4.3 会议直播组件

- `MeetingVideoStage`: 会议画面区域。
- `LiveSubtitlePanel`: 原文 / 译文字幕卡片。
- `MeetingControlSidebar`: 右侧语言、状态、二维码和控制按钮。
- `MeetingTimer`: 会议计时器。
- `EndMeetingButton`: 结束会议按钮。

### 4.4 PC 字幕组件

- `CaptionConnectionPanel`: 连接状态、访问地址、会议名称和延迟。
- `CaptionVideoCard`: 会议画面。
- `CaptionTextStack`: 双语字幕区域。
- `CaptionSettingsPanel`: 字幕语言、显示开关和字体大小。

### 4.5 术语库组件

- `TermStatsHeader`: 术语总数、状态、最后导入和来源。
- `TermImportActions`: CSV、Excel、U 盘导入按钮。
- `TermToolbar`: 搜索、分类筛选、状态筛选、批量删除。
- `TermTable`: 术语表格。
- `TermPagination`: 分页。

### 4.6 会议结束组件

- `SummaryHeader`: 会议已结束状态。
- `MeetingInfoPanel`: 会议基础信息。
- `SummaryMetricCards`: 字数和术语命中统计。
- `ContentPreviewPanel`: 原文 / 译文片段预览。
- `ExportActions`: Word、PDF、会议记录、返回首页按钮。

## 5. 前端类型与 Mock 数据设计

建议优先在 `lib/types/` 中定义共享类型，Mock 数据放在 `lib/mock/` 中。后续对接后端时，尽量保持类型不变，只替换数据来源。

### 5.1 基础类型

```ts
export type LanguageCode = 'zh-CN' | 'en-US' | 'ja-JP' | 'fr-FR' | 'es-ES' | 'de-DE' | 'ko-KR';

export type DeviceStatus = 'normal' | 'connected' | 'warning' | 'error' | 'disabled';

export interface DeviceHealth {
  microphone: DeviceStatus;
  network: DeviceStatus;
  microphoneLevel?: number;
  networkStrength?: number;
  storageUsagePercent?: number;
  storageFreeGb: number;
  currentTime: string;
}
```

动态状态字段建议：

- `microphoneLevel`: 0-100，表示当前收音电平，前端用于驱动麦克风音量柱动画。
- `networkStrength`: 0-100，表示局域网信号强弱，前端用于驱动 Wi-Fi 信号条亮起数量和动画强度。
- `storageUsagePercent`: 0-100，表示存储使用比例；如果后端只返回剩余比例，字段可改为 `storageFreePercent`，但需前后端统一。

### 5.2 会议类型

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
  status: 'idle' | 'live' | 'ended';
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
```

### 5.3 术语类型

```ts
export interface TermEntry {
  id: string;
  sourceTerm: string;
  targetTerm: string;
  code?: string;
  category: string;
  status: 'enabled' | 'disabled';
  updatedAt: string;
}

export interface TermImportJob {
  jobId: string;
  filename: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalRows?: number;
  importedRows?: number;
  failedRows?: number;
  message?: string;
}
```

### 5.4 会议总结类型

```ts
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

export interface ExportTask {
  exportId: string;
  meetingId: string;
  format: 'word' | 'pdf';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  downloadUrl?: string;
  message?: string;
}
```

## 6. 后端 REST API 对接建议

### 6.1 约定原则

- REST API 负责非实时数据：会议元信息、术语库、文件上传、会议记录和导出。
- WebSocket 负责实时数据：音频上行、字幕下行、会议控制事件和连接状态。
- 当前阶段接口均可由前端 Mock；后端实现后逐个替换。
- 字段命名建议统一使用 camelCase，减少前端转换成本。
- 时间字段统一使用 ISO 8601 字符串，例如 `2026-06-16T10:30:25+08:00`。

### 6.2 设备与会议接口

| Method | Path | 用途 | 当前前端策略 |
| --- | --- | --- | --- |
| `GET` | `/api/health` | 健康检查 | 可 Mock |
| `GET` | `/api/device/status` | 获取麦克风、网络、存储状态和动态强度指标 | 可 Mock |
| `POST` | `/api/meetings` | 创建会议并返回 `meetingId` | 前期可本地生成 |
| `GET` | `/api/meetings/{meetingId}` | 获取会议详情 | 可 Mock |
| `POST` | `/api/meetings/{meetingId}/end` | 结束会议 | 后期必须对接 |
| `GET` | `/api/meetings/{meetingId}/summary` | 获取会议总结页数据 | 后期必须对接 |

创建会议响应示例：

```json
{
  "meetingId": "mtg_20260616_001",
  "title": "创新驱动发展 - 合作共赢未来",
  "sourceLang": "zh-CN",
  "targetLang": "en-US",
  "startedAt": "2026-06-16T10:30:25+08:00",
  "status": "live"
}
```

设备状态响应示例：

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

### 6.3 术语库接口

| Method | Path | 用途 | 当前前端策略 |
| --- | --- | --- | --- |
| `GET` | `/api/terms` | 获取术语列表，支持分页和筛选 | 可 Mock |
| `POST` | `/api/terms/import` | 上传 CSV / Excel 并触发入库 | 后期必须对接 |
| `GET` | `/api/terms/import-jobs/{jobId}` | 查询导入任务状态 | 后期建议对接 |
| `PATCH` | `/api/terms/{termId}` | 修改术语状态或内容 | 可 Mock |
| `DELETE` | `/api/terms/{termId}` | 删除单条术语 | 可 Mock |
| `POST` | `/api/terms/batch-delete` | 批量删除术语 | 可 Mock |

术语列表查询参数建议：

```text
GET /api/terms?page=1&pageSize=10&keyword=AI&category=技术类&status=enabled
```

术语列表响应示例：

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

### 6.4 会议导出接口

| Method | Path | 用途 | 当前前端策略 |
| --- | --- | --- | --- |
| `POST` | `/api/meetings/{meetingId}/exports` | 创建 Word / PDF 导出任务 | 后期必须对接 |
| `GET` | `/api/exports/{exportId}` | 查询导出任务状态 | 后期建议对接 |
| `GET` | `/api/exports/{exportId}/download` | 下载导出文件 | 后期必须对接 |

创建导出请求示例：

```json
{
  "format": "pdf"
}
```

导出任务响应示例：

```json
{
  "exportId": "exp_001",
  "meetingId": "mtg_20260616_001",
  "format": "pdf",
  "status": "completed",
  "downloadUrl": "/api/exports/exp_001/download"
}
```

## 7. WebSocket 实时协议建议

### 7.1 连接地址

建议后端提供统一 WebSocket 地址：

```text
ws://{host}:8000/ws/audio?meetingId={meetingId}&clientType=host
ws://{host}:8000/ws/audio?meetingId={meetingId}&clientType=caption
```

其中：

- `clientType=host`: 会议室主控端，可上传音频、接收字幕、发送会议控制信令。
- `clientType=caption`: PC 字幕端，只接收字幕和状态，可发送个人语言偏好。

### 7.2 前端发送事件

控制信令使用 JSON 文本消息。

```json
{
  "type": "start_session",
  "meetingId": "mtg_20260616_001",
  "sourceLang": "zh-CN",
  "targetLang": "en-US",
  "timestamp": "2026-06-16T10:30:25+08:00"
}
```

建议事件类型：

| Type | 发送方 | 用途 |
| --- | --- | --- |
| `start_session` | 主控前端 | 开始会议 |
| `end_session` | 主控前端 | 结束会议 |
| `audio_frame` | 主控前端 | 二进制 PCM 音频帧，实际用 binary message |
| `client_language_changed` | PC 字幕前端 | 修改个人目标语言 |
| `display_settings_changed` | 主控前端 | 修改大屏显示配置 |
| `ping` | 前端 | 心跳与延迟检测 |

音频上行建议：

- 格式：16kHz / 16-bit / mono PCM。
- 传输：WebSocket binary message。
- 控制事件：WebSocket text JSON。

### 7.3 后端推送事件

建议后端推送事件统一包含：

- `type`: 事件类型。
- `meetingId`: 会议 ID。
- `timestamp`: 事件时间。
- `payload`: 事件数据。

会话开始：

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

原文转写片段：

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

最终译文片段：

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

连接数变化：

```json
{
  "type": "client_count_changed",
  "meetingId": "mtg_20260616_001",
  "timestamp": "2026-06-16T10:31:05+08:00",
  "payload": {
    "connectedClients": 8
  }
}
```

会话结束：

```json
{
  "type": "session_ended",
  "meetingId": "mtg_20260616_001",
  "timestamp": "2026-06-16T11:03:45+08:00",
  "payload": {
    "summaryUrl": "/api/meetings/mtg_20260616_001/summary"
  }
}
```

错误事件：

```json
{
  "type": "error",
  "meetingId": "mtg_20260616_001",
  "timestamp": "2026-06-16T10:31:10+08:00",
  "payload": {
    "code": "ASR_TIMEOUT",
    "message": "ASR service timed out"
  }
}
```

### 7.4 前端断线重连策略

建议前端实现：

- WebSocket 断开后自动重连。
- 重连间隔从 1s 开始，逐步退避到 10s。
- PC 字幕端重连成功后发送当前目标语言偏好。
- 主控端断线时展示明显的网络异常状态，但不立即清空当前字幕。

## 8. Mock 与真实接口替换策略

当前阶段执行状态：

- 首页设备状态：已使用 Mock。
- 会议直播字幕：已使用 Mock 字幕片段渲染。
- PC 字幕：已复用 Mock 字幕片段渲染。
- 术语库：已使用 Mock 表格数据渲染，搜索与筛选控件已预留。
- 会议总结：已使用 Mock 统计数据和预览片段。
- 导出 Word / PDF：按钮已预留，后续对接导出任务接口。

替换真实接口时建议按以下顺序：

1. 术语库列表和上传接口。
2. 创建会议和结束会议接口。
3. WebSocket 字幕下行。
4. 主控端音频上行。
5. 会议总结接口。
6. Word / PDF 导出接口。

这样可以先完成静态管理功能和会后闭环，再进入实时音频链路联调。

## 9. 联调流程建议

### 9.1 前后端联调前准备

前端需要提供：

- 页面路由和访问地址。
- 当前使用的 Mock 数据结构。
- WebSocket 事件消费逻辑。
- API client 封装位置。
- 当前支持的语言列表。

后端需要提供：

- 后端服务地址和端口。
- REST API 文档或 OpenAPI JSON。
- WebSocket 地址和事件协议。
- 音频格式要求。
- 文件上传限制。
- 导出文件格式和下载方式。

### 9.2 联调检查清单

- 首页可以读取真实设备状态。
- 点击开始会议后可获得真实 `meetingId`。
- 主控页可以建立 WebSocket 连接。
- 主控页可以发送音频帧或测试音频事件。
- 主控页可以收到原文和译文字幕。
- PC 字幕页可以接入同一会议。
- 修改 PC 端目标语言后可以收到对应译文。
- 术语库可以上传、查询、删除、启用和禁用。
- 结束会议后可以进入总结页。
- 总结页可以导出 Word 和 PDF。
- 断网或后端异常时页面有可理解的错误提示。

## 10. 更新规范

为了保证本文档持续可用，后续开发按以下规则维护：

- 每新增或修改页面路由，同步更新“路由规划”。
- 每新增共享类型，同步更新“前端类型与 Mock 数据设计”。
- 每新增 Mock 数据文件，同步说明 Mock 覆盖的业务场景。
- 每确认一个后端接口，将状态从“建议接口”更新为“已确认接口”。
- 每废弃一个接口或字段，在文档中标注替代方案。
- 每完成一个页面，将实现状态从“待实现”更新为“已实现”或“待联调”。
- 每次联调发现协议不一致，优先更新本文档，再同步修改代码。
