#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$ROOT_DIR/frontend"

if [[ ! -d "$FRONTEND_DIR" ]]; then
  echo "[系统日志] 未找到 frontend 目录: $FRONTEND_DIR"
  exit 1
fi

echo "[系统日志] 启动前端单体模式（无后端服务）"
cd "$FRONTEND_DIR"

if [[ ! -d node_modules ]]; then
  echo "[系统日志] 安装前端依赖"
  npm install
fi

echo "[系统日志] 启动 Vite 开发服务: http://127.0.0.1:5173"
npm run dev
