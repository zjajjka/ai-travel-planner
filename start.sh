#!/bin/bash

# 启动后端服务
cd /app/backend
python app.py &
BACKEND_PID=$!

# 等待后端启动
sleep 5

# 启动nginx
nginx -g "daemon off;" &
NGINX_PID=$!

# 等待进程
wait $BACKEND_PID $NGINX_PID
