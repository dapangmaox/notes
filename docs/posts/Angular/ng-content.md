在这篇文章中，我们将会探索如何使用 `ng-content` 进行内容投影，来创建灵活的可复用组件。

## ng-content

`ng-content` 元素是一个用来插入外部或者动态内容的占位符。父组件将外部内容传递给子组件，当 Angular 解析模板时，就会在子组件模板中 `ng-content` 出现的地方插入外部内容。

我们可以使用内容投影来创建可重用的组件。这些组件有相似的逻辑和布局，并且可以在许多地方使用。一般我们在封装一些公共组件的时候经常会用到。

## 不使用内容投影

为了理解为什么要使用 `ng-content` 进行内容投影，首先让我们来创建一个很常见的 button 组件。

btn.component.ts

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-btn',
  templateUrl: './btn.component.html',
  styleUrls: ['./btn.component.scss'],
})
export class BtnComponent {
  constructor() {}

  onClick($event: any) {
    console.log($event);
  }
}

```

btn.component.html

```html
<button (click)=onClick($event)>
  Click Me
</button>
```

在这个组件中，button 的文本始终是 `Click Me`，如果我们想传递不同的文本进来呢？可能你会想到最常使用的 `@Input` 装饰器，但是如果我们不只是想传文本进来，而是传一段 html 进来呢？这个时候就需要用到这篇文章的主角：`ng-content`。

## 单插槽内容投影

内容投影的最基本形式是**单插槽内容投影**。单插槽内容投影是指创建一个组件，我们可以在其中投影一个组件。

要创建使用单插槽内容投影的组件，我们只需要对上面的组件进行一些简单的修改：把 `Click Me` 替换为 `<ng-content></ng-content>`。

btn.component.html

```html
<button (click)=onClick($event)>
  <ng-content></ng-content>
</button>
```

在使用 btn 组件的地方：

```
<app-btn>Cancel</app-btn>
<app-btn><b>Submit</b></app-btn>
```

在 `<app-btn></app-btn>` 中的内容会传递给 btn 组件，并且显示在 `ng-contnet` 中。

## 多插槽内容投影

上面的 btn 组件非常简单，但实际上`ng-content` 要比这个更强大。一个组件可以具有多个插槽，每个插槽可以指定一个 CSS 选择器，该选择器会决定将哪些内容放入该插槽。该模式称为**多插槽内容投影**。使用此模式，我们必须指定希望投影内容出现在的位置。可以通过使用 `ng-content` 的 `select` 属性来完成此任务。

要创建使用多插槽内容投影的组件，需要执行以下操作：

1. 创建一个组件。
2. 在组件模板中，添加 `ng-content` 元素，让你希望投影的内容出现在其中。
3. 将 `select` 属性添加到 `ng-content` 元素。 Angular 使用的选择器支持标签名、属性、CSS 类和 `:not` 伪类的任意组合。

下面我们来创建一个复杂一些的 card 组件。

card.component.html

```html
<div class="card">
  <div class="header">
    <ng-content select="header"></ng-content>
  </div>
  <div class="content">
    <ng-content select="content"></ng-content>
  </div>
  <div class="footer">
    <ng-content select="footer"></ng-content>
  </div>
</div>
```

在使用 card 组件的地方：

app.component.html

```html
<app-card>
  <header>
    <h1>Angular</h1>
  </header>
  <content>One framework. Mobile & desktop.</content>
  <footer><b>Super-powered by Google </b></footer>
</app-card>

<app-card>
  <header>
    <h1 style="color:red;">React</h1>
  </header>
  <content>A JavaScript library for building user interfaces</content>
  <footer><b>Facebook Open Source </b></footer>
</app-card>
```

如果在 `app-card` 中有不属于 header, content, footer 之外的内容呢？比如按照下面的写法使用 `app-card` 组件：

app.component.html

```html
<app-card>
  <header>
    <h1>Angular</h1>
  </header>
  <div>Not match any selector</div>
  <content>One framework. Mobile & desktop.</content>
  <footer><b>Super-powered by Google </b></footer>
  <div>This text will not not be shown</div>
</app-card>
```

会发现两个 `div` 都没有渲染在页面中，为了解决这个问题，我们可以在组件中添加一个没有任何 `selector` 的 `ng-content` 标签。所有没办法匹配到任何其他插槽的内容都会被渲染在这个里面。

card.component.html

```html
<div class="card">
  <div class="header">
    <ng-content select="header"></ng-content>
  </div>
  <div class="content">
    <ng-content select="content"></ng-content>
  </div>
  <div class="footer">
    <ng-content select="footer"></ng-content>
  </div>
  <ng-content></ng-content>
</div>
```

## ngProjectAs

在某些情况下，我们需要使用 `ng-container` 把一些内容包裹起来传递到组件中。大多数情况是因为我们需要使用结构型指令像 `ngIf` 或者 `ngSwitch` 等。比如只有在某些情况下才向 card 组件传递 header。

在下面的例子中，我们将 header 包裹在了 `ng-container` 中。

```html
<app-card>
  <ng-container>
    <header>
      <h1>Angular</h1>
    </header>
  </ng-container>
  <content>One framework. Mobile & desktop.</content>
  <footer><b>Super-powered by Google </b></footer>
</app-card>
```

由于 `ng-container` 的存在，header 部分并没有被渲染到我们想要渲染的插槽中，而是渲染到了没有提供任何 selector 的 `ng-content` 中。

在这种情况下，我们可以使用 `ngProjectAs` 属性。

在上面的 `ng-container` 加上这个属性，就可以按照我们的期望来渲染了。

```html
<app-card>
  <ng-container ngProjectAs='header'>
    ...
</app-card>
```