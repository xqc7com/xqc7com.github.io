---
categories:
- 默认分类
date: '2025-01-13T11:08:00'
description: ''
draft: false
image: ''
slug: mysql-trouble
tags:
- mysql
title: 连接mysql错误问题处理
cover: /archives/mysql-trouble/20250113102616607.png
---

## 问题原因

机器上安装了 mysql，需要从另外一台机器连接到 mysql 服务

在连接的时候提示错误如下

![](/archives/mysql-trouble/20250113102616607.png)

出现这个错误的原因，是 mysql 服务没有开启对外部机器的访问权限

## 问题处理

这里以 windows 下的 mysql 为例，在 mysql 的安装机器下，定位到 mysql 的安装路径

输入 cmd 打开命令行终端

![](/archives/mysql-trouble/20250113103059608.png)

在命令行终端中，输入以下命令，然后输入密码进行 mysql 登录

```
mysql -u root -p
```
登录 mysql 后，进入的终端窗口如下

![](/archives/mysql-trouble/20250113103635207.png)

进入 mysql 数据库，并查看 root 用户的配置主机，当前默认只能 localhost 进行连接

```
use mysql;
 
select host from user where user='root';

```

![](/archives/mysql-trouble/20250113104309850.png)


修改为 % 表示允许外部主机连接当前 mysql，修改后查看修改结果 
```
update user set host = '%' where user ='root';
```

![](/archives/mysql-trouble/20250113104628523.png)

确认修改完毕后，进行 flush 保存操作

另外可能还需要修改 mysql 机器的实际 ip 地址，linux 配置在 /etc/mysql/mysql.conf.d/mysqld.cnf 下的 bind-address 配置

```
flush privileges;
```
![](/archives/mysql-trouble/20250113104858018.png)

## 连接 mysql 

再次从外部主机连接 mysql ，现在就可以正常连接了

![](/archives/mysql-trouble/20250113105814196.png)
