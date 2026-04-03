#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
PID_FILE="$PROJECT_DIR/.service.pid"
LOG_DIR="$PROJECT_DIR/logs"
LOG_FILE="$LOG_DIR/server.log"
DIST_DIR="$PROJECT_DIR/dist"
NODE_MODULES_DIR="$PROJECT_DIR/node_modules"

PORT="${REPORT_SERVER_PORT:-5173}"
HOST="${REPORT_SERVER_HOST:-0.0.0.0}"
TAIL_LINES=80
FOLLOW=false

GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
DIM='\033[0;90m'
NC='\033[0m'

ok() { printf " ${GREEN}✓${NC} %b\n" "$*"; }
warn() { printf " ${YELLOW}!${NC} %b\n" "$*"; }
fail() { printf " ${RED}✗${NC} %b\n" "$*"; }
dim() { printf " ${DIM}%b${NC}\n" "$*"; }

require_node() {
  if ! command -v node >/dev/null 2>&1; then
    fail "未检测到 node"
    return 1
  fi
  local major
  major="$(node -v | sed 's/^v\([0-9]\+\).*/\1/')"
  if [[ "$major" -lt 18 ]]; then
    fail "Node 版本需 >= 18，当前: $(node -v)"
    return 1
  fi
  ok "Node.js $(node -v)"
}

require_npm() {
  if ! command -v npm >/dev/null 2>&1; then
    fail "未检测到 npm"
    return 1
  fi
  ok "npm $(npm -v)"
}

ensure_dirs() {
  mkdir -p "$LOG_DIR"
}

ensure_env_file() {
  if [[ ! -f "$PROJECT_DIR/.env" && -f "$PROJECT_DIR/.env.example" ]]; then
    cp "$PROJECT_DIR/.env.example" "$PROJECT_DIR/.env"
    warn "未找到 .env，已从 .env.example 生成默认文件"
  fi
}

install_deps_if_needed() {
  cd "$PROJECT_DIR"
  if [[ ! -d "$NODE_MODULES_DIR" ]]; then
    warn "node_modules 不存在，开始安装依赖"
    npm install
    ok "依赖安装完成"
    return 0
  fi
  ok "依赖已存在，跳过安装"
}

do_git_pull() {
  cd "$PROJECT_DIR"
  if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    warn "当前目录不是 Git 仓库，跳过 git pull"
    return 0
  fi
  if git pull --ff-only >/dev/null 2>&1; then
    ok "已执行 git pull --ff-only"
  else
    warn "git pull 失败，继续使用本地代码"
  fi
}

do_build() {
  cd "$PROJECT_DIR"
  npm run build
  if [[ ! -d "$DIST_DIR" ]]; then
    fail "构建失败：dist 不存在"
    return 1
  fi
  local size
  size="$(du -sh "$DIST_DIR" | awk '{print $1}')"
  ok "构建完成 (dist: $size)"
}

is_running() {
  [[ -f "$PID_FILE" ]] || return 1
  local pid
  pid="$(cat "$PID_FILE" 2>/dev/null || true)"
  [[ -n "$pid" ]] || return 1
  kill -0 "$pid" >/dev/null 2>&1 && return 0
  rm -f "$PID_FILE"
  return 1
}

get_pid() {
  cat "$PID_FILE" 2>/dev/null || true
}

pids_on_port() {
  local target_port="$1"
  if command -v lsof >/dev/null 2>&1; then
    lsof -ti "tcp:${target_port}" 2>/dev/null || true
    return
  fi
  if command -v ss >/dev/null 2>&1; then
    ss -ltnp 2>/dev/null | awk -v p=":${target_port}" '$4 ~ p {print $NF}' | sed -n 's/.*pid=\([0-9]\+\).*/\1/p' || true
  fi
}

free_port() {
  local target_port="$1"
  local pids
  pids="$(pids_on_port "$target_port")"
  [[ -z "$pids" ]] && return 0
  warn "端口 ${target_port} 被占用，尝试释放"
  echo "$pids" | xargs kill >/dev/null 2>&1 || true
  sleep 1
  pids="$(pids_on_port "$target_port")"
  if [[ -n "$pids" ]]; then
    echo "$pids" | xargs kill -9 >/dev/null 2>&1 || true
    sleep 1
  fi
  pids="$(pids_on_port "$target_port")"
  if [[ -n "$pids" ]]; then
    fail "无法释放端口 ${target_port}"
    return 1
  fi
  ok "端口 ${target_port} 已释放"
}

stop_service() {
  if ! is_running; then
    free_port "$PORT" >/dev/null 2>&1 || true
    return 0
  fi
  local pid
  pid="$(get_pid)"
  kill -- "-${pid}" >/dev/null 2>&1 || kill "$pid" >/dev/null 2>&1 || true
  sleep 1
  if kill -0 "$pid" >/dev/null 2>&1; then
    kill -9 -- "-${pid}" >/dev/null 2>&1 || kill -9 "$pid" >/dev/null 2>&1 || true
  fi
  rm -f "$PID_FILE"
  free_port "$PORT" >/dev/null 2>&1 || true
}

start_service() {
  ensure_dirs
  free_port "$PORT"
  rm -f "$PID_FILE"
  cd "$PROJECT_DIR"
  nohup setsid env REPORT_SERVER_HOST="$HOST" REPORT_SERVER_PORT="$PORT" npm run start:prod >>"$LOG_FILE" 2>&1 < /dev/null &
  echo "$!" > "$PID_FILE"
  sleep 2
  if ! is_running; then
    fail "服务启动失败，请检查日志: $LOG_FILE"
    return 1
  fi
  ok "服务已启动，PID $(get_pid)"
}

wait_health() {
  local max_wait=30
  local elapsed=0
  while [[ "$elapsed" -lt "$max_wait" ]]; do
    if curl -sf "http://127.0.0.1:${PORT}/api/health" >/dev/null 2>&1; then
      ok "健康检查通过"
      return 0
    fi
    sleep 1
    elapsed=$((elapsed + 1))
  done
  warn "健康检查超时，请查看日志"
}

print_status() {
  local local_ip
  local_ip="$(hostname -I 2>/dev/null | awk '{print $1}')"
  [[ -z "$local_ip" ]] && local_ip="127.0.0.1"

  if is_running; then
    ok "服务状态：运行中"
    dim "PID: $(get_pid)"
    dim "本机访问: http://127.0.0.1:${PORT}"
    dim "局域网访问: http://${local_ip}:${PORT}"
    dim "健康检查: http://${local_ip}:${PORT}/api/health"
    dim "日志文件: $LOG_FILE"
  else
    warn "服务状态：未运行"
    dim "可执行: ./deploy.sh start"
  fi
}

cmd_init() {
  require_node
  require_npm
  ensure_env_file
  install_deps_if_needed
  ensure_dirs
  ok "初始化完成"
}

cmd_build() {
  require_node
  require_npm
  install_deps_if_needed
  do_build
}

cmd_start() {
  require_node
  require_npm
  if [[ ! -d "$DIST_DIR" ]]; then
    warn "dist 不存在，先构建"
    cmd_build
  fi
  start_service
  wait_health || true
  print_status
}

cmd_stop() {
  stop_service
  ok "服务已停止"
}

cmd_restart() {
  cmd_stop
  cmd_start
}

cmd_status() {
  print_status
}

cmd_logs() {
  ensure_dirs
  if [[ ! -f "$LOG_FILE" ]]; then
    warn "日志文件不存在: $LOG_FILE"
    return 0
  fi
  if [[ "$FOLLOW" == "true" ]]; then
    tail -n "$TAIL_LINES" -f "$LOG_FILE"
  else
    tail -n "$TAIL_LINES" "$LOG_FILE"
  fi
}

cmd_deploy() {
  do_git_pull
  cmd_init
  do_build
  stop_service
  start_service
  wait_health || true
  print_status
  ok "一键部署完成"
}

cmd_help() {
  cat <<EOF
用法: ./deploy.sh [command] [options]

命令:
  deploy      一键部署（默认）：pull -> install -> build -> restart
  init        初始化环境与依赖
  build       仅构建前端
  start       启动生产服务（静态站点 + 报告发布 API）
  stop        停止服务
  restart     重启服务
  status      查看状态
  logs        查看日志
  help        查看帮助

选项:
  --tail N        指定 logs 输出行数（默认: ${TAIL_LINES}）
  -f, --follow    持续跟随日志输出
EOF
}

COMMAND="${1:-deploy}"
shift 2>/dev/null || true

while [[ $# -gt 0 ]]; do
  case "$1" in
    --tail) TAIL_LINES="$2"; shift 2 ;;
    --follow|-f) FOLLOW=true; shift ;;
    *) fail "未知参数: $1"; exit 1 ;;
  esac
done

case "$COMMAND" in
  deploy) cmd_deploy ;;
  init) cmd_init ;;
  build) cmd_build ;;
  start) cmd_start ;;
  stop) cmd_stop ;;
  restart) cmd_restart ;;
  status) cmd_status ;;
  logs) cmd_logs ;;
  help|--help|-h) cmd_help ;;
  *) fail "未知命令: $COMMAND"; cmd_help; exit 1 ;;
esac
