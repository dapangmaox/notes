# 编程环境和软件设施安装

## Nginx

### Step1. 安装包并解压

首先连接到服务器，默认在 root 目录，在这里下载 Nginx 安装包。

```bash
wget http://nginx.org/download/nginx-1.23.0.tar.gz
```

下载完成之后在 `/usr/local/` 下创建nginx文件夹并进入：

```bash
cd /usr/local/
mkdir nginx
cd nginx/
```

将 `Nginx` 安装包解压到 `/usr/local/nginx` 中即可：

```bash
tar zxvf /root/nginx-1.23.0.tar.gz -C ./
```

解压完之后，`/usr/local/nginx` 目录中会出现一个 nginx-1.23.0 目录。

### Step 2. 编译安装 Nginx

预先安装额外的依赖：

```bash
yum -y install pcre-devel
yum -y install openssl openssl-devel
```

之后编译安装 Nginx：

```bash
cd nginx-1.23.0/
./configure
make && make install
```

安装完成后，Nginx 的可执行文件位置位于：

```bash
/usr/local/nginx/sbin/nginx
```

### Step 3. 启动 Nginx

直接执行如下命令即可：

```bash
/usr/local/nginx/sbin/nginx
```

如果想停⽌ Nginx 服务，可执⾏：

```bash
/usr/local/nginx/sbin/nginx -s stop
```

如果修改了配置⽂件后想重新加载 Nginx，可执⾏：

```bash
/usr/local/nginx/sbin/nginx -s reload
```

注意其配置⽂件位于：

```bash
/usr/local/nginx/conf/nginx.conf
```

接下来打开浏览器，键入 IP，就可以看到 Nginx 默认的页面了。

![image-20220626232209436](https://notes-1312649150.cos.ap-shanghai.myqcloud.com/images/image-20220626232209436.png)