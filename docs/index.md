## 查看 CentOS 系统版本

```bash
rpm -q centos-release
```

## nginx 路由 404

修改 `nginx.conf` 文件，添加 `try_files`，之后重启 nginx。

```bash
server {
	...
	location / {
		...
		try_files $uri $uri/ /index.html;
	}
}
```
