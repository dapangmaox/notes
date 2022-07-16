# Maven

## 命令行创建工程

Maven 命令通过 Maven 插件的 jar 包提供，所以在一些 mvn 命令执行时会先下载插件。

- 指定本地仓库
- 配置阿里云提供的镜像仓库

##### 配置 Maven 工程的基础 JDK 版本

如果按照默认配置运行，Java 工程使用的默认 JDK 版本是 1.5，而我们熟悉和常用的是 JDK 1.8 版本。修改配置的方式是：将 profile 标签整个复制到 settings.xml 文件的 profiles 标签内。

```xml
<profile>
  <id>jdk-1.8</id>
  <activation>
    <activeByDefault>true</activeByDefault>
    <jdk>1.8</jdk>
  </activation>
  <properties>
    <maven.compiler.source>1.8</maven.compiler.source>
    <maven.compiler.target>1.8</maven.compiler.target>
    <maven.compiler.compilerVersion>1.8</maven.compiler.compilerVersion>
  </properties>
</profile>
```

##### Maven 中的坐标

- groupId：公司或组织的 ID
- artifactId：一个项目或是项目中的一个模块的 ID
- version：版本号

仓库中 jar 包的存储路径也是根据 Maven 坐标来的。

##### 命令格式

```bash
mvn archetype:generate
```

![img008.be45c9ad](https://notes-1312649150.cos.ap-shanghai.myqcloud.com/images/img008.be45c9ad.png)

##### 约定大于配置，配置大于编码

##### pom.xml 文件解读

```xml
<!-- project 标签：根标签，表示对当前工程进行配置、管理 -->
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">

  <!-- modelVersion 标签：从 Maven 2 开始就固定是 4.0.0 -->
  <!-- 代表当前 pom.xml 所采用的标签结构 -->
  <modelVersion>4.0.0</modelVersion>

  <!-- 坐标信息 -->
  <groupId>com.liangxwei.maven</groupId>
  <artifactId>maven-cli</artifactId>
  <version>1.0-SNAPSHOT</version>

  <!-- 打包方式 -->
  <!-- jar：表示这个工程是一个Java工程  -->
  <!-- war：表示这个工程是一个Web工程 -->
  <!-- pom：表示这个工程是“管理其他工程”的工程 -->
  <packaging>jar</packaging>

  <name>maven-cli</name>
  <url>http://maven.apache.org</url>

  <!-- 在 Maven 中定义属性值 -->
  <properties>
    <!-- 在构建过程中读取源码时使用的字符集 -->
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
  </properties>

  <!-- 当前工程所依赖的 jar 包 -->
  <dependencies>
    <!-- 使用 dependency 配置一个具体的依赖 -->
    <dependency>
      <!-- 在 dependency 标签内使用具体的坐标依赖我们需要的一个jar包 -->
      <groupId>junit</groupId>
      <artifactId>junit</artifactId>
      <version>4.13.2</version>
      <!-- scope 标签配置依赖的范围 -->
      <scope>test</scope>
    </dependency>
  </dependencies>
</project>
```

## Maven 命令

`mvn clean`：清理操作，删除 target 目录

`mvn compile`：主程序编译，编译结果存放在 `target/classess` 目录里

`mvn test-compile`：测试程序编译，编译结果存放在 `target/test-classes` 目录里

`mvn test`：测试，报告存放在 `target/surefire-reports`

`mvn package`：打 jar 包，存放在 `target` 目录

`mvn install`：安装的效果是将本地构建过程中生成的 jar 包存入 Maven 本地仓库。这个 jar 包在 Maven 仓库中的路径是根据它的坐标生成的。另外，安装操作还会将 pom.xml 文件转换为 XXX.pom 文件一起存入本地仓库。所以我们在 Maven 的本地仓库中想看一个 jar 包原始的 pom.xml 文件时，查看对应 XXX.pom 文件即可，它们是名字发生了改变，本质上是同一个文件。

`mvn dependency:list`：查看当前工程所依赖的 jar 包的列表

`mvn dependency:tree`：查看当前工程的依赖信息

## 依赖范围

标签的位置：`dependencies/dependency/scope`

可选值:

- compile
- test
- provided
- system
- runtime
- import

### compile vs test

|         | main 目录 | test 目录 | 开发过程 | 部署到服务器 |
| ------- | :-------: | :-------: | :------: | :----------: |
| compile |    ✅     | ✅        | ✅       | ✅           |
| test    |    ❌     | ✅        | ✅       | ❌           |

### compile vs provided

|         | main 目录 | test 目录 | 开发过程 | 部署到服务器 |
| ------- | :-------: | :-------: | :------: | :----------: |
| compile |     ✅     |     ✅     |    ✅     |      ✅       |
| test    |     ✅     |     ✅     |    ✅     |      ❌       |

### 结论

- compile：通常使用的第三方框架的 jar 包这样在项目实际运行时真正需要的 jar 包都是以 compile 范围进行依赖的。
- test：测试过程中使用的 jar 包，比如 junit。
- provided：在开发过程中需要用到的“服务器上的 jar 包”通常以 provided 范围依赖进来。比如 servlet-api、jsp-api。而这个范围的 jar 包之所以不参与部署，是为了避免和服务器上已有的同类 jar 包产生冲突。

### 依赖传递性

在 A 依赖 B，B 依赖 C 的前提下，C 是否能够传递到 A，取决于 B 依赖 C 时使用的依赖范围。

- B 依赖 C 时使用 compile 范围：可以传递
- B 依赖 C 时使用 test 或 provided 范围：不能传递

## 依赖的排除

当 A 依赖 B，B 依赖 C 而且 C 可以传递到 A 的时候，A 不想要 C，需要在 A 里面把 C 排除掉。而往往这种情况都是为了避免 jar 包之间的冲突。

![img027.2faff879](https://notes-1312649150.cos.ap-shanghai.myqcloud.com/images/img027.2faff879.png)![im

```xml
<dependency>
	<groupId>com.liangxwei.maven</groupId>
	<artifactId>maven-java</artifactId>
	<version>1.0-SNAPSHOT</version>
	<scope>compile</scope>
	<!-- 使用excludes标签配置依赖的排除	-->
	<exclusions>
		<!-- 在exclude标签中配置一个具体的排除 -->
		<exclusion>
			<!-- 指定要排除的依赖的坐标（不需要写version） -->
			<groupId>commons-logging</groupId>
			<artifactId>commons-logging</artifactId>
		</exclusion>
	</exclusions>
</dependency>
```

可以通过 `mvn dependency:tree` 查看效果。

## 继承

Maven工程之间，A 工程继承 B 工程

- B 工程：父工程
- A 工程：子工程

本质上是 A 工程的 pom.xml 中的配置继承了 B 工程中 pom.xml 的配置。

### 作用

在父工程中统一管理项目中的依赖信息，具体来说是管理依赖信息的版本。

它的背景是：

- 对一个比较大型的项目进行了模块拆分。
- 一个 project 下面，创建了很多个 module。
- 每一个 module 都需要配置自己的依赖信息。

它背后的需求是：

- 在每一个 module 中各自维护各自的依赖信息很容易发生出入，不易统一管理。
- 使用同一个框架内的不同 jar 包，它们应该是同一个版本，所以整个项目中使用的框架版本需要统一。
- 使用框架时所需要的 jar 包组合（或者说依赖信息组合）需要经过长期摸索和反复调试，最终确定一个可用组合。这个耗费很大精力总结出来的方案不应该在新的项目中重新摸索。

通过在父工程中为整个项目维护依赖信息的组合既**保证了整个项目使用规范、准确的 jar 包**；又能够将**以往的经验沉淀**下来，节约时间和精力。

## 聚合

部分组成整体，使用一个“总工程”将各个“模块工程”汇集起来，作为一个整体对应完整的项目。

- 项目：整体
- 模块：部分

概念的对应关系：

- 从继承关系角度来看：

  - 父工程

  - 子工程

- 从聚合关系角度来看：

  - 总工程

  - 模块工程

### 好处

- 一键执行 Maven 命令：很多构建命令都可以在“总工程”中一键执行。

  以 `mvn install` 命令为例：Maven 要求有父工程时先安装父工程；有依赖的工程时，先安装被依赖的工程。我们自己考虑这些规则会很麻烦。但是工程聚合之后，在总工程执行 `mvn install` 可以一键完成安装，而且会自动按照正确的顺序执行。

- 配置聚合之后，各个模块工程会在总工程中展示一个列表，让项目中的各个模块一目了然。

### 聚合的配置

在总工程中配置 modules 即可：

```xml
<modules>
  <module>maven-parent-module1</module>
  <module>maven-parent-module2</module>
  <module>maven-parent-module3</module>
</modules>
```

### 依赖循环问题

如果 A 工程依赖 B 工程，B 工程依赖 C 工程，C 工程又反过来依赖 A 工程，那么在执行构建操作时会报下面的错误：

> DANGER
>
> [ERROR] [ERROR] The projects in the reactor contain a cyclic reference:

这个错误的含义是：循环引用。
