---
categories:
- 默认分类
date: '2024-11-25T16:33:13'
description: ''
draft: false
image: ''
slug: crontab
tags:
- linux
title: 定时任务crontab的使用
---

常用方式有以下几种

使用的时候特别要注意路径问题，脚本中的涉及的文件尽量使用全路径，不然可能导致运行时错误

```shell
*/1 * * * * /opt/log/disk_check.sh #每分钟执行一次
50 3 * * * /opt/log/disk_check.sh #每天3点50分执行一次
0 */1 * * * /opt/log/disk_check.sh #每小时0分执行一次（整点执行）
0 * * * * /opt/log/disk_check.sh #每小时0分执行一次（整点执行）
```

以下表示每分钟执行一次，小时时间表示每步进一个小时满足条件

分值时间表示任意时刻都可以，因此匹配为每分钟运行一次

```shell
* */1 * * * /opt/log/disk_check.sh 2>&1
```

几种符号的意义

`*` 任何时刻都可以

`,` 若有个多时刻，使用逗号分隔

`-` 表示一个时刻到另一个时刻之间的时间段

`/n` 表示每过n个时间定单位

crontab 从文本进行设置

也可以将 crontab 命令存入文本中，如 cron.txt 中，执行 crontab cron.txt 来进行配置

```shell
crontab <<EEEEE
*/1 * * * * /opt/log/disk_check.sh > /dev/null 2>&1
EEEEE
```
