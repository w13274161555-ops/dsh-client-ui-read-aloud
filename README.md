# dsh-client-ui-read-aloud

给 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）用的朗读插件：把每条回复用自然的中文神经语音念出来。

![图标](icon.svg)

## 功能

- **每条回复一个朗读按钮** —— 在回复末尾的操作栏里，点一下开始朗读，再点一下停止
- **自动朗读开关** —— 在会话标题栏右侧，打开后每条新回复自动朗读，每段只念一次，不会打断正在播的内容
- **7 个中文音色** —— 普通话 5 个（晓晓、云希、云扬、晓伊、云健）+ 东北话（晓北）+ 陕西话（晓妮）
- **自动降级** —— 神经语音不可用时自动退回浏览器内置语音，离线也能出声

## 安装

### 方式一：从 GitHub 安装（推荐）

在 DSH 里让 Agent 执行：

```
帮我装这个插件：github:你的用户名/dsh-client-ui-read-aloud
```

或者手动：

```powershell
cd $env:DSH_HOME\profiles\desktop

# 1. 加依赖
pnpm add github:<你的用户名>/dsh-client-ui-read-aloud

# 2. 把包名加进 dsh.profile.bundles
#    编辑 package.json，在 "bundles" 数组里加一行：
#    "dsh-client-ui-read-aloud"

# 3. 刷新页面（Ctrl+R）
```

插件包自带 `cordis.patch.yml`，装好后**自动生效**，不需要改 profile 的 `cordis.patch.yml`。

### 方式二：从本地目录安装

```powershell
cd $env:DSH_HOME\profiles\desktop
pnpm add file:C:\你的路径\dsh-client-ui-read-aloud
```

然后把 `"dsh-client-ui-read-aloud"` 加进 `dsh.profile.bundles`，刷新页面。

### 卸载

把 `"dsh-client-ui-read-aloud"` 从 `dsh.profile.bundles` 移除，再 `pnpm remove dsh-client-ui-read-aloud`，刷新页面。

## 语音是怎么来的

宿主端用 [`msedge-tts`](https://www.npmjs.com/package/msedge-tts)（纯 Node 实现）调用微软 Edge 的神经语音服务，合成 MP3 后通过 `/dsh-read-aloud` 路由交给页面播放。

- **不需要 Python**，不需要 API key
- **需要联网**：断网时自动退回浏览器内置语音
- 服务只监听 `127.0.0.1` 的随机端口，不暴露公网

## 结构

| 文件 | 作用 |
|---|---|
| `package.json` | 声明 `dsh.bundle.patch` 和 `dsh.client`，让 DSH 自动挂载 |
| `cordis.patch.yml` | bundle 补丁，插入插件行（装好即生效） |
| `lib/index.js` | 宿主端：本地 TTS 服务 + `/dsh-read-aloud` 路由 |
| `lib/client.js` | 浏览器端：朗读按钮、自动开关、音色选择、降级 |

## 路由

| 方法 | 路径 | 作用 |
|---|---|---|
| `GET` | `/dsh-read-aloud/voices` | 返回音色列表，页面用它探测引擎是否可用 |
| `POST` | `/dsh-read-aloud/speak` | 请求体 `{ text, voice }`，返回 `audio/mpeg` |

页面**不依赖**任何启动注入，只探测这个路由。这一点是刻意的：早先版本用 `webserver/index-inject` 注入配置，行格式写错会让整个页面渲染失败（`renderRow` 对未知格式直接抛错），所以现在完全不注入。

## 已知限制

- 单次请求文本上限 8000 字符，超时 30 秒
- 长回复分成多段依次合成播放，段间可能有极短停顿
- 神经语音需要联网；纯离线场景只有浏览器内置语音

## 许可

[MIT](LICENSE)
