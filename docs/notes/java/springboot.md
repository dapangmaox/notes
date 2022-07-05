# Spring Boot

## Spring Boot 特点

### 依赖管理

```xml
<parent>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-parent</artifactId>
  <version>2.7.1</version>
</parent>
```

### 自动配置

- 自动配置 Tomcat
- 自动配置 SpringMVC
  - 引入 SpringMVC 全套组件
  - 自动配好 SpringMVC 常见功能，如：字符编码问题
- 默认的包结构
  - 主程序所在包及其下面的所有子包里面的组件都会被默认扫描进来
  - 无需以前的包扫描配置
  - 想要改变扫描路径
