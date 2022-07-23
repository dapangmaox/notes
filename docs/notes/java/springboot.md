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

## 基础配置

- 属性配置
- 配置文件分类
- yaml 文件
- yaml 数据读取

### 属性配置

SpringBoot 默认配置文件 application.properties，通过键值对配置对应属性。

- SpringBoot 导入对应的 starter 后，提供对应配置属性
- 书写配置采用关键字+提示形式书写

配置文件加载优先级：

- properties（最高）
- yml
- yaml

### yaml 相关

- 使用 `@Value` 来读取配置文件中的属性值

- 在配置文件中可以使用 `${属性名}` 方式引用属性值

- 如果属性中出现特殊字符，可以使用双引号包裹起来作为字符解析
- 封装全部属性到 Environment 对象

```java
@Autowired
private Environment env;
```

