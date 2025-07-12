---
categories:
- 默认分类
date: 2025-07-11 10:30:24
description: ''
draft: false
image: ''
slug: hugo-build-blog
cover: /archives/hugo-build-blog/uar13s.png
tags:
- hugo
- 静态站点
title: 基于hugo的静态博客站点部署
---

## 前言

之前写的一些文章，基于 halo 搭建了一个个人站点，运行也有半年多了，大概就长下面这个样子

![20250711183157](/archives/hugo-build-blog/uar13s.png)

我没有专门研究怎么配置它的 theme，不过我看有些人整得挺拉风的，最近在考虑迁移到 hugo， 以后记录就只使用静态站点了

至于迁移到原因，主要有以下几个点吧

1、服务器要花钱，halo 服务是部署在阿里云的，之前 99 一年买的小鸡，现在已经没优惠了，续费的话费用至少得大几百

2、halo 基于 java 开发的，内存占用实在有点高，再加一个 mysql，内存就没有了，因为请求量也不多，cpu 倒是没什么占用

3、人工运维，hugo 虽然说整体也挺稳定，但是半年来也死机过两三次，不确定什么原因，但从表现看就是内存耗尽了，只能重启机器

4、发布流程麻烦，涉及环节多，最开始登录 web 发布 mardown，需要额外装一个插件，后来使用 vscode 发布，也需要装一个 halo 插件

5、本地编写 markdown 预览，无法做到和发布后一样的阅读体验，相比之下 hugo 可以实时预览，保持和发布后一致的阅读体验

如果是构建一些动态站点，halo 还是很不错的选择，但是如果仅仅是写写博客文章，halo 就没太大的必要了

## 主题选型

hugo 有 Standard 版和 extended 版，建议下载 hugo 的 extended 版本的，下载地址在这里 https://github.com/gohugoio/hugo/releases

Standard 也就是非 Extended 版，适合纯 Markdown 内容站点，Extended 在 Standard 的基础上，增加了前端构建相关能力

![20250708102447](/archives/hugo-build-blog/gxyuvq.png)

下载 hugo 解压并添加到 path 环境变量，然后接下来就是挑选一个合适的hugo 主题进行配置

最开始是考虑使用 doks 主题进行部署的，官方的 github 地址在这里 https://github.com/thuliteio/doks ，按照项目上的 readme 指引

在终端命令窗口下运行 `npm create thulite@latest -- --template doks` 并输入项目名称 blog

![20250708104227](/archives/hugo-build-blog/h8kgx9.png)

进入 blog 目录后，运行 `npm install` 和 `npm run dev`，窗口显示监听在 `http://localhost:1313/`

![20250708104621](/archives/hugo-build-blog/hawxwl.png)

但是当浏览器访问 http://localhost:1313/ 时却只显示一句话 `This line is from layouts/index.html.`

折腾了好一会，后来看了 [issue](https://github.com/thuliteio/doks/issues/1360) ，hugo 版本回退到 v0.145.0 才能正常显示，上手第一步就踩坑，页面都没法正常显示，实在有点坑

运行后显示的页面如下

![20250709102302](/archives/hugo-build-blog/gx3uf0.png)

服务跑起来后，在本地调研了下怎么使用，但是感觉 doks 主题还是有点复杂，最终还是放弃了，我其实也不需要那么复杂的

后来又看了下其他的一些主题，也没找到很合适的，最终决定还是自己配一下样式，代码基本上也是 ai 提供的实现，我对前端其实也没什么研究 

## 整体结构

在本地创建一个 blog 项目，`hugo new site blog`，然后在 blog 的基础上进行添砖加瓦

![20250711191655](/archives/hugo-build-blog/vpcduo.png)

核心的代码文件其实就以下这几个，编写的 markdown 文章在 content 目录下

![20250711194111](/archives/hugo-build-blog/w3p6he.png)

其中 hugo.toml 为配置文件，如果是下载下来的主题，一般都有好几个配置文件，每个配置文件又有很多的配置项，自己配的话就弄简单点

layouts 下的为模板文件，其中 layouts/_default/baseof.html 定义了一个前端页面的基础结构，大致代码如下

```html
<html>
<head>
  ...
</head>
<body>
  <header>
    ...
  <header>
  <main>
    ...
  </main>
  <footer>
    ...
  </footer>
</body>
</html>

```

结构中的 head、header、footer 是在 baseof.html 中实现的，并在实现中引用到了一些其他变量，这些变量是配置在 hugo.toml 文件中定义

layouts/index.html 是站点的首页，里面定义了页面的主体 main 部分，渲染的时候将 main 块替换到 baseof.html 中，一起进行输出得到最终的页面

另外三个 single.html、list.html、terms.html 文件中也同样定义了一个 main 块，在渲染的时候替换掉到 baseof.html 中，和 index.html 流程一样

single.html 是请求单个文章页面的时候进行渲染

list.html 是在请求文章列表的时候进行渲染

terms.html 和 list.html 类似，也是请求列表的时候进行渲染，不过 terms.html 文件是在请求 `分类` 和 `标签` 的时候进行渲染的

terms.html 也可以没有，那么就请求 `分类` 和 `标签` 列表页面，就会退化为使用 list.html 页面进行渲染

每个 html 文件都可以使用 hugo.toml 中定义的一些变量，根据实际需要进行配置替换

其他静态文件在 static 目录下，如 css/js 以及其他的图片等资源文件，和正常的 web 页面开发没任何区别

有了以上的几个基本概念，其实就已经可以着手对主题进行改造了，又或者从零开始打造一个自己风格的 hugo 主题了

## 打包发布

正常情况下，在本地直接运行 `hugo server -D` 然后就可以在浏览器中打开 `http://localhost:1313/` 进行预览了

大致显示如下，由于本人对前端没什么研究，页面样式略显粗糙，不过整体觉得还能接受，这里也已经将旧的文章全部进行迁移过来了

![20250711201102](/archives/hugo-build-blog/x9cosk.png)

本地运行正常后，就可以进行打包到 github 进行发布了，在 github 新建一个以用户名命令的仓库，如 `xqc7com.github.io`

其他如 blog 等名字的仓库名也是可以的，不过资源路径需要在原来的基础上加 blog 前缀，不然会提示样式加载失败

在项目的 Settings -> Pages 中进行配置发布静态页面 

![20250712094217](/archives/hugo-build-blog/fkz907.png)

Source 选择 Github Actions，这样就会通过本仓库中的 .github\workflows 下的 yml 配置进行构建发布

如果选择 Deploy from a branch，那么就需要将本地构建时 public 路径下的文件也一起打包上传到仓库上，然后指定 master 分支的 public 路径 

![20250712094812](/archives/hugo-build-blog/foikc1.png)

在指定 `Github Actions` 后，每次 push 的时候，就会触发自动构建，默认会使用仓库名如 `https://xqc7com.github.io` 进行访问

如果自定义了其他的仓库名如 blog，那么访问路径就是 `https://xqc7com.github.io/blog`

## 域名配置

如果需要配置自定义域名，先在域名服务商中配置好 dns，不同的服务商的配置方式略有差别，配置四条 github 的 dns A 记录

如下面是在 cf 中进行配置的 dns 记录，配置完后生效需要一点时间

![20250712095601](/archives/hugo-build-blog/ft7ipn.png)

配置 dns 生效后就可以在 github 中的 `Custom domain` 填入自己的域名了，点击保存后就可以使用自己的域名进行访问了

![20250712105000](/archives/hugo-build-blog/hd68o4.png)


## 主题使用

大家如果想用这个主题也是很简单的，将仓库 clone 下来后，再将 content 下的内容删掉，然后改为发布自己的内容就可以了

如果有什么好的建议的话，也欢迎大家来跟我交流
