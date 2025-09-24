---
categories:
- 默认分类
date: '2025-09-24 15:59:24+08:00'
description: ''
draft: false
image: ''
slug: trojan-use
cover: /archives/trojan-use/mkpjgw.png
tags:
- trojan
title: 基于Trojan-Qt5的工具使用
---

这是以前写的笔记，现在已经不用 Trojan-Qt5 了，目前是在路由器刷了 openwrt 进行代理，不过这个也许对一些人可能会有帮助

## 导入代理配置 

运行程序后，页面中间主体显示是空白的，首先需要导入配置信息，该配置是从服务提供商处获取到的 

![](/archives/trojan-use/pbm4ny.png)

## 检测以及连接

导入配置后，需要检测导入的配置是否都是正常的，在程序主面板中右键菜单选择 “测试所有连接的延迟”

然后根据响应的时间快慢，选中一个耗时较少的记录，右键菜单中选择 “连接”（该记录没有连接的时候，“连接” 菜单是黑色可操作的）

由于防火墙是动态检测的，可能导致节点可能随时会被 block 掉，有需要的话可以重新检测下，换一个可用的节点进行连接

![](/archives/trojan-use/mkpjgw.png)

## 配置站点访问

程序中已经通过 gfwlist 配置了大部分被 block 的站点，详细记录在 `proxy.pac` 文件中

当有一些额外的站点被 block 的时候，而这个站点在默认中又是没有被配置的，就需要手工配置一下 

点击 “用户规则设置” ，根据提示增加站点信息，如下所示，然后点击 OK 保存（这时会将配置保存到 `pac\user-rule.txt` 文件中）

![](/archives/trojan-use/6v1z58.png)

添加完站点配置后，在任务栏中选中该进程的任务图标右键，在弹出的菜单中选择 “更新PAC为GFWList”生效（这时会将配置更新到 `pac\proxy.pac` 文件中）

然后在浏览器中就可以访问新增的站点了

![](/archives/trojan-use/3l2vrk.png)

## 代理在windows中的逻辑

在浏览器中访问网站都是通过 http 协议进行访问的，在没有任何代理的情况下，当将域名输入到地址栏的时候

浏览器会根据域名先发起 dns 查询，再根据域名得到的 ip 地址，建立起 socket 通信，如果一切正常，那么网站可以正常访问

网站被 block 有多种原因，大体都可以归为以下两种：

（1）dns 被污染，在发起 dns 查询的时候，该 dns 查询请求被劫持，劫持方返回一个异常的地址

（2）dns 查询返回是正常的 ip 地址，但是由于该 ip 地址已经被标记为 block，当浏览器发起 socket 连接的时候出现异常（或者表现为连接不稳定）

在开启了代理工具的情况下，浏览器的请求实际上是通过一个叫 WPAD（Web Proxy Auto-Discovery Protocol）的逻辑将请求进行了转发

查看 windows 的代理配置中，代理工具实际上已经帮我们开启了这个配置项，也就是浏览器访问网页都会根据这个 pac 文件来进行处理

![](/archives/trojan-use/l531vm.png)

proxy.pac 其实是一个 js 脚本，文件中有一个 FindProxyForURL 函数，该函数定义了访问 url 的规则，前面配置的地址会写入到这个文件中的 rules 变量中

浏览器访问站点的时候，根据 FindProxyForURL 函数判断该 url 访问是否需要进行代理，如果需要转到 wall_proxy 处理上

从 wall_proxy 实现逻辑可以知道，实际也是代理工具开启的监听端口托管处理（这里的代理工具开启了 SOCKS 和 HTTP 的端口监听）

```js

var wall_proxy = function(){ return "SOCKS5 127.0.0.1:51837; SOCKS 127.0.0.1:51837; PROXY 127.0.0.1:58591"; };
var wall_v6_proxy = function(){ return "SOCKS5 127.0.0.1:51837; SOCKS 127.0.0.1:51837; PROXY 127.0.0.1:58591"; };

var rules = [
    "|http://85.17.73.31/",
    "||agnesb.fr",
    "||akiba-web.com",
    "||altrec.com",
    "||angela-merkel.de",
    "||angola.org",
    "||apartmentratings.com",
    "||apartments.com",
    //...
    "||google.com",
    "||*.google.com",
    "@@baidu.com",
    "@@*.baidu.com",
    "||github.com",
    "||*.github.com"
]
;

var defaultMatcher = new CombinedMatcher();

for (var i = 0; i < rules.length; i++) {
	defaultMatcher.add(Filter.fromText(rules[i]));
}

function FindProxyForURL(url, host) {
	if ( isPlainHostName(host) === true ) {
		return direct;
	}
	if (defaultMatcher.matchesAny(url, host) instanceof BlockingFilter) {
		return wall_proxy();
	}
	if ( check_ipv4(host) === true ) {
		return getProxyFromIP(host);
	}
	return direct;
}
```

## 设置PAC局域网代理

如果其他内网机器需要通过该节点运行的工具来代理上网的话，需要配置以下几个地方

（1）开启入站设置中的 “局域网共享”，这个值其实也是 config.json 文件中的 local_addr 地址，默认值是 127.0.0.1，勾选后修改为 “0.0.0.0”

![](/archives/trojan-use/3ttctd.png)

![](/archives/trojan-use/e15enc.png)

（2）修改 porxy.pac 中的 wall_proxy 和 wall_v6_proxy 函数中的 ip 地址，默认都是 127.0.0.1，勾选局域网共享并不会修改为本机的内网地址

必须要手工修改成实际的内网地址比如 192.168.1.102，不能使用 127.0.0.1 这样的地址，不然其他机器无法连接，后面的版本也可能已经修复了这个问题

![](/archives/trojan-use/tefpwz.png)

内网机器使用的时候，在 windows 的代理配置中，在脚本地址中填入实际的地址，如 `http://192.168.1.102:54400/proxy.pac`

内网机器在 http 请求的时候，首先会从这个地址下载 proxy.pac 文件，然后运行该脚本，再根据里面的规则进行路由

如果这个 proxy.pac 文件中 wall_proxy 和 wall_v6_proxy 的 ip 地址是 127.0.0.1 的话，那么路由的时候将会失败，因为代理服务是运行 Trojan-Qt5 的节点提供的 

重启 Trojan-Qt5 后进行连接生效，内网中的其他机器就可以通过指定内网中的 pac 脚本来进行代理上网了

![](/archives/trojan-use/ay4u19.png)
 
## windows下的代理方式

从 win10 下的代理设置页面看，至少有三种配置

（1）自动设置代理分为 “自动检测设置” 和 “使用设置脚本”

（2）“手动设置脚本”

### 自动检测设置

如果勾选了，浏览器会在局域网内查找代理服务器（WPAD协议），然后从服务器下载 wpad.dat 文件进行转发（其实也就是 pac 文件）

个人一般用不到部署代理服务器，一些公司会由运维部门搭建代理服务，提供给公司内部进行使用

### 使用设置脚本

就是前面提到的，一般当前节点配置代理上网，以及内网中其他机器都是使用该方式，部署上其他可以将代理工具单独部署，比如跑在路由器上或者服务器上

### 手动设置脚本

手动设置代理是全局代理，所有的流量都会走代理服务器，一般用不到

### 环境变量代理

除了以上在 windows 中 ”设置” 页面进行配置外，还有一种是设置环境变量的，环境变量仅限于当前会话/终端窗口/程序生效，和前面的生效范围不同

```shell
set http_proxy=http://192.168.1.101:58591
set https_proxy=http://192.168.1.101:58591
set http_proxy_user= ...
set http_proxy_pass= ...
```

chrome 浏览器开启一个新会话访问 url 的时候，会发起一个 pac 文件的查询，带上当前 pac 文件的时间戳，如果服务端查看时间戳是旧的，就会重新下发最新的pac文件

另外，windows 下是通过本地的服务 WinHttp 服务，通过 WPAD 协议进行代理服务器发现的

![](/archives/trojan-use/c19kf4.png)

## 内网wpad服务搭建

搭建 wpad 服务就是在 Trojan-Qt5（或其他代理工具）已经正常运行的情况下，增加一个配置下发的逻辑

需要部署 nginx 或其他 web 服务，然后在 nginx 的目录下增加一个 wpad.dat 文件（就是前面说的 proxy.pac 文件）

在路由器的 dhcp 选项中，增加一个 252 的选项（表示 wpad 协议），并将选项值更新为：http://xx.xx.xx.xx/wpad.dat

完整的逻辑

（1）设置路由器的 dhcp 支持 wpad 协议

（2）内网机器在 wpad 发现的时候，获取到对应的 wpad.dat 文件

（3）浏览器在访问网页的时候，按照 wpad.dat 的规则进行代理