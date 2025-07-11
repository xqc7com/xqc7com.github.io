---
categories:
- 建站技能
date: '2025-02-15T15:21:47'
description: ''
draft: false
image: ''
slug: server-monitor
tags:
- server
- monitor
title: 服务器增加健康监控检查
---

以部署 halo 为例，增加 start、stop、restart、monitor 脚本，并且 crontab 增加定时检查

`start.sh` 脚本 

```shell
#!/bin/bash

SHELL=/bin/bash

nohup java -Dfile.encoding=UTF-8 -jar halo.jar --spring.config.additional-location=optional:file:/root/halo/ --debug >/dev/null 2>&1 & 
```

`stop.sh` 脚本 
```shell
#!/bin/bash

SHELL=/bin/bash

ps aux | grep halo | grep -v grep | awk '{print $2}' | xargs -r kill -9
```

`restart.sh` 脚本
```shell
#!/bin/bash

SHELL=/bin/bash

echo "restart app, now stop ..."
./stop.sh

sleep 1

echo "restart app, now start ..."
./start.sh
```

`monitor.sh` 脚本

```shell
#!/bin/bash

SHELL=/bin/bash

cnt=`ps -ef|grep halo|grep -v grep|grep -v monitor|grep -v log|wc -l`
echo `date`"   cnt:$cnt"

if [ "$cnt" == "0" ]; then
    echo "check is unnormal ..."
    cd /root/halo/ && ./restart.sh 
fi

find /root/halo/logs/ -mtime +7 -exec rm -rf {} \;
```

crontab 增加定时任务 
```shell
* * * * * /root/halo/monitor.sh >> /root/halo/monitor.log 
```
