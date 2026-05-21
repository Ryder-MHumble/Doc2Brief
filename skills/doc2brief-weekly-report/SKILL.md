---
name: doc2brief-weekly-report
description: Use when Codex needs to generate, publish, or edit a Doc2Brief weekly report from uploaded documents or pasted text. Triggers include creating a weekly report link, choosing the best built-in weekly-report template automatically, enriching report content for that template, publishing a shareable report URL, or updating an existing report without creating a new report file or URL.
---

# Doc2Brief Weekly Report

## Overview

Use the repository CLI to turn a weekly-report document or pasted text into a published Doc2Brief report link. The CLI automatically chooses a built-in template, enriches structured report fields for that template, renders HTML, and publishes it through the running Doc2Brief service.

For edits to an existing report, always update the original `reportId` or `/r/<reportId>` URL. Do not generate a new report unless the user explicitly asks for a separate new report.

## Prerequisites

Run commands from the Doc2Brief project root.

1. Ensure dependencies are installed:

```bash
npm install
```

2. Ensure the service is running and reachable:

```bash
npm run start:prod
```

Default service URL: `http://10.1.132.21:5173`

If the service runs elsewhere, pass `--base-url <url>` to every CLI command or set `DOC2BRIEF_BASE_URL`.

## Generate A New Report

Use `generate` when the user provides a new document or text and wants a new accessible report link.

```bash
node bin/doc2brief.js generate \
  --input ./weekly.md \
  --base-url http://10.1.132.21:5173 \
  --json
```

For pasted text:

```bash
node bin/doc2brief.js generate \
  --text "本周完成重点项目灰度上线，下周推进验收。" \
  --base-url http://10.1.132.21:5173 \
  --json
```

Expected stdout is machine-readable JSON:

```json
{
  "action": "generate",
  "reportId": "rpt_xxx",
  "shareUrl": "http://10.1.132.21:5173/r/rpt_xxx",
  "templateId": "template-06",
  "templateName": "控制台仪表盘周报"
}
```

Return the `shareUrl` to the user. Keep the `reportId` in your working notes because later edits must use it.

## Update An Existing Report

Use `update` when the user asks to revise,补充,润色,改标题,改口径,替换内容, or otherwise modify an existing Doc2Brief report.

Important rule: if the user refers to an existing report link or report ID, call `update`, not `generate`.

```bash
node bin/doc2brief.js update \
  --report-id rpt_xxx \
  --text "修改后的周报内容或补充说明" \
  --base-url http://10.1.132.21:5173 \
  --json
```

Using a URL is also valid:

```bash
node bin/doc2brief.js update \
  --url http://10.1.132.21:5173/r/rpt_xxx \
  --input ./weekly-revised.md \
  --json
```

The command reads the existing report metadata, preserves the original template unless the user explicitly passes `--template`, writes the new HTML back to the same stored file, and returns the same `shareUrl`.

## Template Selection

Default to `--template auto`. The CLI matches the report text against the built-in templates:

- `template-01`: 冲刺、攻关、战情、风险闭环
- `template-02`: 数据、指标、经营复盘
- `template-03`: 正式通报、栏目化周报
- `template-04`: 品牌展示、专题汇报、对外表达
- `template-05`: 文化、仪式感、特色汇报
- `template-06`: 项目推进、看板、上线、运营追踪
- `template-07`: 新闻快讯、活动动态、简报速览
- `template-08`: 科研、课题、论文、实验、归档材料
- `template-09`: 综合管理、多部门协同、资源协调

Only force a template when the user explicitly asks for a specific style:

```bash
node bin/doc2brief.js generate --input ./weekly.md --template template-08 --json
```

## Input Files

Supported input formats:

- `txt`
- `md`
- `csv`
- `html`
- `docx`
- `pdf`

Old `.doc` files are not supported directly; ask the user to convert them to `.docx` or paste the text.

## Operational Rules

- Print or summarize the final `shareUrl`, selected template, and whether the action was `generate` or `update`.
- For an edit request, preserve the same report link. Verify that the returned `reportId` matches the original.
- For a new report request, do not call update unless the user provided an existing report ID or URL.
- Use `--json` for agent workflows so stdout stays parseable. Business JSON and system logs are printed on stderr.
- If the service is not running, start it or ask the user for the deployed service URL.

## Verification

For repository validation, run:

```bash
npm run verify:agent-skill
```

This performs a real generate -> publish -> metadata lookup -> update -> same-link visit flow.
