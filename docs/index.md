# Quick Notes

## IDEA 隐藏文件

```
Intellij IDEA -> Preferences -> Editor -> File Types -> Ignored Files and Folders
```

## npm 版本号

`^`符号表示主版本号不变，次版本号和修订号始终最新

`~`符号表示主版本号和次版本号不变，修订号始终最新

定版本号的规则：

- 主版本号（major）：做了不兼容的 API 修改

- 次版本号（minor）：向下兼容的功能性新增（新功能增加，但是兼容之前的版本）

- 修订号（patch）：向下兼容的问题修正,没有新功能，修复之前版本的 bug

## 查看远程仓库地址

```bash
git remote -v
```

## IDEA 自带 Maven 和 Gradle

IntelliJ IDEA 是自带 maven 和 gradle 的，路径在：

```bash
/Applications/IntelliJ IDEA CE.app/Contents/plugins/maven/lib
/Applications/IntelliJ IDEA CE.app/Contents/plugins/gradle/lib
```

## Mac OS 设置默认 Java JDK

首先 `/usr/libexec/java_home -V`，会列出所有安装的 JDK，之后选择想要的默认 JDK，设置 JAVA_HOME

```bash
export JAVA_HOME=`/usr/libexec/java_home -v 1.6.0_65-b14-462`
```

<img src="https://notes-1312649150.cos.ap-shanghai.myqcloud.com/images/%E6%88%AA%E5%B1%8F2022-06-29%2023.05.31.png" alt="截屏2022-06-29 23.05.31" style="zoom:50%;" />

## html2pdf + JSZip + file-saver

最近遇到了一个需求：需要在前端生成多个 PDF，并打包成 zip 包给到用户。

解决方案：使用 `html2pdf` + `JSZip` + `file-saver`

```javascript
// 核心代码
html2pdf().set(option).from(element).toPdf().output().then(function(pdfContent) {
  const zip = new JSZip();
  zip.file('filename1', pdfContent, { binary: true });
  zip.file('filename2', pdfContent, { binary: true });
  zip.generateAsync{ type: 'blob' }).then(function(content) {
    FileSaver.saveAs(content, 'download.zip');
  })
})
```

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
