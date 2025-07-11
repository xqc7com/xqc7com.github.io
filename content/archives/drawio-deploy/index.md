---
categories:
- 默认分类
date: '2025-01-20T19:29:00'
description: ''
draft: false
image: ''
slug: drawio-deploy
tags:
- drawio
title: 本地部署drawio绘图方案
cover: /archives/drawio-deploy/20250120162753456.png
---

## 前言

绘图的 Processon 确实是一个比较优秀的解决方案，但免费版只有可怜巴巴的 10 张图

之前开了 Processon 的会员，但是使用率比较低，最近会员快到期了，不再考虑续费，需要本地化部署 drawio 方案

drawio 有桌面客户端版本，也有 web 的版本，这里使用 web 的版本进行部署，并使用 github 私有仓库进行存储


## 部署服务 

### drawio下载

drawio 官方地址 https://github.com/jgraph/drawio ，release中下载最新的 war 包

这个 war 包运行需要外部的 Servlet 容器，主流的 Servlet 容器如 tomcat

![](/archives/drawio-deploy/20250120162753456.png)

### tomcat部署

tomcat 运行是基于 java 环境的，所以机器上要先部署好 java 环境，java 环境配置这里不作描述

apache 官方下载最新版本的 tomcat，下载地址如下

https://dlcdn.apache.org/tomcat/tomcat-9/v9.0.98/bin/apache-tomcat-9.0.98-windows-x64.zip

![](/archives/drawio-deploy/20250120162833592.png)

这里以 windows 部署为例，下载后解压到 C:\WebServer\apache-tomcat-9.0.98 路径下

进入到 bin 目录下，双击 startup.bat 运行就可以启动 tomcat 了

![](/archives/drawio-deploy/20250120170038399.png)

### tomcat乱码

在 tomcat 启动的时候，终端可能会出现乱码的情况

![](/archives/drawio-deploy/20250120164500894.png)

修改 apache-tomcat-9.0.98\conf\logging.properties 下的配置，将下面的 UTF-8 改为 GBK，修改后重启 tomcat 就正常了

```
java.util.logging.ConsoleHandler.encoding = UTF-8
```

![](/archives/drawio-deploy/20250120165155357.png)


### 部署draw.war

将前面下载的 draw.war 包放置于  apache-tomcat-9.0.98\webapps 目录下

重启 tomcat 后自动将 draw.war 包解压在 webapps/draw 目录下，输出的日志信息如下

当看到 `[...\draw.war]的部署已在[xxxx]ms内完成` 类似信息的时候，就表示服务已经启动成功

![](/archives/drawio-deploy/20250120165736056.png)

### 修改端口

默认 tomcat 启动会监听 8080 端口，如果想修改监听端口

需要修改 apache-tomcat-9.0.98\conf\server.xml 配置文件中 port 的配置值

![](/archives/drawio-deploy/20250120170633477.png)

### 配置证书

如果需要配置 https 的话，linux 中可以使用如下命令生成一个 localhost-rsa.jks 证书文件，密码是 `changeit`

```shell
keytool -genkey -alias tomcat -keyalg RSA -keystore localhost-rsa.jks -storepass changeit -keypass changeit -keysize 2048 -validity 3650 -dname "CN=localhost"
```

然后将 conf/server.xml 文件中进行配置，证书路径和密码需要一致（该部分配置默认是被注释了的），配置后重启 tomcat 生效

```conf
    <Connector port="8443" protocol="org.apache.coyote.http11.Http11NioProtocol"
               maxThreads="150" SSLEnabled="true"
               maxParameterCount="1000"
               >
        <SSLHostConfig>
            <Certificate certificateKeystoreFile="conf/localhost-rsa.jks"
                         certificateKeystorePassword="changeit" type="RSA" />
        </SSLHostConfig>
    </Connector>
```

### 浏览器访问

服务成功启动后，在浏览器中访问地址 http://192.168.10.200:8080/draw/ ，提示文件保存的位置，这个后面再进行配置

![](/archives/drawio-deploy/20250120173434320.png)

在菜单 Extras 中将显示的语言改为中文

![](/archives/drawio-deploy/20250120173636436.png)

## 创建github应用

在保存绘图文件的时候，可以选择位置如 google drive, one drive, dropbox 等多种存储形式，这里使用 github 进行存储

在配置 github 存储的时候，需要简单了解下 github 的 Github Apps 和 OAuth Apps 授权

这里只需要知道 OAuth Apps 是旧的授权方式，存在很多不足，Github Apps 是新的授权方式，可以更细粒度，更安全的进行授权

在登录 github 的前提下，打开页面 https://github.com/settings/apps ，可以看到两种授权

![20250405165147](/archives/drawio-deploy/rba2nq.png)

新建 Github Apps 进行授权，输入应用的信息，其中 Homepage URL 为本地的 drawio 地址，以及 callback 地址如下

这里的 callback 地址为 github2，可以勾选上 `Request user authorization (OAuth) during installation` 在安装的时候进行授权

![20250405170207](/archives/drawio-deploy/s5eg95.png)

在 Permissions 部分勾选上 Contents 的 `Read and write` 权限，然后点击注册应用

![20250405170743](/archives/drawio-deploy/s8lbck.png)

应用创建后，复制生成的 client id 和 client secret，然后点击安装应用

![20250405171538](/archives/drawio-deploy/sdbxyd.png)

在安装的时候选择指定的个人 private 仓库 drawio，这个仓库需要预先建立好

![20250405171855](/archives/drawio-deploy/sfg89w.png)

## 配置drawio服务

前面已经生成了 github 的 client id 和 client secret ，现在需要将这些信息配置到 drawio 的 web 服务上

### 修改配置

修改 webapps/draw/js/PreConfig.js 文件，增加本地 drawio 的地址以及 github 的配置信息 

这里的 DRAWIO_GITHUB_ID 就是前面创建的 client id

![](/archives/drawio-deploy/pkl740.png)

另外还需要配置 WEB-INF 目录下的 github_auth_url、github_client_id、github_client_secret 文件内容

github_auth_url 值为 https://github.com/login/oauth/access_token 

github_client_id 和 github_client_secret 就是前面生成的 github 配置

![](/archives/drawio-deploy/qppw1i.png)

### 授权配置

浏览器中访问本地部署 drawio 的 web 地址，配置存储的时候指定为 github，点击授权

![](/archives/drawio-deploy/gqu86q.png)

![](/archives/drawio-deploy/gqiqb8.png)


在显示的仓库列表中，选择 private 仓库 drawio，然后确定

![20250405172813](/archives/drawio-deploy/skx3hj.png)

### 提交绘图

绘图保存的时候，按 ctrl + s 进行保存，会出现一个提示框，本质上每次保存都是一个 commit 提交

![20250405175146](/archives/drawio-deploy/syt508.png)




