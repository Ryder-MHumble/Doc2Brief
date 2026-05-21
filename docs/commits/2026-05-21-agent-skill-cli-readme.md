# 2026-05-21 Agent Skill、CLI 与 README 交付说明

## 提交摘要

本次提交将 Doc2Brief 的周报生成能力从 Web 页面扩展为可被 Agent 稳定调用的 Skill + CLI 工作流，并同步重写 README，使开源用户可以从部署、模板选择、报告生成、同链接修改到验证命令形成闭环。

## 变更范围

- 新增 `bin/doc2brief.js` 作为 CLI 入口。
- 新增 `skills/doc2brief-weekly-report/SKILL.md` 作为 Agent Skill。
- 新增 `src/lib/weekly-report-agent.js`，负责自动模板匹配与内容富化。
- 新增 `src/lib/templates/node-assets.js`，让 Node CLI 能复用内置模板。
- 扩展 `server/app.js`，新增报告元数据查询和同链接更新接口。
- 重写 `README.md`，加入 30 秒开始、模板图库、Agent Skill、CLI、API、验证与项目结构。
- 新增 `docs/assets/templates/*.png`，用于 README 模板预览表格。
- 新增验证脚本 `scripts/verify-agent-skill-flow.mjs` 和截图脚本 `scripts/generate-template-gallery.mjs`。

## 行为说明

### 新建报告

Agent 或用户通过 CLI 调用：

```bash
node bin/doc2brief.js generate --input ./weekly.md --base-url http://127.0.0.1:5173 --json
```

系统会读取文件或文本、自动匹配模板、富化模板数据、渲染 HTML，并通过 `/api/reports/publish` 返回可访问的 `/r/<reportId>` 链接。

### 修改已有报告

Agent 或用户通过 CLI 调用：

```bash
node bin/doc2brief.js update --report-id rpt_xxx --text "修改后的内容" --base-url http://127.0.0.1:5173 --json
```

系统会读取已有报告元数据，默认沿用原模板，覆盖原 HTML 文件并返回同一个 `shareUrl`。该流程不会创建新的报告文件和链接。

## 合规性检查

- 对话、README、Skill、提交文档使用中文。
- 代码变量名、函数名保持英文。
- 用户可见 CLI 输出、系统日志、业务 JSON 使用中文。
- 周报主链路保持 `file / text -> html` 优先。
- 模板系统继续内置，不走纯 prompt 直出整页 HTML。
- 新增 CLI 和服务端接口均输出业务层 JSON 或系统级日志。
- 新增验证脚本使用真实服务、真实 CLI、真实模板渲染、真实发布与更新接口，不依赖 mock 结论。
- 未提交运行期用量日志 `data/usage/openrouter-usage.ndjson`。

## 验证记录

已执行并通过：

```bash
python3 ~/.codex/skills/.system/skill-creator/scripts/quick_validate.py skills/doc2brief-weekly-report
npm run gallery:templates
npm run verify:agent-skill
npm run build
```

`npm run verify:agent-skill` 覆盖：

```text
启动服务 -> CLI 生成报告 -> 发布链接 -> 查询元数据 -> CLI 更新同一 reportId -> 访问同一链接
```

## 风险与部署说明

- `POST /api/reports/update` 允许持有 `reportId` 的调用方覆盖报告内容。当前行为符合 Agent 内网调用和既有发布接口风格；公网部署时建议放在内网、VPN、网关鉴权或反向代理鉴权之后。
- CLI 的 PDF/DOCX 抽取依赖现有 `pdfjs-dist` 和 `mammoth`，复杂扫描件 PDF 仍建议用户补充粘贴文本。
- 自动模板匹配采用轻量关键词规则，适合稳定 MVP；后续可扩展为模型评分或可配置规则。
