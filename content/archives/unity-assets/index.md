---
categories:
- 默认分类
date: '2025-09-12 15:59:24+08:00'
description: ''
draft: false
image: ''
slug: unity-assets
cover: /archives/unity-assets/m2f4l4.png
tags:
- unity
title: 本地怎么使用unity官网的资源
---

资源已经购买添加到个人的名下，在我的资源中点击 “在Unity中打开” 无法启动 unity hub 打开项目

![](/archives/unity-assets/m2f4l4.png)


浏览器中输入 “unityhub://” 可以正常唤起 Unity Hub ，点击  “在Unity中打开”  在网络请求中提示错误如下 

显示为请求了一个 com.unity3d.kharma:content/195698 地址，然后出现 “（已取消）” 的状态 

com.unity3d.kharma:// 似乎是一个 Unity 旧的资源商店 (Asset Store) 协议 ，新的协议应该是 unityhub://

![](/archives/unity-assets/o9c1f9.png)

将请求修改为 unityhub://content/195698，然后直接在浏览器中打开，弹出 Unity Hub 后，显示一个错误如下，似乎编辑器版本的问题？

估计是待打开项目的编辑器版本比较旧，而我本地安装的编辑器版本比较新，然后由于编辑器版本不兼容导致的错误？

![](/archives/unity-assets/jsz1i2.png)

尝试换另外一种方式，通过直接下载资源然后在项目中导入进行使用

在 unity 编辑器中，通过 ctrl + 0 打开 Package Manager，然后在 My Assets 中选中需要下载的项目，点击右侧的 Download

![](/archives/unity-assets/6ps9ox.png)

因为资源已经添加到个人资产当中，因此这里的列表是可以正常显示出来的，点击下载后将资源下载到本地

![](/archives/unity-assets/8uwop2.png)

下载项目后，在本地新建一个项目，新建项目的渲染管线需要和 web 页面上的渲染管线一致，unity的项目页面上显示只支持 Built-In 渲染管线

![](/archives/unity-assets/cab9uj.png)

所以新建的时候，选择 3D (Built-In Render Pipeline)，然后创建项目，这个模板如果没下载的话，需要先下载才能进行选择

![](/archives/unity-assets/ub9yim.png)

新建项目后，在 Assets 菜单下，将刚刚下载的 “Party Monster Duo Polyart PBR.unitypackage” 资源包进行导入

![](/archives/unity-assets/e27ycr.png)

在导入页面，默认会选中所有的资源项，点击 Import 然后将资源导入到当前的工程当中，然后在当前工程中，拖入一个 Prefab 预制体 C01 到场景中，可以正常

![](/archives/unity-assets/i9oled.png)