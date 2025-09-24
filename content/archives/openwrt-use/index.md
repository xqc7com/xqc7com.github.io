---
categories:
- 默认分类
date: '2025-09-24 09:13:24+08:00'
description: ''
draft: false
image: ''
slug: openwrt-use
cover: /archives/openwrt-use/117f9y.png
tags:
- openwrt
title: 路由器刷机ImmortalWrt的使用
---
## 存在问题

基于国内的现状，在路由器上进行刷机，使用 openwrt 的 ImmortalWrt 分支，路由器刷机参考 [这里](https://www.cnblogs.com/Yuan2036/articles/17589915.html)

在路由器中进行代理后，比原来的 pc 端启动客户端进行代理的方式相比有很大的优势，但是依旧存在很多的问题

1、页面上没有找到对 ssr 进行 stop 的按钮，只能终端登录命令进行 stop，即便页面可以 stop，每次登录很麻烦，[这里](https://www.xqc7.com/archives/openwrt-ssr-restart/) 进行了优化 

2、ip 地址库的更新问题，导致访问部分站点的时候，本地公网地址一会变国内，一会变国外，这同样带来了很多问题

3、访问控制这里的设置似乎成了摆设的，设置后并没有生效，软件的bug？还是和上面的 ip 地址是同一类问题？

![](/archives/openwrt-use/117f9y.png)

## 配置ssr

在路由器安装 ImmortalWrt 后，通过 web 页面登录路由器，默认安装了多款代理软件，可以选择使用熟悉的代理工具，这里以 ssr 为例

在 `订阅URL` 中输入服务商提供的 url 地址，点击下方的 `更新订阅 URL 列表`，然后在下方的列表中选中一个耗时较小的节点进行应用

香港已经过上和我们一样的幸福生活，因此香港的节点在访问部分站点，特别是使用 chatgpt 的时候可能受限制，建议优先选择亚洲其他发达地区的节点

![](/archives/openwrt-use/umxp8n.png)

![](/archives/openwrt-use/ybs2ec.png)

回到客户端标签页下，这里的运行模式有多种模式，有 `GFW 列表模式`、`绕过中国大陆 IP 模式`、`全局模式`、`海外用户回国模式`

`GFW 列表模式` 有一张记录被墙的 ip 地址列表，所有对这些地址的请求全部走代理

`绕过中国大陆 IP 模式` 有一张记录所有大陆的 ip 地址列表（主要是网段），对这些表以外地址的所有请求全部走代理

`全局模式` 表示所有流量全部走代理

`海外用户回国模式` 表示海外的用户访问大陆站点的时候，部分大陆站点对海外进行了屏蔽限制访问，这个模式国内用户用不到

![](/archives/openwrt-use/7fr978.png)

从运行模式看，ip 地址列表的更新十分重要，在状态标签页下可以更新这两个 ip 地址列表

![](/archives/openwrt-use/310u34.png)

而这两个数据库列表的更新源是在高级设置中的页签下面进行设定的，这两个数据库列表也可以进行自定义

![](/archives/openwrt-use/uszb5b.png)

## 代码结构

通过 ssh 终端登录进行命令行配置，终端登录的用户密码和 web 登录的用户密码一致

LuCI 是 lua 和 UCI（openwrt的统一配置接口）的结合体，LuCI 的 github 地址在 `https://github.com/openwrt/luci`

ImmortalWrt 的 Web 管理页面 LuCI 是通过 `/usr/sbin/uhttpd` 提供的网页服务，站点路径在 `/www` 目录下

uhttpd 是一个 web 容器，类似于 nginx，它的配置在 `/etc/config/uhttpd`，启停 ssr 使用命令 `/etc/init.d/shadowsocksr start/stop` 进行

LuCI 采用了 MVC 三层架构，在系统的 `/usr/lib/lua/luci/` 下有三个目录 model、 view、 controller，分别对应 M、V、 C

涉及 ssr 的主要组件如下，这里的代码只是 web 维护相关的代码，不涉及 ssr 代理软件的核心代码

![](/archives/openwrt-use/a9ez11.png)

### 更新代码逻辑

web 后台的页面入口在 control 下的 `/usr/lib/lua/luci/controller/shadowsocksr.lua` 指示了 url 对应的页面代码

如以下指示了 `services/shadowsocksr/client` 这个 url 对应的页面在 `/usr/lib/lua/luci/model/cbi/` 下的 `shadowsocksr/client.lua`

```lua
entry({"admin", "services", "shadowsocksr", "client"}, cbi("shadowsocksr/client"), _("SSR Client"), 10).leaf = true	
```

这里的 CBI (Config Binding Interface) 是 OpenWrt LuCI 的配置管理组件，代码目录在 `/usr/lib/lua/luci/model/cbi` 下

页面上显示的一个服务组件对应 cbi 目录下的一个目录，如 shadowsocksr 目录

该 shadowsocksr 目录下的每个 lua 文件对应一个标签页面，其中 xxx-config.lua 的是对应 cbi 的配置，如这里的 status 页面对应 status.lua 代码

![](/archives/openwrt-use/zp4a2d.png)

![](/archives/openwrt-use/7n9hra.png)

点击 `【GFW 列表】数据库` 的按钮 `更新数据库` 的时候，对地址 `cgi-bin/luci/admin/services/shadowsocksr/refresh` 发起了一个 get 请求 

![](/archives/openwrt-use/d5wtvd.png)

根据前面可以知道该请求地址是由 `/usr/lib/lua/luci/controller/shadowsocksr.lua` 进行处理的

而 shadowsocksr.lua 文件的部分代码如下，指示了该 refresh 请求由 refresh_data 函数处理，最终通过 `/usr/share/shadowsocksr/update.lua` 进行响应

```lua
function index()
        if not nixio.fs.access("/etc/config/shadowsocksr") then
                call("act_reset")
        end

        entry({"admin", "services", "shadowsocksr", "refresh"}, call("refresh_data"))

end

function refresh_data()
        local set = luci.http.formvalue("set")
        local retstring = loadstring("return " .. luci.sys.exec("/usr/bin/lua /usr/share/shadowsocksr/update.lua " .. set))()
        luci.http.prepare_content("application/json")
        luci.http.write_json(retstring)
end

```

高级设置中的页面源码 `/usr/lib/lua/luci/model/cbi/shadowsocksr/` 指示了两个数据库的来源为如下

```lua

o = s:option(Value, "gfwlist_url", translate("gfwlist Update url"))
o:value("https://fastly.jsdelivr.net/gh/YW5vbnltb3Vz/domain-list-community@release/gfwlist.txt", translate("v2fly/domain-list-community"))
o:value("https://fastly.jsdelivr.net/gh/Loyalsoldier/v2ray-rules-dat@release/gfw.txt", translate("Loyalsoldier/v2ray-rules-dat"))
o:value("https://fastly.jsdelivr.net/gh/Loukky/gfwlist-by-loukky/gfwlist.txt", translate("Loukky/gfwlist-by-loukky"))
o:value("https://fastly.jsdelivr.net/gh/gfwlist/gfwlist/gfwlist.txt", translate("gfwlist/gfwlist"))
o.default = "https://fastly.jsdelivr.net/gh/YW5vbnltb3Vz/domain-list-community@release/gfwlist.txt"

o = s:option(Value, "chnroute_url", translate("Chnroute Update url"))
o:value("https://ispip.clang.cn/all_cn.txt", translate("Clang.CN"))
o:value("https://ispip.clang.cn/all_cn_cidr.txt", translate("Clang.CN.CIDR"))
o.default = "https://ispip.clang.cn/all_cn.txt"

```


### gfwlist逻辑

上述的 gfwlist 文件是 base64 文件，同步自 https://github.com/gfwlist/gfwlist 主仓库，主仓库一直都是有人在维护的 

![](/archives/openwrt-use/2gqri2.png)

解压后部分配置如下 

```shell
[AutoProxy 0.2.9]
! Checksum: uhrh88bkOU+xVXRYjf5leQ
! Expires: 6h
! Title: GFWList4LL
! GFWList with EVERYTHING included
! Last Modified: Tue, 23 Sep 2025 02:23:14 +0000
!
! HomePage: https://github.com/gfwlist/gfwlist
! License: https://www.gnu.org/licenses/old-licenses/lgpl-2.1.txt
!
! GFWList is unlikely to fully comprise the real
! rules being deployed inside GFW system. We try
! our best to keep the list up to date. Please
! contact us regarding URL submission / removal,
! or suggestion / enhancement at issue tracker:
! https://github.com/gfwlist/gfwlist/issues/.

!---------403/451/503/520 & URL Redirects---------
||blogjav.net
||zoominfo.com
||ptwxz.com
||miuipolska.pl
||piaotia.com
||wunderground.com
||500px.com
||500px.org
!--ehentai
|http://85.17.73.31/
!--||adorama.com
||afreecatv.com
||agnesb.fr
||airitilibrary.com
||abematv.akamaized.net
||linear-abematv.akamaized.net
||vod-abematv.akamaized.net
||akiba-web.com
||altrec.com
```

默认本地是勾选了每天自动同步的，因此本地配置和主仓库的配置基本上是一致的

![](/archives/openwrt-use/966m0u.png)