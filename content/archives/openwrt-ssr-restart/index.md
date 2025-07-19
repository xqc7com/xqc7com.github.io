---
categories:
- 默认分类
date: '2025-07-19 16:13:24+08:00'
description: ''
draft: false
image: ''
slug: openwrt-ssr-restart
tags:
- 其他
title: 基于悬浮球快速启停ssr进程
---

## 前言

路由器安装了 openwrt 并启用了 ssr 实现了分流，但是由于插件或者 ip 库存在一些问题，导致部分流量并没有按预期的走，这引发了很多不必要的麻烦

插件的代码逻辑，短时间内也没精力去研究怎么优化，只能暂时通过手动 start、stop 规避，而且在路由器的 web 管理页面，发现只能开启而不能停止

然后为了停止插件，还必须得登录路由器的终端，手动去运行命令实现停止，即便在 web 页面上可以 stop，每次登录 web 去停止是一件极其麻烦的事

因此，编写了一个小工具实现手动 start/stop 路由器的 ssr 插件，在 windows 本地运行一个悬浮小球，类型于 360 加速小球这种

在路由器运行一个 lua 脚本，提供一个启停 ssr 的接口，本地悬浮小球实时显示路由器 ssr 插件的运行状态，根据运行状态显示红色/绿色

悬浮球具备一些简单的功能，可以左键拖动，常驻所有窗口顶层，右键弹出菜单，点击菜单可以实现对路由器 ssr 插件的启动停止，以及退出悬浮球小工具

## 服务端

在路由器的 `/www/cgi-bin/` 路径下增加一个 agent 脚本，并 `chmod +x` 授权，脚本的完整代码如下

增加脚本后，默认就可以在浏览器中进行请问访问，这和 nginx 增加页面是类似的，不需要重启 uhttpd 服务

```lua
#!/usr/bin/lua

local PROCESS_NAME = "ssrplus"
local START_CMD = "/etc/init.d/shadowsocksr start &"
local STOP_CMD = "/etc/init.d/shadowsocksr stop &"

local request_uri = os.getenv("REQUEST_URI") or ""

io.write("Content-Type: text/plain\n\n")

if request_uri:find("/start") then
    os.execute(START_CMD)
    io.write("Started")
elseif request_uri:find("/stop") then
    os.execute(STOP_CMD)
    io.write("Stopped")
elseif request_uri:find("/status") then
    local handle = io.popen("pgrep " .. PROCESS_NAME)
    local result = handle:read("*a")
    handle:close()
    if result ~= "" then
        io.write("Running")
    else
        io.write("Stopped")
    end
else
    io.write("Unknown Command")
end
```

## 悬浮小球

在本地 windows 使用 python 脚本实现悬浮小球的逻辑，右键菜单进行开启/停止路由器的 ssr 进程，完整代码如下

```python
import sys
import requests
from PySide6.QtWidgets import QApplication, QMenu, QWidget
from PySide6.QtCore import Qt, QTimer, QPoint
from PySide6.QtGui import QColor, QPainter, QBrush

AGENT_URL = "http://192.168.1.1/cgi-bin/agent"

class FloatingBall(QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowFlags(Qt.FramelessWindowHint | Qt.WindowStaysOnTopHint | Qt.Tool)
        self.setAttribute(Qt.WA_TranslucentBackground)
        self.resize(80, 80)

        # Set position to top-right corner using primaryScreen
        screen = QApplication.primaryScreen().geometry()
        self.move(screen.width() - self.width() - 50, 50)

        self.timer = QTimer(self)
        self.timer.timeout.connect(self.check_status)
        self.timer.start(3000)

        self.is_running = False
        self.moving = False
        self.offset = QPoint()
        self.check_status()

        # Create context menu
        self.context_menu = QMenu(self)
        self.start_action = self.context_menu.addAction("开启")
        self.stop_action = self.context_menu.addAction("停止")
        self.exit_action = self.context_menu.addAction("退出")
        
        # Connect menu actions
        self.start_action.triggered.connect(self.start_process)
        self.stop_action.triggered.connect(self.stop_process)
        self.exit_action.triggered.connect(self.close_application)

    def paintEvent(self, event):
        painter = QPainter(self)
        painter.setRenderHint(QPainter.Antialiasing)
        color = QColor(0, 255, 0, 180) if self.is_running else QColor(255, 0, 0, 180)
        painter.setBrush(QBrush(color))
        painter.setPen(Qt.NoPen)
        painter.drawEllipse(0, 0, self.width(), self.height())

    def mousePressEvent(self, event):
        if event.button() == Qt.LeftButton:
            self.moving = True
            self.offset = event.globalPosition().toPoint() - self.pos()
        elif event.button() == Qt.RightButton:
            self.start_action.setEnabled(not self.is_running)
            self.stop_action.setEnabled(self.is_running)
            self.context_menu.exec(event.globalPosition().toPoint())

    def mouseMoveEvent(self, event):
        if self.moving:
            self.move(event.globalPosition().toPoint() - self.offset)

    def mouseReleaseEvent(self, event):
        if event.button() == Qt.LeftButton:
            self.moving = False

    def check_status(self):
        try:
            resp = requests.get(AGENT_URL + "/status", timeout=1)
            self.is_running = (resp.text.strip() == "Running")
            self.update()
        except:
            self.is_running = False
            self.update()

    def start_process(self):
        try:
            requests.get(AGENT_URL + "/start", timeout=1)
            QTimer.singleShot(500, self.check_status)
        except:
            pass

    def stop_process(self):
        try:
            requests.get(AGENT_URL + "/stop", timeout=1)
            QTimer.singleShot(500, self.check_status)
        except:
            pass

    def close_application(self):
        QApplication.quit()

if __name__ == "__main__":
    app = QApplication(sys.argv)
    ball = FloatingBall()
    ball.show()
    sys.exit(app.exec())
```

## 打包发布

为了将 python 代码打包为 exe 执行文件，需要安装 `pip install pyinstaller` 组件

然后运行以下命令，将悬浮球小工具打包为 fallball.exe 可执行文件

```shell
pyinstaller --clean --noconfirm --onefile --windowed --name floatball main.py
```