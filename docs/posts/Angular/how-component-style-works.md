在开发 Angular 组件的过程中，我们习惯把组件的样式写在对应的 css 文件中，但是一直不了解 Angular 是怎样做到样式隔离的，比如在 A 组件中写了 `h1 { color: red }`，这个样式只会在 A 组件中生效，而不会影响到其他的组件。为了探究原理，就有了这篇文章，以下内容基于 Angular CLI 10.1.1 版本创建。

## 探索

首先用 Angular CLI 创建一个新的 Angular 项目，删除 `app.component.html` 中的所有内容，替换成如下内容：

```html
<h1>App Component</h1>
<button class="red-button">Button</button>
```

在 `app.component.css` 中添加如下内容：

```css
.red-button {
  color: red;
}
```

运行时有如下 html 代码：

```html
<app-root _nghost-ydo-c11="" ng-version="10.1.1">
  <h2 _ngcontent-ydo-c11="">App component</h2>
  <button _ngcontent-ydo-c11="" class="red-button">Button</button>
</app-root>
```

可以看到在在 `app-root` 元素上有一个名为 `_nghost-ydo-c11` 的属性（property），`app-root` 里面的两个元素都有一个名为 `_ngcontent-ydo-c11` 的属性。

那么这些属性是用来做什么的呢？

为了更好的理解，我们先创建一个独立的组件，新建文件 `blue-button.component.ts`，内容如下：

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-blue-button',
  template: `
    <h2>Blue button component</h2>
    <button class="blue-button">Button</button>
  `,
  styles: [`
    .blue-button {
      background: blue;
    }
  `]
})
export class BlueButtonComponent {}

```

放到 `app.component.html` 中运行后，会看到如下 html 代码：

![](https://notes-1312649150.cos.ap-shanghai.myqcloud.com/images/aaf1156476bc41e8b3f1ffe898c5a053~tplv-k3u1fbpfcp-zoom-1.png)

可以看到 `app-blue-button` 中也有一个以 `_nghost-xxx` 开头的属性，还有一个和 `app-root` 中其他元素相同的属性。而在组件里面的两个元素都有名为 `_ngcontent-yke-c11` 的属性。

> 由于每次运行，Angular 生成的属性字符串都是随机的，所以后面的代码如果出现了类似的属性都是按照这个截图对应的。

## 总结

通过观察我们可以总结出：

- 每个组件的宿主元素都会被分配一个唯一的属性，具体取决于组件的处理顺序，在例子中就是 `_nghost_xxx` 
- 每个组件模板中的每个元素还会被分配一个该组件特有的属性，在例子中就是 `_ngcontent_xxx` 

那么这些属性是怎样用于样式隔离的呢？

这些属性可以和 CSS 结合起来，比如当我们查看例子中蓝色按钮的样式时，会看到这样的 css：

```css
.blue-button[_ngcontent-yke-c11] {
    background: blue;
}
```

可以看出，Angular 通过这种方式使 `blue-button` 类只能应用于有这个属性的元素上，而不会影响到其他组件中的元素。

知道了 Angular 对样式隔离的行为，那么 Angular 又是如何做到这些的呢？

在应用启动时，Angular 将通过 styles 或 styleUrls 组件属性来查看哪些样式与哪些组件相关联。之后Angular 会将这些样式和该组件中元素特有的属性应用到一起，将生成的 css 代码包裹在一个 style 标签中并放到 header 里。

![](https://notes-1312649150.cos.ap-shanghai.myqcloud.com/images/aa851e4ba92140a8a6af72c2a3399cee~tplv-k3u1fbpfcp-zoom-1.png)

以上就是 Angular 样式封装的原理。

# :host, :host-context, ::ng-deep 

在实际开发中，这种机制有时候并不能完全匹配我们的需求，针对这种情况， Angular 引入了几种特殊的选择器。

### :host

使用 :host 伪类选择器，用来作用于组件（宿主元素）本身。

比如，当我们想给 `app-blue-button` 加个边框时，可以在这个组件的样式中添加如下代码：

```css
:host {
  display: block;
  border: 1px solid red;
}
```

通过查看运行时的代码，可以看到如下代码块：

```html
  <style>
    [_nghost-yke-c11] {
      display: block;
      border: 1px solid red;
    }
  </style>
```

### :host-context

有时候，基于某些来自组件视图*外部*的条件应用样式是很有用的。 例如，在文档的 `<body>` 元素上可能有一个用于表示样式主题 (theme) 的 CSS 类，你应当基于它来决定组件的样式。

这时可以使用 `:host-context()` 伪类选择器。它也以类似 `:host()` 形式使用。它在当前组件宿主元素的*祖先节点*中查找 CSS 类， 直到文档的根节点为止。在与其它选择器组合使用时，它非常有用。

在下面的例子中，会根据祖先元素的 CSS 类是 `blue-theme` 还是 `red-theme` 来决定哪个 CSS 会生效。

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-btn-theme',
  template: `
    <button class="btn-theme">Button</button>
  `,
  styles: [`
    :host-context(.blue-theme) .btn-theme {
      background: blue;
    }
    :host-context(.red-theme) .btn-theme {
      background: red;
    }
  `]
})
export class BtnThemeComponent { }

```

然后在使用的地方：

```html
<div class="blue-theme">
  <app-btn-theme></app-btn-theme>
</div>
```

在运行的时候按钮背景就是蓝色的。

### ::ng-deep

我们经常会使用一些第三方 UI 库，有时候我们想改变第三方组件的一些样式，这时候可以使用 ::ng-deep，但是要注意，Angular 已经把这个特性标记为已废弃了，可能在未来的版本就被完全移除掉。

```css
:host ::ng-deep h2 {
  color: yellow;
}
```

通过查看运行时的代码：

```css
[_nghost-yke-c12] h2 {
    color: yellow;
}
```

可以看到，样式会作用在 `app-root` 里的所有元素上，包括 `app-root` 中使用的其他组件里的元素。

### 总结

在实际开发中，灵活使用以上几种方式，基本上可以满足大部分场景。