在 Angular 中使用一些第三方 UI 库的时候，为了满足业务需求，经常会遇到需要通过 `ng-template` 来传递一些自定义的模板到第三方组件中的情况。比如 `ngx-bootstrap` 的 `Tabs` 组件，可以自定义 `tab` 的模板。

```html
<div>
  <tabset>
    <tab>
      <ng-template tabHeading>
        <i><b>Tab 3</b></i>
      </ng-template>
      Tab with html tags in heading
    </tab>
  </tabset>
</div>
```

今天这篇文章会探究一下背后的原理，并且一步步实现一个类似功能的组件。

## Counter 组件

首先创建一个最基本的 Counter 组件。这个组件展示当前的值并且可以执行递增和递减的操作。此外，还可以自定义初始值，并且在值更改时发出事件。

初始代码如下：

```typescript
import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';

@Component({
  selector: 'app-counter',
  templateUrl: './counter.component.html',
  styleUrls: ['./counter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CounterComponent {
  @Input() value = 0;
  @Output() changed = new EventEmitter<number>();

  increment() {
    this.updateValue('inc');
  }

  decrement() {
    this.updateValue('dec');
  }

  private updateValue(action: 'inc' | 'dec') {
    const delta = action === 'inc' ? 1 : -1;
    this.value += delta;
    this.changed.emit(this.value);
  }
}

```

html 内容如下：

```html
<h2>Counter</h2>
<p class="mb-3">{{ value }}</p>
<div class="btns">
  <button class="mr-3" (click)="increment()">inc</button>
  <button (click)="decrement()">dec</button>
</div>

```

## 可配置模板

在 Angular 中，可以借助 `ng-template` 元素创建视图模板。 生成模板后，可以借助内容投影（content projection）将其传递给可重用组件，最终我们会通过下面的写法来使用组件：

```html
<app-custom-counter title="Fancy counter">
  <ng-template appCounterValue let-value>
    <span class="mr-2">Current value: {{value}}</span>
    <i class="fa fa-arrow-left"></i>
  </ng-template>

  <ng-template appCounterIncBtn let-increment>
    <button class="btn btn-success" (click)="increment()">
      inc <i class="fa fa-arrow-up"></i>
    </button>
  </ng-template>

  <ng-template appCounterDecBtn let-decrement>
    <button class="btn btn-danger" (click)="decrement()">
      dec <i class="fa fa-arrow-down"></i>
    </button>
  </ng-template>
</app-custom-counter>
```

通过上面的写法可以看出，每个视图模板都有自己的指令，因此我们可以区分每个 `ng-template` 属于组件的哪一部分。

首先来实现上面的三个指令，每个指令的内容都很简单：只需要公开一个对视图模板的引用。

```typescript
export interface CounterValueTplContext {
  $implicit: number;
}

export interface CounterBtnTplContext {
  $implicit: () => void;
}

```

```typescript
import { Directive, TemplateRef } from '@angular/core';
import { CounterValueTplContext } from './custom-counter.component';

@Directive({
  selector: '[appCounterValue]',
})
export class CounterValueDirective {
  constructor(readonly tpl: TemplateRef<CounterValueTplContext>) {}
}

```

```typescript
import { Directive, TemplateRef } from '@angular/core';
import { CounterBtnTplContext } from './custom-counter.component';

@Directive({
  selector: '[appCounterIncBtn]',
})
export class CounterIncBtnDirective {
  constructor(readonly tpl: TemplateRef<CounterBtnTplContext>) {}
}

```

```typescript
import { Directive, TemplateRef } from '@angular/core';
import { CounterBtnTplContext } from './custom-counter.component';

@Directive({
  selector: '[appCounterDecBtn]',
})
export class CounterDecBtnDirective {
  constructor(readonly tpl: TemplateRef<CounterBtnTplContext>) {}
}

```

接下来，我们可以在组件中使用 `ContentChild` 装饰器获取对视图模板的引用，第一个参数是指令的类名：

```typescript
import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  ContentChild,
  TemplateRef,
} from '@angular/core';

import { CounterValueDirective } from './counter-value.directive';
import { CounterIncBtnDirective } from './counter-inc-btn.directive';
import { CounterDecBtnDirective } from './counter-dec-btn.directive';

@Component({
  selector: 'app-custom-counter',
  templateUrl: './custom-counter.component.html',
  styleUrls: ['./custom-counter.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomCounterComponent {
  @ContentChild(CounterValueDirective, { static: true })
  counterValueDir!: CounterValueDirective;
  @ContentChild(CounterIncBtnDirective, { static: true })
  counterIncBtnDir!: CounterIncBtnDirective;
  @ContentChild(CounterDecBtnDirective, { static: true })
  counterDecBtnDir!: CounterDecBtnDirective;

  @Input() title = 'Counter';
  @Input() value = 0;
  @Output() changed = new EventEmitter<number>();

  get counterValueTpl(): TemplateRef<CounterValueTplContext> {
    return this.counterValueDir?.tpl;
  }

  get counterIncBtnTpl(): TemplateRef<CounterBtnTplContext> {
    return this.counterIncBtnDir?.tpl;
  }

  get counterDecBtnTpl(): TemplateRef<CounterBtnTplContext> {
    return this.counterDecBtnDir?.tpl;
  }

  get counterValueTplContext(): CounterValueTplContext {
    return { $implicit: this.value };
  }

  get counterIncBtnTplContext(): CounterBtnTplContext {
    return { $implicit: () => this.increment() };
  }

  get counterDecBtnTplContext(): CounterBtnTplContext {
    return { $implicit: () => this.decrement() };
  }

  increment() {
    this.updateValue('inc');
  }

  decrement() {
    this.updateValue('dec');
  }

  private updateValue(action: 'inc' | 'dec') {
    const delta = action === 'inc' ? 1 : -1;
    this.value += delta;
    this.changed.emit(this.value);
  }
}

```

除了获取模板的 `getter` 之外，还有一些传递给视图模板的上下文对象的 `getter`，用来给 `ng-template` 传递数据。

最后在 `html` 模板中，我们通过 `NgTemplateOutlet` 指令，将视图模板渲染在组件的适当位置。在大多数第三方 UI 库中，如果没有传递自定义模板，就会使用默认的模板。

```html
<h2>{{title}}</h2>
<div class="mb-3">
  <ng-container *ngTemplateOutlet="counterValueTpl || defaultValueTpl; context:counterValueTplContext">
  </ng-container>
</div>
<div class="d-flex justify-content-center">
  <div class="mr-3">
    <ng-container *ngTemplateOutlet="counterIncBtnTpl || defaultIncBtnTpl; context:counterIncBtnTplContext">
    </ng-container>
  </div>
  <div>
    <ng-container *ngTemplateOutlet="counterDecBtnTpl || defaultDecBtnTpl; context:counterDecBtnTplContext">
    </ng-container>
  </div>
</div>

<ng-template #defaultValueTpl>
  {{value}}
</ng-template>

<ng-template #defaultIncBtnTpl>
  <button (click)="increment()">inc</button>
</ng-template>

<ng-template #defaultDecBtnTpl>
  <button (click)="decrement()">dec</button>
</ng-template>
```

到这里我们就基本实现了一个可以自定义模板的可重用 Angular 组件。

## 扩展

## ng-template

在上面的实现中，传递给 `ng-template` 的 `context` 返回了一个对象：

```typescript
  get counterValueTplContext(): CounterValueTplContext {
    return { $implicit: this.value };
  }
```

这个对象的 `$implicit` 属性就是 `let-value` 对应的变量。我们也可以传递多个对象，比如;

```typescript
get counterValueTplContext(): CounterValueTplContext {
  return { $implicit: this.value, unit: 'million' };
}
```

```html
<ng-template appCounterValue let-value let-unit='unit'>
  <span class="mr-2">Current value: {{ value }} {{ unit }}</span>
  <i class="fa fa-arrow-left"></i>
</ng-template>
```

其中，`let-value` 没有赋值，会被自动赋值为 `$implicit` 的值。`unit` 对应返回的上下文对象中的 `unit` 属性。

## 使用 * Syntax

如果只需要传递一个值到 `ng-template`，可以使用更简化的语法：

```html
<ng-container *appCounterValue="let value">
  <span class="mr-2">Current value: {{value}}</span>
  <i class="fa fa-arrow-left"></i>
</ng-container>
```

## string token

在给 `ContentChild` 装饰器传递第一个参数的时候，也可以传递一个字符串，这个字符串必须是唯一的模板引用变量。

```html
// counter component class
@ContentChild('counterValue', { static: true, read: TemplateRef }) counterValueTpl: TemplateRef<any>;
  
// parent component view
<app-custom-counter title="Fancy counter">
  <ng-template #counterValue let-value>
    <div>
      <span class="mr-2">Current value: {{value}}</span> 
      <i class="fa fa-arrow-left"></i>
    </div>
  </ng-template>
  
  ...
</app-custom-counter>
```

## 结论

在 Angular 中，针对不同的需求场景可以有多种解决方案。如果我们想重用组件的布局，使用这种方式是比较合适的。如果仅仅是想通过内容投影来传递组件，那么使用组件惰性实例化可能是更好的方式。在实际开发中，需要根据不同的场景选择合适的实现。

参考链接：

[Reusable components with configurable templates in Angular](https://medium.com/javascript-everyday/reusable-components-with-configurable-templates-in-angular-3c55741c97f3)

[How to use ng-template & TemplateRef in Angular](https://www.tektutorialshub.com/angular/ng-template-in-angular)

[What is let-* in Angular 2 templates?](https://stackoverflow.com/questions/42978082/what-is-let-in-angular-2-templates)