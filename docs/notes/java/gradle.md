# Gradle

安装：`brew install gradle`

命令行初始化：`gradle init`

## 常用指令

| 常用 gradle 指令     | 作用                       |
| -------------------- | -------------------------- |
| gradle clean         | 清空 build 目录            |
| gradle classes       | 编译业务代码和配置文件     |
| gradle test          | 编译测试代码，生成测试报告 |
| gradle build         | 构建项目                   |
| gradle build -x test | 跳过测试构建项目           |

> gradle 的指令要在含有 build.gradle 的目录执行。

执行 `gradle build` 之后会生成 build 目录。

<img src="https://notes-1312649150.cos.ap-shanghai.myqcloud.com/images/image-20220705224519342.png" alt="image-20220705224519342" style="zoom:50%;" />

- classes 存放了编译后的业务代码和配置文件
- reports 存放了 test 的报告，可以在浏览器打开

## 修改 maven 下载源

