这篇文章详细介绍了 ESLint 相关的一些知识，主要分成三大部分：

- ESLint 基本介绍与使用
- ESLint 运行原理与 AST
- 如何编写 ESLint 插件

## 什么是 ESLint

ESLint 是一个开源的 JavaScript 代码检查工具，由 Nicholas C. Zakas 于2013年6月创建。代码检查是一种静态的分析，常用于寻找有问题的模式或者代码，并且不依赖于具体的编码风格。对大多数编程语言来说都会有代码检查，一般来说编译程序会内置检查工具。

JavaScript 是一个动态的弱类型语言，在开发中比较容易出错。因为没有编译程序，为了寻找 JavaScript 代码错误通常需要在执行过程中不断调试。ESLint 可以让程序员在编码的过程中发现问题而不是在执行的过程中。

ESLint 的初衷是为了让程序员可以创建自己的检测规则。ESLint 的所有规则都被设计成可插拔的。ESLint 的默认规则与其他的插件并没有什么区别，规则本身和测试可以依赖于同样的模式。为了便于人们使用，ESLint 内置了一些规则，当然，你可以在使用过程中自定义规则。

## 安装与使用

你可以使用 npm 或者 yarn 安装 ESLint，本文会使用 yarn。首先创建一个目录`eslint-start`，初始化`package.json`文件，然后安装 `eslint`。

```bash
yarn init

yarn add eslint --dev
```

安装完成之后需要设置一个配置文件，可以通过命令行工具直接生成：

```bash
yarn create @eslint/config
```

在这个过程中，ESLint 会让你选择一些选项：

```bash
✔ How would you like to use ESLint? · problems
✔ What type of modules does your project use? · esm
✔ Which framework does your project use? · none
✔ Does your project use TypeScript? · No / Yes
✔ Where does your code run? · browser
✔ What format do you want your config file to be in? · JSON
```

之后会得到一个`.eslintrc.json`文件，内容如下：

```json
{
  // 指定环境，比如是浏览器还是 Node，会提供一些预定义的全局变量
  "env": {
    "browser": true,
    "es2021": true
  },
  "extends": "eslint:recommended", // 要扩展的配置文件
  "parserOptions": {
    "ecmaVersion": "latest", // 指定你要使用的 ECMAScript 语法版本，"latest" 表示始终启用最新的 ECMAScript 版本
    "sourceType": "module" // "script" (默认值) 或 "module"（如果你的代码是 ECMAScript 模块)
  },
  // 配置规则
  "rules": {}
}
```

JSON 和 YAML 配置文件是支持注释的，ESLint 会 ignore 配置文件中的注释

现在你可以在任何文件或目录上运行 ESLint。

### 例子

下面来看一个简单的例子，首先添加一条规则到`.eslintrc.json`中的`rules`部分：`"prefer-const": "error"`，这条规则要求声明后没有被重新赋值的变量必须使用`const`，否则会报错。

ESLint 官方提供的所有规则都可以在这个页面找到：https://eslint.org/docs/rules/

```json
{
  // ...
  "rules": {
    "prefer-const": "error"
  }
}
```

之后在项目根目录创建一个`index.js`文件，并把以下内容写入到文件中：

```javascript
let myName = 'dapangmao';
console.log(myName);
```

接下来就可以运行 ESLint 了：

```bash
yarn run eslint index.js
```

命令执行完之后，会在控制台看到以下错误：

![img](https://notes-1312649150.cos.ap-shanghai.myqcloud.com/images/1655717075179-19868dd4-b952-42f8-8ad5-117f876e0797.png)

也可以通过在上面命令的基础上添加`--fix`，这样 ESLint 会尝试去修复错误，对于上图中的错误，ESLint 会自动把`let`替换为`const`，感兴趣的读者可以自行尝试。

### rules

ESLint 中有两个重要的部分：rules 和 plugins。

在上一个例子中，我们使用了键值对的形式来添加一个规则，键是规则的名称，值是错误级别，这一类的规则是没有属性的，只需要开启或者关闭。

Rule 的错误级别可以是以下值之一：

- `off`或者`0`：关闭规则
- `warn`或者`1`：开启规则，使用警告级别的错误
- `error`或者`2`：开启规则，使用错误级别的错误

```json
{
  "no-debugger": "error",
  "no-delete-var": "warn",
  "no-dupe-args": "off"
}
```

除了键值对形式的规则外，还有一部分规则除了需要开启或关闭，还需要配置属性。

```json
"rules": {
  "quotes": ["error", "single"], // 如果不是单引号，则报错
  "one-var": [
    "error",
    {
      "var": "always", // 每个函数作用域中，只允许 1 个 var 声明
      "let": "never", // 每个块作用域中，允许多个 let 声明
      "const": "never" // 每个块作用域中，允许多个 const 声明
    }
  ]
}
```

### plugins

尽管 ESLint 附带了一些很好的规则，但通常它们不足以满足项目的所有需求，特别是如果使用 React、Vue、Angular 等库和框架进行构建时。ESLint 插件允许我们根据项目的需要添加自定义规则。插件作为 npm 模块发布，命名格式为`eslint-plugin-<plugin-name>`。

要使用插件，首先需要通过 npm 安装插件，然后把插件添加到`eslintrc`配置文件中的`plugins`中。例如，你想使用一个名为`eslint-plugin-my-awesome-plugin`的插件，你可以像这样把它添加到你的配置文件中：

```json
{
  "plugins": ["my-awesome-plugin"] // "eslint-plugin" 前缀可以省略
}
```

需要注意的是，添加了这个插件不意味着这个插件的所有规则都会被自动启用，仍然需要单独应用要与该插件一起使用的每个规则，在配置文件中的 rules 对象上配置。

```json
{
  "rules": {
    "eqeqeq": "off",
    "curly": "error",
  }
}
```

但是如果每一个规则都需要配置一遍，对开发者来说很不友好，所以 ESLint 提供了另一种方式：可共享的配置。

#### 可共享的配置

ESLint 允许我们通过将配置发布到 npm 来共享配置。与插件的名字类似，可共享的配置以`eslint-config-<config-name>`的格式发布。

要使用可共享配置，首先也要从 npm 安装，然后可以通过`extends`部分来扩展项目的 ESLint 配置。

```json
{
  "extends": "standard" // 与插件类似，"eslint-config" 前缀可以省略
}
```

我们可以通过将多个配置添加到数组中来扩展它们，如果配置修改相同的规则，则前面的配置的规则将被后面的配置覆盖，因此在这些情况下顺序很重要。

需要注意的是，可共享配置不仅仅用于共享规则集，它们可以是具有自己的插件、格式化程序等的完整配置，甚至还可以从其他配置扩展。

以`eslint-config-standard`为例，当我们使用`"extends": "standard"`时，实际上是使用了这个[配置文件](https://github.com/standard/eslint-config-standard/blob/master/.eslintrc.json)。

#### 带有配置的插件

除了使用`eslint-config-<config-name>`来发布可共享配置之外，插件本身也可以附带不同的可共享的配置集，我们可以根据项目需要来选择使用哪一个。如果你以前有配置过 ESLint，很可能见过这样的写法：

```json
{
  "extends": {
    "plugin:prettier/recommended"
  }
}
```

我们可以通过`plugin:`前缀使用插件附带的这些配置。例如，我们正在使用一个名为`eslint-plugin-my-awesome-plugin`的插件，它带有一个名为`recommended`的配置。然后，我们可以将`plugin:my-awesome-plugin/recommended`添加到配置中的`extends`部分，来从该可共享配置扩展。

我们甚至不需要在`eslintrc`配置文件中把`prettier`添加到`plugins`中，因为`recommended`配置中已经包含了。我们以`eslint-plugin-prettier`为例，如果查看[代码](https://github.com/prettier/eslint-plugin-prettier/blob/master/eslint-plugin-prettier.js#L67)，就会发现这个插件导出了一个`recommended`配置，内容如下：

```javascript
module.exports = {
  configs: {
    recommended: {
      extends: ['prettier'],
      plugins: ['prettier'],
      rules: {
        'prettier/prettier': 'error',
        'arrow-body-style': 'off',
        'prefer-arrow-callback': 'off',
      },
    },
  },
};
```

通过`"extends": "eslint:recommended"`，所有在 [rules](https://eslint.org/docs/rules/) 页面打钩✔️的 rules 都会被开启。

## ESLint 工作原理

了解了 ESLint 基本的使用之后，我们再来了解一下 ESLint 的工作原理，也为接下来的编写 ESLint 插件部分做准备。

在 ESLint 中，默认使用 [Espree](https://github.com/eslint/espree) 来解析 JavaScript，将代码转换成 AST（抽象语法树），然后去拦截检测是否符合我们规定的书写方式，最后让其展示报错、警告或正常通过。 

ESLint 的核心就是一系列 rules，而 rules 的核心就是利用 AST 来做校验。在 ESLint 中，一切都是可插拔的，每条规则相互独立。

### 架构



![img](https://notes-1312649150.cos.ap-shanghai.myqcloud.com/images/1655048606412-13e73793-b4db-4147-8f27-520db60ccc32-20220629003431360.svg)



这张图是 ESLint [官网](https://eslint.org/docs/developer-guide/architecture/)给出的一个架构图。

- `bin/eslint.js` - 这个是命令行应用程序实际上执行的文件，它仅仅是个封装，用来启动 ESLint，并向`cli`传递命令行参数。
- `lib/api.js` - 这个是`require("eslint")`的入口，导出了一个包含`Linter`、`ESLint`、`RuleTester`和`SourceCode`的对象。
- `lib/cli.js` - 这个是 ESLint CLI 的核心。它接受一个参数数组，然后使用`eslint`执行命令。通过保持这个文件作为一个单独的应用程序，它允许其他人在另外的 Node.js 程序中有效的调用 ESLint，就好像是在命令行上操作的一样。它最重要的函数是`cli.execute()`。它也扮演着读取文件、遍历目录，输入和输出的角色。
- `lib/cli-engine/`：这个模块是 `CLIEngine` 类，它查找源代码文件和配置文件，然后使用 `Linter` 类进行代码验证。这里面包括了配置文件、解析器、插件和格式化程序的加载逻辑。
- `lib/linter/` - 这个模块是基于配置选项进行代码验证的核心 `Linter` 类。这个文件不与控制台交互，没有 I/O。对于其他需要验证 JavaScript 文本的 Node.js 程序，他们将能够直接使用此接口。
- `lib/rule-tester/` - 这个模块是 `RuleTester` 类，它是 Mocha 的包装器，因此可以对规则进行单元测试。这个类让我们可以为每个已实现的规则编写格式一致的测试，并确信每个规则都有效。 RuleTester 接口以 Mocha 为模型，与 Mocha 的全局测试方法一起使用。 RuleTester 也可以修改为与其他测试框架一起使用。
- `lib/source-code/` - 这个模块是 `SourceCode` 类，用于表示解析后的源代码。它接收源代码和代表代码的 AST 节点。
- `lib/rules` - 包含了内置规则

### AST

如果想要深入了解 ESLint 的工作原理，那么 AST 毫无疑问是极其重要的一部分。AST 是源代码语法结构的一种抽象表示，它以树状的形式表现编程语言的语法结构，树上的每个节点都表示源代码的一种结构。

#### AST如何生成

JavaScript 执行的第一步是读取文件中的字符流，然后通过词法分析生成 token，之后再通过语法分析( Parser )生成 AST，最后生成机器码执行。

整个解析过程主要分为以下两个步骤：

- 分词：将整个代码字符串分割成最小语法单元数组
- 语法分析：在分词基础上建立分析语法单元之间的关系

JS Parser 是 JavaScript 语法解析器，它可以将 JavaScript 源码转成 AST，常见的 Parser 有 [Esprima](https://esprima.org/)、[Acorn](https://github.com/acornjs/acorn)。

#### 词法分析

词法分析，也称之为扫描（scanner），简单来说就是调用 `next()` 方法，一个一个字母的来读取字符，然后与定义好的 JavaScript 关键字符做比较，生成对应的 Token。Token 是一个不可分割的最小单元:

例如`var`这三个字符，它只能作为一个整体，语义上不能再被分解，因此它是一个 Token。

词法分析器里，每个关键字是一个 Token ，每个标识符是一个 Token，每个操作符是一个 Token，每个标点符号也都是一个 Token。除此之外，还会过滤掉源程序中的注释和空白字符（换行符、空格、制表符等。

最终，整个代码将被分割进一个 tokens 列表（或者说一维数组）。

#### 语法分析

语法分析会将词法分析出来的 Token 转化成有语法含义的抽象语法树结构。同时，验证语法，语法如果有错的话，抛出语法错误。

[AST Explorer](https://astexplorer.net/) 是一个工具网站，它能查看代码被解析成 AST 的样子。

![img](https://notes-1312649150.cos.ap-shanghai.myqcloud.com/images/1655133484265-d83e7d58-bf6c-41a6-b856-e4248c8fe486.png)

## 编写 ESLint 插件

介绍了原理之后，接下来就是我们的实战部分了。有些时候，已有的 Lint 规则并不能满足项目需求，我们可以根据需求创建自己的规则。

接下来我们以一个简单的需求为例，开发一个属于我们自己的 ESLint 插件。

需求：使用`const`声明基本类型的变量时，变量名不能出现小写字母。

### 初始化项目

想要创建一个 ESLint rule，首先需要创建一个 ESLint 插件。我们在 plugins 部分有提到过，插件是一个以`eslint-plugin`开头的 npm 模块，这是 ESLint 官方规定的。

首先初始化`package.json`，内容如下：

```json
{
  "name": "eslint-plugin-awesome-rules",
  "version": "1.0.0",
  "main": "index.js",
  "author": "dapangmao",
  "license": "MIT"
}
```

### 创建规则

之后在根目录创建一个`index.js`文件，用来存放 rule 的具体逻辑。

```javascript
const hasLowerCase = (str) => /[a-z]/.test(str);
module.exports = {
  rules: {
    'constant-capitalization': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'disallow lowercase alphabets in constants declaration',
        },
      },
      create: function (context) {
        return {
          VariableDeclarator: function (node) {
            if (
              node.parent.kind === 'const' &&
              hasLowerCase(node.id.name) &&
              node.init.type === 'Literal'
            ) {
              context.report(
                node,
                'Please use capitalized casing for constants'
              );
            }
          },
        };
      },
    },
  },
};
```

其实到这里一个基本的插件我们就创建完成了，只包含两个文件：`package.json`和`index.js`。这个插件只提供了一个规则：`constant-capitalization`。下面来详细介绍一下 rule 部分的具体内容。

插件中的每个规则都必须包含两条属性：`meta`和`create`。

- `meta`：元数据，包含了规则的通用信息，比如规则的类型，以及一些用来用来描述规则的信息。
- `create`：一个函数，它将逐个节点访问整个代码的语法树，并让我们对节点进行操作。参数`context`包含与规则上下文相关的信息，这个函数返回一个对象，对象的属性是 AST 中的选择器，ESLint 会收集这些选择器，在 AST 遍历过程中会执行所有监听该选择器的回调。

回到我们的规则本身，为了找到符合条件的节点，我们需要观察代码解析成 AST 的结果，下面的截图是在 [AST Explorer](https://astexplorer.net/) 中输入`const foo = '123';`得到的 AST：

![img](https://notes-1312649150.cos.ap-shanghai.myqcloud.com/images/1655732568596-37a4994d-9603-449f-abfa-b5b4af20daec.png)

通过观察 AST 可以发现通过`node.parent.kind === 'const' && hasLowerCase(node.id.name) && node.init.type === 'Literal'`就可以过滤出符合条件的节点。对于符合条件的节点，调用`context.report`来发布警告或错误（取决于你所使用的配置）。该方法只接收一个参数，是个对象。

### 测试

了解了规则的实现后，让我们通过一个实际的例子，来测试一下我们编写的规则。

首先在当前插件的根目录执行`yarn link`，你会看到下面类似的输出。

![img](https://notes-1312649150.cos.ap-shanghai.myqcloud.com/images/1655735606125-d039e4d9-61ea-446d-a6a1-ac5012a7f3b1.png)

测试项目我们可以继续使用在**安装与使用**章节创建的项目，首先运行`yarn link "eslint-plugin-awesome-rules"`，把这个模块链接到我们编写的的本地插件。之后运行`yarn add eslint-plugin-awesome-rules@link:1.0.0`把插件添加到`package.json`中。

```bash
// 在 eslint-plugin-awesome-rules 根目录中
eslint-plugin-awesome-rules % yarn link

// 在测试项目中
eslint-start % yarn link "eslint-plugin-awesome-rules"
eslint-start % yarn add eslint-plugin-awesome-rules@link:1.0.0
```

我们在前面的 plugins 部分提到过，安装好插件之后，还需要在 ESLint 的配置文件中进行配置。配置好的`.eslintrc.json`文件长这样：

```json
{
  "env": {
    "browser": true,
    "es2021": true
  },
  "plugins": ["awesome-rules"],
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "rules": {
    "awesome-rules/constant-capitalization": "error"
  }
}
```

之后我们把`index.js`文件中的内容改成下面的内容：

```json
const myName = 'dapangmao';
```

运行命令：`yarn run eslint index.js`，就会在控制台看到我们期望的输出：

![img](https://notes-1312649150.cos.ap-shanghai.myqcloud.com/images/1655737631697-c9301413-c3ad-42b7-8e07-413ca004fc7d.png)

至此，一个最简单的 ESLint 插件就创建完成了。

### 使用 Yeoman generator

上面我们通过手动创建项目来编写了一个插件，是为了让示例尽量精简，只专注在规则本身。但是如果我们想把编写的插件发布到 npm，更推荐大家使用 [Yeoman generator](https://github.com/eslint/generator-eslint)。

Yeoman generator 是 ESLint 官方为我们开发 eslint 插件提供的脚手架，用于生成包含指定框架结构的工程化目录结构。

首先全局安装`yo`和`generator-eslint`：

```shell
npm install -g yo generator-eslint
```

创建项目目录，使用命令行初始化项目：

```bash
mkdir eslint-plugin-awesome-rules-yo
cd eslint-plugin-awesome-rules-yo

yo eslint:plugin	# 生成项目骨架
```

命令行会要求你输入一些插件相关的信息，之后会生成一些必要的文件。

如果要创建一个自定义规则，还需要键入下面这个命令，来添加一些创建 rule 相关的文件。

```shell
yo eslint:rule
```

最终的文件结构长这样：

![img](https://notes-1312649150.cos.ap-shanghai.myqcloud.com/images/1655739982120-b37fdca9-aec9-487e-b087-3cc7c08071e2.png)

`lib/rules/constant-capitalization.js`文件的内容长这样（删掉了不必要的注释）：

```javascript
/**
 * @fileoverview disallow lowercase alphabets in constants declaration
 * @author dapangmao
 */
"use strict";

/**
 * @type {import('eslint').Rule.RuleModule}
 */
module.exports = {
  meta: {
    type: null, // `problem`, `suggestion`, or `layout`
    docs: {
      description: "disallow lowercase alphabets in constants declaration",
      category: "Fill me in",
      recommended: false,
      url: null, // URL to the documentation page for this rule
    },
    fixable: null, // Or `code` or `whitespace`
    schema: [], // Add a schema if the rule has options
  },

  create(context) {
    // variables should be defined here
    return {
      // visitor functions for different types of nodes
    };
  },
};
```

可以发现，和我们手动创建插件的文件内容很像，这个文件就是我们编写 rule 逻辑代码的地方。

使用`yo eslint:rule`创建规则时，在`docs`和`tests/lib`文件夹中各有一个和 rule 同名的文件，这是我们写规则文档和测试的地方，如果我们要发布到 npm，文档和完整的测试还是很有必要的。

## 总结

本篇文章到这里就结束了，我们一步步由浅入深，介绍了 ESLint 的基本使用、工作原理、AST以及如何编写一个插件等，希望这篇文章给你带来了一些收货，让你对 ESLint 有了一个更深入的了解！