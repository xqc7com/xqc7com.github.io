---
categories:
- 默认分类
date: '2025-03-02T17:20:21'
description: ''
draft: false
image: ''
slug: ubuntu-hanging
tags:
- ubuntu
title: ubuntu节点卡死问题分析
cover: /archives/ubuntu-hanging/ikpcad.png
---

最近几天，ubuntu 节点每天都出现 cpu 过载的情况，从监控上看是 apt-check 导致的

![](/archives/ubuntu-hanging/ikpcad.png)

![](/archives/ubuntu-hanging/ip07t2.png)

ubuntu 有两个 timer： apt-daily.timer 和 apt-daily-upgrade.timer，会不定时自动检查更新和下载

终端 ssh 登录 ubuntu 节点，手动运行 `apt update`，终端直接卡死了

搜索了下，有说删掉 /etc/apt/source.list.d 目录和 `apt clean` 后就正常了，但是操作 `apt update` 还是一样卡死

谷歌提示说，APT在执行时会产生锁，如果上次的update，或者软件安装等操作异常退出，可能会导致锁无法释放

手工删除以下的锁和定时任务

```shell
rm -rf /var/lib/apt/lists/lock
rm -rf /var/cache/apt/archives/lock
rm -rf /var/lib/dpkg/lock
rm -rf /var/lib/dpkg/lock-frontend

rm -rf /var/lib/apt/lists/*
rm -rf /var/lib/dpkg/lock*

rm -rf /etc/cron.daily/apt
rm -rf /etc/cron.daily/apt-compat
```

再执行清除 

```shell
apt clean
apt autoclean
```

并通过下面这两个命令查看还有哪些服务，将这些服务全部禁用

`systemctl list-unit-files | grep apt` 和 `systemctl list-unit-files | grep unattended`

![20250401085516](/archives/ubuntu-hanging/e563i5.png)

```shell
sudo systemctl disable --now apt-news.service 
sudo systemctl disable --now apt-daily.service
sudo systemctl disable --now apt-daily-upgrade.service
sudo systemctl disable --now apt-daily.timer
sudo systemctl disable --now apt-daily-upgrade.timer
sudo systemctl disable --now unattended-upgrades
sudo systemctl disable --now packagekit.service
sudo systemctl disable --now motd-news.service

sudo systemctl mask apt-news.service 
sudo systemctl mask apt-daily.service
sudo systemctl mask apt-daily-upgrade.service
sudo systemctl mask apt-daily.timer
sudo systemctl mask apt-daily-upgrade.timer
sudo systemctl mask unattended-upgrades
sudo systemctl mask packagekit.service
sudo systemctl mask motd-news.service
```

删除 packagekit 服务 `sudo apt remove --purge packagekit`

修改 `/etc/apt/apt.conf.d/20auto-upgrades` 文件内容为

```shell
APT::Periodic::Update-Package-Lists "0";
APT::Periodic::Unattended-Upgrade "0";
```

将 `/etc/default/motd-news` 文件的 `ENABLED=1` 改为 `ENABLED=0`

彻底阻止 apt 自动更新 

```shell
echo 'APT::Periodic::Enable "0";' | sudo tee /etc/apt/apt.conf.d/99disable-auto-update
```

配置后，系统将不会再自动执行 `apt-get update`，只有手动运行 `sudo apt-get update` 时才会检查更新
