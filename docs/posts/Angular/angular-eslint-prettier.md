![prettier-eslint-angular.png](https://notes-1312649150.cos.ap-shanghai.myqcloud.com/images/4c45a40adeb84a1187e25c2559654d2e~tplv-k3u1fbpfcp-watermark.png)

在当前版本的 Angular cli 生成的项目中，默认是不包含任何 lint 配置的，所以在多人协作的情况下，由于各自的编辑器配置的代码风格不一样，经常会在提交代码时发现很多改动只是格式上的变化，基于这个问题，我们需要一套统一的 lint 规则，使开发者不需要考虑代码风格的问题。本篇文章将介绍在 Angular 项目中如何配置 **ESLint** 和 **Prettier**，并使用 Husky 和 lint-staged 制定提交规范。

首先安装最新版本的 `@angular/cli`，本篇文章基于以下版本：

```
Angular CLI: 13.2.5
Node: 16.13.0
Package Manager: npm 8.1.0
OS: darwin x64
```

之后创建一个新项目并用 VS Code 打开：

```
ng new angular-seed
cd angular-seed
code .
```

## 安装并配置ESLint

*ESLint* 是一个插件化并且可配置的 JavaScript 语法规则和代码风格的检查工具。ESLint 通过静态分析我们的代码，可以发现问题并修复它们，帮我们轻松写出高质量的 JavaScript 代码。

在这里我并没有选择 `eslint` 和 `@typescript-eslint/eslint-plugin` 的方式，而是使用了 [`@angular-eslint`](https://github.com/angular-eslint/angular-eslint)，它添加了一系列适用于 Angular 的 rules，使我们写出来的 Angular 代码更符合社区标准。

只需要执行下面的命令，`ng add` 会自动安装并且配置好 ESLint。

```
ng add @angular-eslint/schematics
```

> 如果你的项目是基于 tslint 的，@angular-eslint 也可以帮你做迁移，详见 [Migrating an Angular CLI project from Codelyzer and TSLint](https://github.com/angular-eslint/angular-eslint#migrating-an-angular-cli-project-from-codelyzer-and-tslint)

这个命令对项目主要有三个改动：

1.  添加了一系列 devDependencies
1.  添加了 .eslintrc.json 文件
1.  多了一个 lint 命令

具体的改动内容可以查看示例代码的 commit history，每一个步骤都对应一个提交记录。

之后，如果我们的代码有错误，ESLint 就会提示我们。

![](https://notes-1312649150.cos.ap-shanghai.myqcloud.com/images/09e78858d2404753a335b37a5cfb6c50~tplv-k3u1fbpfcp-zoom-1.png)

我们也可以通过 `ng lint` 检查项目中所有的错误，或者 `ng lint --fix` 来自动修复所有可以修复的错误。

## 安装并配置Prettier

虽然 ESLint 也自带一些代码格式的检查，但主要还是针对代码中的错误。我们还需要 Prettier 来更好的格式化我们的代码。

首先我们来安装 Prettier：

```
npm install prettier --save-dev
```

之后创建一个 `.prettierrc.json` 文件并写入一些常见的配置。

```json
{
  "tabWidth": 2,
  "useTabs": false,
  "singleQuote": true,
  "semi": true,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "trailingComma": "es5",
  "bracketSameLine": true,
  "printWidth": 80
}
```

再创建一个 [`prettierignore`](https://prettier.io/docs/en/ignore.html) 文件，把 `gitignore` 文件（如果有）中的内容复制过去。

现在，我们可以使用 Prettier 命令来格式化我们的文件：

```
npx prettier --write .
```

## 将ESLint和Prettier结合

为了将 ESLint 和 Prettier 一起使用，我们还需要安装两个插件。

1.  [`eslint-config-prettier`](https://github.com/prettier/eslint-config-prettier#installation) ：它会关闭所有不必要或者可能与 Prettier 冲突的 ESLint 规则。
1.  [`eslint-plugin-prettier`](https://github.com/prettier/eslint-plugin-prettier) ：它会将 Prettier 作为 ESLint 规则运行。

```
npm install --save-dev eslint-config-prettier
npm install --save-dev eslint-plugin-prettier 
```

之后把 `plugin:prettier/recommended` 添加在 `.eslintrc.json` 中 extends 数组的最后。

```json
{
  "extends": ["plugin:prettier/recommended"]
}
```

这样我们再运行 `ng lint --fix` 的时候，Prettier 的规则也会被执行并且自动 fix。

## 配置HTML模板

此外，如果我们使用了 `eslint-plugin-prettier`，那么还需要添加下面的代码来保证 Angular 的 HTML 模板能够被正常格式化。

**.eslintrc.json**

```json
{
  "root": true,
  "ignorePatterns": ["projects/**/*"],
  "overrides": [
    ...,
    {
      "files": ["*.html"],
      "extends": ["plugin:@angular-eslint/template/recommended"],
      "rules": {}
    },
    {
      "files": ["*.html"],
      "excludedFiles": ["*inline-template-*.component.html"],
      "extends": ["plugin:prettier/recommended"],
      "rules": {
        "prettier/prettier": ["error", { "parser": "angular" }]
      }
    }
  ]
}
```

如果使用 VS Code 并且添加了 `dbaeumer.vscode-eslint` 扩展，那么还需要在 `settings.json` 文件中添加下面的代码：

```json
{
  "eslint.options": {
    "extensions": [".ts", ".html"]
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact",
    "html"
  ]
}

```

## 配置 VS Code

接下来以 VS Code 为例，配置一下自动保存并格式化代码。

首先我们需要安装 ESLint 和 Prettier 扩展，在扩展里搜索 `dbaeumer.vscode-eslint` 和 `esbenp.prettier-vscode` 并安装。

我们也可以把这两个插件添加到推荐的扩展里，在 `extensions.json` 文件中添加这两个扩展，这样其他人 clone 你的代码并在 VS Code 中打开的时候会提示安装这些扩展。

```json
{
  // For more information, visit: https://go.microsoft.com/fwlink/?linkid=827846
  "recommendations": [
    "angular.ng-template",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint"
  ]
}
```

安装好扩展之后，把下面的代码添加到 `settings.json` 文件中。

```json
{
  "[html]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.codeActionsOnSave": {
      "source.fixAll.eslint": true
    },
    "editor.formatOnSave": false
  },
  "[typescript]": {
    "editor.defaultFormatter": "dbaeumer.vscode-eslint",
    "editor.codeActionsOnSave": {
      "source.fixAll.eslint": true
    },
    "editor.formatOnSave": false
  },
}
```

这样每次在我们保存文件的时候，代码都会自动被格式化并保存。

## 配置 Git Hooks

在实际的项目开发中，在提交代码的时候，我们一般会对要提交的文件进行 lint 检查。

1.  安装 [husky](https://github.com/typicode/husky) 和 [lint-staged](https://github.com/okonet/lint-staged)：

    ```
    npm install --save-dev husky lint-staged
    npx husky install
    npm set-script prepare "husky install"
    npx husky add .husky/pre-commit "npm run pre-commit"
    ```

1.  在 `package.json` 的 scripts 中添加：

    ```json
    "pre-commit": "lint-staged --no-stash"
    ```

1.  在 `package.json` 中添加 `lint-staged` 命令：

    ```json
    "lint-staged": {
        "*.{ts,html}": [
          "eslint --fix"
       ]
    }
    ```

这样我们每次提交代码的时候都会先运行 `eslint --fix` 来修复代码中的错误，如果全部修复，代码提交成功，如果自动修复失败，VS Code 会报错，提交失败。

## 总结

到现在为止，我们有了一个比较完整的 lint 配置，至于具体的代码风格和规则，则需要整个团队一起制定了。可以看到，为项目配置 lint 还是比较繁琐的，但是可以为你的团队协作带来很大的收益，大家共用同一套代码规范，不合格的提交也会被扼杀在摇篮里。

值得一提的是，在未来的 Angular 版本中，ESLint 将会是开箱即用的，但是像 Prettier、Husky 和 lint-staged 还是需要你自己来安装。

这就是本文的全部内容了，你可以在 [Github](https://github.com/dapangmaox/angular-seed) 上找到文章中的实例代码，如果对你有帮助，记得点个赞再走～