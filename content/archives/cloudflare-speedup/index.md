---
categories:
- 建站技能
date: '2025-07-13 19:11:24+08:00'
description: ''
draft: false
image: ''
slug: cloudflare-speedup
tags:
- cloudflare
- 域名管理
title: 加速访问基于hugo部署的静态博客站点
cover: /archives/cloudflare-speedup/vtnptd.png
---

## 前言

前几天使用 hugo 构建了博客，并部署到了 github pages 上，然后通过托管在 cloudflare 上的域名进行访问

在魔法加持的情况下，表现没有任何异常，但是关闭魔法后，访问域名就出现间歇性抽风，通过 itdog 测试 ping 延时的部分情况如下

国内大部分地区访问均出现严重丢包的情况，一些地区的 dns 解析直接被污染了（如下面的甘肃兰州）

![](/archives/cloudflare-speedup/vtnptd.png)

对于移动线路的访问，情况就更加严重了，请求全部都是失败的，看起来 github pages 在移动线路是被完全 block 掉了

![](/archives/cloudflare-speedup/fg4c7n.png)

## 迁移cloudflare

基于国内环境对 github 访问的严重破坏，考虑迁移到 cloudflare 的 pages 上来（当然 cloudflare 的默认访问也是被严重破坏的，迁移后再进一步优化）

登录 cloudflare 后，点击左侧的 `Workers and Pages` 菜单，然后点击导入现有的 Git 存储库，然后会提示需要 github 授权

![](/archives/cloudflare-speedup/fmx1wg.png)

在 github 授权 后，选择需要部署的存储库，点击开始设置

![](/archives/cloudflare-speedup/fqa9xe.png)

在构建设置中的框架预设中选择 `Hugo`，其他配置保留默认就可以，然后点击保存与部署   

![](/archives/cloudflare-speedup/fr5fnn.png)

接着 cloudflare 就开始进行构建部署了，稍等片刻即可完成站点部署到全球网络

![](/archives/cloudflare-speedup/ftyfhm.png)

在 cloudflare 部署完成之后，在自定义域中进行域名的绑定，绑定时 cloudflare 会自动将旧的域名指向删除

同时还需要手动到 github 的 pages 中将之前建立的站点进行 unpublish 掉，待 cloudflare 域名重新生效后，即可以访问站点了

![](/archives/cloudflare-speedup/gozvey.png)

在迁移到 cloudflare pages 后，如果不做优化，访问体验也是极其糟糕的，下面是 ping 测试的部分情况，可见丢包也是非常严重

未经过优选的 cloudflare 分配的不一定是最优的线路，也可能分配的一些 ip 地址是已经被 gfw 或者运营商给 block 掉了的

![](/archives/cloudflare-speedup/vnlwax.png)

## 优化原理

优选的主要原理就是就是利用大厂完善的优化线路，以下是针对后面说的阿里云配置的情况进行完整描述

1、用户浏览器发起访问 `www.xqc7.com` 请求，用户向本地递归 DNS 请求 www 子域名的解析

2、`xqc7.com` 所有权归属 cloudflare，是域名的权威 DNS，并且已委托了 www，因此 cloudflare 告诉递归 DNS，www 子域名解析权已委托给阿里云，请找阿里云解析

3、经阿里云 DNS 查询返回 `www.csgo.com`（或 `www.visa.com`），用户实际上是向该 CNAME 域名发起了请求

4、`www.csgo.com` 是 cloudflare 的商业用户，拥有比免费用户更好的线路，请求实际上是被发送到了经过优选后线路较好的 cloudflare ip 上

5、cloudflare 的 ip 收到访问请求, 会检查域名 `www.xqc7.com` 在 cloudflare 中是否有匹配的记录，如果有就将请求回源到设置的服务器上

6、`www.xqc7.com` 在 cloudflare 中配置了 pages 站点，最终 cloudflare 返回来 pages 的站点内容

## 优选配置

### Pages已启用

首先需要保证在前面的操作中，域名是能够正常解析的，自定义域中是处于活动状态，由于阻断原因，在国内浏览器不一定能正常访问

![](/archives/cloudflare-speedup/iz3fph.png)

### 子域名托管

将 www 子域名托管到阿里云，或者国内其他域名商托管也可以

在阿里云的域名管理中添加站点的域名，添加的时候会提示先进行TXT授权校验，点击 `TXT授权校验` 查看记录信息，在 cloudflare 对该域名添加一条 TXT 记录值

在 cloudflare 中添加 TXT 记录值后，回到阿里云进行校验，校验通过后提示域名 DNS 信息未查询到，这时候还需要添加两条 NS 记录值到 cloudflare 中

![](/archives/cloudflare-speedup/j35jmd.png)

![](/archives/cloudflare-speedup/j0rfec.png) 

![](/archives/cloudflare-speedup/jy91tv.png)

添加完毕后，在 cloudflare 中就会有以下的记录，一条在自定义域时添加的 CNAME 记录，一条 TXT 记录，两条 NS 记录

![](/archives/cloudflare-speedup/k0ntmz.png)

这时候，在阿里云中查看的记录是处于正常状态

![](/archives/cloudflare-speedup/lknyg2.png)

### 添加解析

上面已经在阿里云添加了 www 域名的托管，现在还差最后一步，为 www 添加优选解析，可以添加 A 记录的优选 ip，也可以添加 CNAME 记录的优选域名

优选域名以及优选 ip 可以在网上搜索，比如我这里设置的 `www.csgo.com` 和 `www.visa.com`，记录类型选 CNNAME，主机记录填 `@`

![](/archives/cloudflare-speedup/no5t1h.png)

添加记录后，阿里云上面记录状态显示为启用 

![](/archives/cloudflare-speedup/dvty26.png)

### 解析测试

添加优选域名解析要一段时间才能生效，待解析生效后，本地 ping 显示已经有 csgo 以及 visa 的解析，延时在 200ms 以内

![](/archives/cloudflare-speedup/dqgd6h.png)

在 itdog 上的 ping 测试显示一片淡绿色，相比未优选前已经大为改善，浏览器直接请求站点域名也能正常响应了

![](/archives/cloudflare-speedup/drkqg9.png)

## 回退源配置

除了上面 `阿里云 + cloudflare` 的方式进行加速外，也可以在 cloudflare 中通过双域名，使用回退源的方式进行加速

### tunnel建立

这里设置将 `tools.xqc7.com` 进行访问优化，这是一个使用 tunnel 穿透访问的站点，使用另外一个 `tools.qc7.top` 作为回退源

首先在 cloudflare 中添加两个 tunnel，建立 tunnel 的时候，`tools.qc7.top` 可以和 `tools.xqc7.com` 指向一致

在 `tools.xqc7.com` 的 tunnel 搭建完毕后，应该能否是可以正常访问的

![](/archives/cloudflare-speedup/nrsmo1.png)

### 配置优选域名

对 `qc7.top` 添加一条值为 js 的 CNAME 记录，优选域名指向 `www.visa.cn`，这里要把小黄云代理关闭掉，其中 tools 域名是前面建立的 tunnel 域名

![](/archives/cloudflare-speedup/oudzh9.png)

### 添加回退源

在 `qc7.top` 域名的 `自定义主机` 页面中新增一个 `tools.qc7.top` 作为回退源，添加回退源前需要先绑定支付方式并启用 `cloudflar for SaaS`

启用 `cloudflar for SaaS` 是免费的，只要是不超出免费额度（100个自定义主机）都是不需要付钱的

![](/archives/cloudflare-speedup/nu1z1z.png)

![](/archives/cloudflare-speedup/oyjop5.png)

![](/archives/cloudflare-speedup/nkg2s7.png)

添加回退源并在回退源生效后，再添加一条自定义主机 `tools.xqc7.com`，并将下面的信息添加到域名解析 TXT 记录

另外还需要增加一条 CNAME 记录进行 DCV 委派，以便进行自动证书颁发和续订  

![](/archives/cloudflare-speedup/p7gul2.png)

最终，域名解析中新增的三条 DNS 记录如下，其中第一条 CNAME 是证书颁发和续订的，第二条是自定义主机的

第三条是前面建立 tunnel 的记录，这里把它的值改为指向加速的 `js.qc7.top`

![](/archives/cloudflare-speedup/poblss.png)

## 后记

优选域名以及回退源配置，之前没接触过，也是最近几天才接触到，我这里的方式也是按照网络上别人的方式进行配置，似乎能正常工作

整个逻辑我也并没有完全理解，文中有些描述可能是错误的，后续如果有新的理解再行更新