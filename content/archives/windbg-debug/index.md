---
categories:
- 逆向分析
date: '2025-09-24 16:19:24+08:00'
description: ''
draft: false
image: ''
slug: windbg-debug
cover: /archives/windbg-debug/nucwg8.png
tags:
- 逆向
title: windbg添加调试符号
---

windbg 下输入命令，开启日志记录到 c:\windbg.log 下面

```
0:040> .logopen c:\windbg.log
0:040> !sym noisy
0:040> .sympath SRV*c:\LocalSymbols*https://msdl.microsoft.com/download/symbols
0:040> .reload /f
```

直接下载发现无法正常下载，抓包显示会先进行一个重定向，之后重定向建立 tls 连接后，主动发起了一个 FIN 操作 

![](/archives/windbg-debug/nucwg8.png)

通过 _NT_SYMBOL_PROXY 环境变量设置为宿主机的代理后， 重新进行下载操作结果也是一样的，在建立起来 tls 之后主动进行 FIN 操作

![](/archives/windbg-debug/d8depj.png)

取日志打印的一些 url 记录，在宿主机以及虚拟机下的浏览器执行，发现都是可以正常下载的

```
SYMSRV:  c:\localsymbols\srvnet.pdb\9181DF0491B14051BAC74CBF85CC688E2\srvnet.pdb not found
SYMSRV:  https://msdl.microsoft.com/download/symbols/srvnet.pdb/9181DF0491B14051BAC74CBF85CC688E2/srvnet.pdb not found
DBGHELP: srvnet.pdb - file not found
*** ERROR: Symbol file could not be found.  Defaulted to export symbols for \SystemRoot\System32\DRIVERS\srvnet.sys - 
DBGHELP: srvnet - export symbols
```

使用 python 手工下载然后再导入到 windbg 的符号路径下

第一次没留意下载然后直接放在 c:\localsymbols 目录下了，发现符号是有具体的子路径的，需要重新调整目录处理

这里要注意的是 shutil.copyfile 复制文件的时候，源和目的都必须指定文件名，不能指定路径的方式进行复制

```python 
#!/usr/bin/env python
import requests
import shutil
from urllib.parse import urljoin
import os

def download_file_by_curl(url, pdb_path, pdb_name):
    newpath =  './downloads/' + pdb_path
    os.makedirs(newpath, exist_ok=True)
    if os.path.exists('./package/' + pdb_name):
        print("File(%s) is Exist..." % pdb_name)
        if not os.path.exists(newpath + pdb_name):
            shutil.copyfile('./package/' + pdb_name, newpath + pdb_name)
    else:
        os.system('cd %s && curl -OL %s' % (newpath, url))

def main():
    filename = "windbg.log"
    outdir = './downloads/'
    main_url = 'https://msdl.microsoft.com/'
    with open(filename, 'r') as fp:
        content = fp.readlines()
        for rline in content:
            line = rline.strip()
            if line.startswith('SYMSRV:  https://msdl.microsoft.com/download/symbols/'):
                m = line.split(':  ')
                down_url = m[1][:-10]
                bpos = down_url.find('symbols/')
                epos = down_url.rfind('/')
                pdb_path = down_url[bpos+7:epos+1]
                pdb_name = down_url[epos+1:]
                print("start to download:", pdb_path, " ", pdb_name)
                download_file_by_curl(down_url, pdb_path, pdb_name)
if __name__ == '__main__':
    main()
```

python 在使用 os.path.join 的时候有一个坑，如果参数中某个部分是绝对路径，则绝对路径前的路径都将被丢弃，并从绝对路径部分开始连接

![](/archives/windbg-debug/0zpvkt.png)

```
print(os.path.join('C:/Users/Administrator/Downloads', '/pictures/1.jpg'))  # C:/pictures/1.jpg

#正确用法应该是

print(os.path.join('C:/Users/Administrator/Downloads', '/pictures/1.jpg'.lstrip('/')))  # C:/Users/Administrator/Downloads\pictures/1.jpg
```


下载完后，设置环境变量 `_NT_SYMBOL_PATH = srv*C:\LocalSymbols*http://msdl.microsoft.com/download/symbols`，这样就不用每次手工加载符号了

重新启动 windbg ，使用 dt _DRIVER_OBJECT 查看符号信息，显示结果如下

![](/archives/windbg-debug/0n7o6w.png)

**参考**  
https://blog.csdn.net/counsellor/article/details/104721338  
https://blog.csdn.net/lly1122334/article/details/113611250  
https://docs.python.org/zh-cn/3/library/os.path.html#os.path.join