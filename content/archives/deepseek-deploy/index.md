---
categories:
- AI
date: '2025-02-04T15:46:06'
description: ''
draft: false
image: ''
slug: deepseek-deploy
tags:
- deepseek
- chatgpt
- 人工智能
title: 开源大模型deepseek本地部署
cover: /archives/deepseek-deploy/lr3v4j.png
---

## 前言

过年这几天实在是有点炸裂，deepseek 犹如石破天惊，搅动了全球

手机上也下载体验了下 deepseek 的问答，算是国内顶级人工智能了

这里本地部署采用 LM Studio + deepseek 模型的方式部署，期望进一步挖掘 deepseek 的潜力

## LM Studio部署

打开 LM Studio 的官网，下载 windows 的安装包 https://lmstudio.ai/ 

![](/archives/deepseek-deploy/lr3v4j.png)

安装后启动的界面如下

![](/archives/deepseek-deploy/ltbvwl.png)

## 模型下载

这时候启动的程序中，是还没有模型的，我们需要下载模型，然后在 LM 中进行加载

deepseek 的模型是保存在 huggingface 中的，github 上的模型下载地址也是指向 huggingface 的

打开 huggingface 官网的 deepseek 主页 https://huggingface.co/deepseek-ai 

从其提供的模型列表看有很多，最受欢迎的两个就是 DeepSeek-R1 和 DeepSeek-V3 

![](/archives/deepseek-deploy/lwkqb3.png)

LM Studio 中也集成了模型的管理，点击软件左边的放大镜 

![](/archives/deepseek-deploy/mhad6i.png)

在弹出窗口的输入框中，输入 deepseek 进行过滤

![](/archives/deepseek-deploy/n5rt97.png)

过滤出来的列表中，有很多 deepseek 提供的模型

列表上方显示的是 Best Match 的模型，下方显示的是所有模型，并显示了该模型的下载量

选中一个模型，然后点击右侧的 `4 download options available` 旁边的下拉箭头

![](/archives/deepseek-deploy/nnm763.png)

LM 能够通过你的硬件配置，适配合适的模型，勾选显示并且右边有一个拇指指示

对于不合适的模型则会提示 `可能对本机来说太大`

![](/archives/deepseek-deploy/nols3n.png)

Q3_K_L、Q4_K_M、Q6_K、Q8_0，是模型的量化配置，分别表示 3-bit，4-bit，6-bit，8-bit 的量化

其实也可以不需要关注，只要知道量化越大对配置的要求越高，表现的性能则越好

我的配置为集成显卡笔记本（无独立显卡），内存为 40G

![](/archives/deepseek-deploy/nx1lrq.png)

既然提示说推荐下载 32B 的 4-bit 量化模型，那么接下来尝试这个版本的模型进行部署

点击下载该模型，模型有 20G 大小

![](/archives/deepseek-deploy/o14wvj.png)

## 模型使用

经过漫长的等待之后，模型终于下载完毕了，点击加载模型，内存直接给干满了

从回答情况来看，是可以正常处理的，但是处理比较吃力，回答耗时达 31s 时长

![](/archives/deepseek-deploy/own62h.png)

![](/archives/deepseek-deploy/oxtr8w.png)

![](/archives/deepseek-deploy/ozmh06.png)

重新下载部署了 8B、14B 的模型，模型文件分别为 5G、9G 大小，相同问答分别耗时为 7s 和 13s

综合表现来看，集成显卡建议7B、8B的模型，独立显卡可以考虑 14B、32B 模型


