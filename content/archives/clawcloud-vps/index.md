---
categories:
- 默认分类
date: '2025-07-19 08:58:24+08:00'
description: ''
draft: false
image: ''
slug: clawcloud-vps
tags:
- charles
title: clawcloud测评
cover: /archives/clawcloud-vps/f6524p.png
---


## 前言

最近准备入手一台海外的 vps，在网上了解了一下，一些人在推 claw cloud 的机器，总体评测还不错

考虑到国内的延时，然后就入手了一台香港的 claw vps，使用官方的优惠码，2C4G 的机器年付花了 48 刀，人民币 346，汇率 7.22

![](/archives/clawcloud-vps/f6524p.png)

结果给踩坑里去了，延时实在是太高了，考虑退款的，还得扣 10% 的手续费，什么事都没干就抽 10%，先留着吧，后面再看怎么利用起来

itdog ping测试如下，全部是橙黄色的，延时都在 300 以上，这是在早上低峰期 ping 的，网上高峰期 ping 的话接近 500

![](/archives/clawcloud-vps//e6hl72.png)

使用 opentrace 测试节点线路，发现是绕美国去了，然后再打道回日本，最后到达香港

![](/archives/clawcloud-vps//e3dbwq.png)

延时都不是最大的问题，最大的问题是掉包严重，部分地区访问掉包率超过了 10%，网上高峰期掉包更加严重

![](/archives/clawcloud-vps//e5sz4z.png)


## 问题原因

那么这么近为什么不直接走，而是非得绕一圈？300 到 500 的延时，终端敲命令都是一卡一卡的，看看 gpt 的回复

![](/archives/clawcloud-vps//fofjzy.png)


## 处理方式

如果需要提速只能中转了，有一些组织或者个人可以提供中转服务，将速度提升到 100 以内

如果自己手头有耗时低的海外节点，也可以用来进行流量中转，刚好手头也有其他服务商的海外节点，国内到节点的耗时在 50ms 以内

那么可以通过 nginx 等一些方式将流量进行中转，中转节点到 claw 主机的 ping 延时在 5 ms 以内，那么总耗时就可以控制在 50 ms 左右

但是这样会有一个问题，中转节点的流量不能过大避免超额，另外不排除这样的中转方式有可能会被其他服务商拉清单

![](/archives/clawcloud-vps//fteimi.png)


## 购买建议

1、不支持新购短期内全额退款的尽量不要买，不敢承诺全额退款的肯定有猫腻

2、不要太过相信网上的一些测评，基本上都是拿钱了的

3、看别人的测评，得仔细看后面别人的评论