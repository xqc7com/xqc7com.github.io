---
categories:
- 默认分类
date: '2024-12-30T14:10:00'
description: ''
draft: false
image: ''
slug: login-ssh-without-password
tags:
- linux
title: 终端ssh免密码登录
---

## 单台机器配置免密码登录

需要 A 通过 ssh 免密码登录到 B，假设 A、B 机器的账户都是 root，生成公私钥的命令为 ssh-keygen，主要参数有

-t 指示生成的密钥类型，主要的密钥类型有 dsa、ecdsa、ecdsa-sk、ed25519、ed25519-sk、rsa

-P 表示密码，-P '' 就表示空密码，也可以用 -N 参数，和 -P 参数是一样的意思，不用该参数可以交互输入密码

-C：额外注释，可以填写用户名/邮箱等

-b：指定密钥的长度位数，不指定的话默认 2048 bits

-f 参数指定输出的公私钥文件名，如果不指定的话默认输出在 /root/.ssh/ 目录下

在 A 机器生成公私钥对（在用户的 home 目录下下生成 .ssh 目录，.ssh 下有 id_rsa 和 id_rsa.pub ）

```shell
ssh-keygen -t rsa -P ''
```

把 A 机下的 id_rsa.pub 导入到 B 机的 .ssh/authorized_keys 文件里，先使用 scp 将文件复制到 B 机下，

然后 cat 写入到对应文件，授权 authorized_keys 的权限要是 600

```shell
cat id_rsa.pub >> .ssh/authorized_keys
chmod 600 .ssh/authorized_keys
```

处理完之后，现在 A 机器可以执行 ssh root@X.X.X.X 免密登录 B 机器了，当然 A、B 机的账户相同的话，

ssh 的时候可以不填写用户名；设置数量不多的话也可以使用 ssh-copy-id，但是需要输入远端机器的登录密码

```shell
ssh-copy-id -i .ssh/id_rsa.pub root@$host -p 9220
```

## 批量配置免密码登录

如跳板机的情况，需要设置多台服务器进行免密码登录（密码存储在 /home/user/.pass 文件）

提供密码文件是避免执行 ssh-copy-id 的时候手工输入，脚本参数需要传入一个地址配置文件（文件为机器地址列表）

```shell
for host in $(cat ${1})
do
    sshpass -f /home/user/.pass ssh-copy-id -o StrictHostKeyChecking=no $host -p 9220 -f
done
```

拷贝文件到远端机器

```shell
host=192.168.1.165
procname=XXX
pscp.pssh -h $host -x "-P 9220" $procname /tmp
pssh -O StrictHostKeyChecking=no -t 0 -h $host -x "-p 9220" "cp /tmp/$procname /opt/server/"
pssh -O StrictHostKeyChecking=no -t 0 -h $host -x "-p 9220" "rm -rf /tmp/$procname"
```
