---
categories:
- 采集工具
date: '2025-01-05T12:30:00'
description: ''
draft: false
image: ''
slug: highferrum-use-2
tags: []
title: 使用火车头采集站点内容（2）
cover: /archives/highferrum-use-2/image-uuel.png
---

前面已经通过配置火车头正常采集到了文章的字段以及图片，这里将采集到的内容发布到站点

## 3、内容发布规则

以 wordpress 站点为例，这里的内容发布需要用到用户 Cookie ，并且发布方式使用内置浏览器登录

需要保证运行火车头采集的机器能正常连接到 wordpress

### Cookie 获取

浏览器请求 wordpress 后台页面，使用管理员账号登录，打开开发者工具（按 F12 ）

切换到 “网络” 标签页，点击左侧的任意一个请求，将右侧中显示的 Cookie 保存下来一会用

如果网络下没有请求，那么 F5 刷新下当前页面，再将 Cookie 保存起来

![](/archives/highferrum-use-2/image-uuel.png)

### locoy.php 配置

为了使得文章能够发布，还需要一个插件 locoy.php，这个 php 文件需要上传到 wordpress 的根目录下

![](/archives/highferrum-use-2/image-jbnm.png)

locoy.php 文件的代码大致如下，这里对文章发布的逻辑简单说下

1、使用 get 请求获取到 wordpress 的分类信息，后面配置用到（ wp\_dropdown\_categories 函数部分）

2、火车头将文章信息 post 到 locoy.php 页面，由 locoy.php 通过 wp\_insert\_post 将文章发布

3、由 locoy.php 通过 add\_post\_meta 添加文章的 meta 信息，**不同主题的 meta 是不相同的，需要按主题进行适配**

```php
<?php
/**
 * 标题：Wordpress火车头采集器免登录发布接口
 * 作者：QC七哥
 * 网址：https://blog.csdn.net/weixin_53109623
 */
 
define('LOCOY_USER', 'admin'); //定义发文章的用户
define('WP_ADMIN', true);
 
require_once( dirname( __FILE__ ) . '/wp-load.php' );
require_once( ABSPATH . 'wp-admin/includes/admin.php' );
 
if (empty($_POST)) {
    wp_dropdown_categories(array('hide_empty' => 0, 'hide_if_empty' => false, 'taxonomy' => 'category', 'name' => 'parent', 'orderby' => 'name', 'hierarchical' => true, 'show_option_none' => __('None')));
    exit();
}
 
$post_data = array(
    'post_title'    => $_POST['post_title'], 
    'post_content'  => $_POST['post_content'], 
    'post_date'     => $_POST['post_date'],
    'post_category' => array($_POST['post_category']),
    'post_status'   => 'publish', 
    'post_author'   => 'admin', 
);
 
$current_user = get_user_by('login', LOCOY_USER);
$post_id = wp_insert_post( $post_data );
 
$data = [];
 
if ($post_id > 0) {
 
    add_post_meta($post_id, 'xxx', $data, true);
 
    //succ
    exit('[ok]');
}
 
```

### **火车头配置**

上面两个步骤配置好之后，回到火车头工具上面来，选择 “Web在线发布”，点击 “+” （标号 3 ）增加发布设置

在弹出的窗口中，点击 “+” （标号 4 ）添加发布配置

![](/archives/highferrum-use-2/image-jjft.png)

述点击 4 位置的 “+” 后，弹出 “Web发布模块” 配置框，需要配置几个标签页

**获取栏目列表**

获取分类信息，这些分类信息可以在上一个窗口 “获取列表” 中进行使用

刷新列表页面设置为前面上传到 wordpress 的文件名，需要加上路径 /locoy.php

分类列表设置为 <option(\*)value="\[分类ID\]"(\*)>\[分类名称\]</option>，分类ID 和 分类名称由请求返回

![](/archives/highferrum-use-2/image-lfrp.png)

**内容发布参数**

将前面步骤得到的文章所有字段在这里进行设置，配置后这些字段将通过 post 提交给 locoy.php 文件

表单值在编辑状态下，可以通过右侧的标签来设置，表单名需要和 locoy.php 文件内的 $\_POST 变量一致

这个配置修改后，需要退出软件后重新启动，不然修改无法生效，设置完效果类似下面

![](/archives/highferrum-use-2/image-rzhq.png)

**高级功能**

数据发布方式设为 application/x-www-form-urlencoded 

![](/archives/highferrum-use-2/image-gnjh.png)

设置完毕后，点击 “保存” 按钮，将配置保存到文件，如保存文件名为 wordpress1.0.0.wpm

**类别选择**

在前面的配置完并保存文件后，回到模块管理的窗口下

在这里选中刚保存的发布模块，设置网页编码为 UTF-8，设置好 wordpress 的网站地址

还有 UserAgent 和登录 Cookie，然后点击下方的 “获取列表” 并选一个类别作为当前发布文章的类别

这里的获取列表，就是通过前面的 “获取栏目列表” 这一步的配置得到的

配置完后输入配置名，点击保存然后关闭当前窗口，回到 “内容发布规则” 窗口上，再勾选刚才保存的配置记录

![](/archives/highferrum-use-2/image-wtka.png)

### **设置图片上传**

切换到 “其他设置” 界面 “Ftp/SFtp文件上传” 中，在这里配置 FTP 如下（ wordpress 机器需要先开通 ftp 服务）

![](/archives/highferrum-use-2/image-ihbp.png)

在使用过程中，发现火车头的图片上传一直没成功，但是上传测试文件又是正常的，路径也没问题，之前是可以上传图片的

只好写了一段 python 代码，将这里的文件上传关闭，在文章发布完毕后，手动运行脚本上传图片

上传图片的 python 代码如下（使用的时候，按实际的配置进行修改）

```python
# -*- coding: utf-8 -*-
 
import os
from ftplib import FTP
 
host = '192.168.10.200'
username = 'admin'  
password = '******'  
local_dir = 'd:/software/火车头采集/Images'  
remote_dir = '/wordpress/wp-content/uploads' 
 
import os
from ftplib import FTP
 
def ftp_upload_directory(host, username, password, local_dir, remote_dir):
 
    ftp = FTP(host)
    ftp.login(username, password)
 
    def create_remote_directory(remote_path):
        try:
            ftp.cwd(remote_path)
        except Exception as e:
            print(f"目录 '{remote_path}' 不存在，创建中...")
            ftp.mkd(remote_path)
            ftp.cwd(remote_path)
 
    for root, dirs, files in os.walk(local_dir):
        for file in files:
            local_file_path = os.path.join(root, file)
            
            relative_path = os.path.relpath(local_file_path, local_dir)
            remote_file_path = os.path.join(remote_dir, relative_path)
 
            remote_dir_path = os.path.dirname(remote_file_path)
            create_remote_directory(remote_dir_path)
 
            try:
                remote_files = ftp.nlst(remote_dir_path)
                remote_file_names = [os.path.basename(f) for f in remote_files]
                if file in remote_file_names:
                    print(f"文件 '{file}' 已经存在，跳过上传。")
                    continue
            except Exception as e:
                print(f"无法访问远程目录 '{remote_dir_path}'，跳过文件 '{file}'。")
                continue
 
            with open(local_file_path, 'rb') as local_file:
                ftp.storbinary(f"STOR {remote_file_path}", local_file)
                print(f"文件 '{local_file_path}' 上传成功。")
 
    ftp.quit()

ftp_upload_directory(host, username, password, local_dir, remote_dir)
```

## **4、采集发布** 

在上述所有步骤处理好之后，现在就可以对采集文章进行发布了（这里测试了一个目录页）

### **采网址和采内容**

在主界面上来，在左侧选中刚配置的采集任务，然后勾选 “采网址”，“采内容” 这两个复选框

然后右键菜单中点击 “开始”，稍等一会就显示采集的文章信息了

![](/archives/highferrum-use-2/image-qclo.png)

对应文章的图片也已经下载到本地了，下载了 48 张图片（前面下载图片设置了随机文件名）

![](/archives/highferrum-use-2/image-lwgp.png)

### **文章发布**

在前面网址和内容已经采集完毕，检查发现没问题之后，点击采集任务右边显示的数字

右边将会新打开一个数据页，显示刚采集到的文章列表，全选或者选择一部分文章，右键 “发布所选记录”

如果确定流程已经没问题了，也可以在前面采集的时候，一起将 “发布” 勾选上就可以自动发布了

![](/archives/highferrum-use-2/image-cjdc.png)

发布窗口提示信息是成功的

![](/archives/highferrum-use-2/image-iksn.png)

### **图片上传**

回到前面的 python 脚本，将脚本保存为 upload\_image.py，运行脚本进行图片上传

![](/archives/highferrum-use-2/image-dnos.png)

打开浏览器访问 wordpress 地址，可以正常显示文章以及图片了，至此采集站点内容算是基本完成
