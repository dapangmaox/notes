# 类型收窄（Narrowing）

TypeScript 的类型检查器会考虑到类型保护和赋值语句，而这个**将类型推导为更精确类型的过程，我们称之为收窄 (narrowing)**。

下面我们来介绍类型收窄的几种具体情况。

## typeof 类型保护（type guards）

JavaScript 本身就提供了`typeof`操作符，可以返回运行时一个值的基本类型信息，会返回如下这些特定的字符串：

- "string"
- "number"
- "bigInt"
- "boolean"
- "symbol"
- "undefined"
- "object"
- "function"

`typeof` 操作符在很多 JavaScript 库中都有着广泛的应用，而 TypeScript 已经可以做到理解并在不同的分支中将类型收窄。

在 TypeScript 中，检查 `typeof` 返回的值就是一种类型保护。TypeScript 知道 `typeof` 不同值的结果，它也能识别 JavaScript 中一些怪异的地方，就比如在上面的列表中，`typeof` 并没有返回字符串 `null`，看下面这个例子：

```typescript
function printAll(strs: string | string[] | null) {
  if (typeof strs === 'object') {
    for (const s of strs) {
      // Object is possibly 'null'.
      console.log(s);
    }
  } else if (typeof strs === 'string') {
    console.log(strs);
  } else {
    // do nothing
  }
}
```

在这个 `printAll` 函数中，我们尝试判断 `strs` 是否是一个对象，原本的目的是判断它是否是一个数组类型，但是在 JavaScript 中，`typeof null` 也会返回 `object`。而这是 JavaScript 一个不幸的历史事故。

熟练的用户自然不会感到惊讶，但也并不是所有人都如此熟练。不过幸运的是，TypeScript 会让我们知道 `strs` 被收窄为 `strings[] | null `，而不仅仅是 `string[]`。

## 真值收窄（Truthiness narrowing）

在 JavaScript 中，我们可以在条件语句中使用任何表达式，比如 && 、||、! 等，举个例子，像 if 语句就不需要条件的结果总是 boolean 类型。

这是因为 JavaScript 会做隐式类型转换，像 0 、NaN、""、0n、nullundefined 这些值都会被转为 false，其他的值则会被转为 true。

这种使用方式非常流行，尤其适用于防范 null 和 undefiend 这种值的时候。举个例子，我们可以在 printAll 函数中这样使用：

```typescript
export const printAll = (strs: string | string[] | null) => {
  if (strs && typeof strs === 'object') {
    // 这里的 strs 并不会出现为 null 的情况， 因为上面首先判断了 strs 本身，null 为 false
    for (const s of strs) {
      console.log(s);
    }
  } else if (typeof strs === 'string') {
    console.log(strs);
  }
};
```

## 等值收窄（Equality narrowing）

Typescript 也会使用 switch 语句和等值检查比如 `==` `!==` `==` `!=` 去收窄类型。比如：

```typescript
export const func = (x: number | string, y: string | boolean) => {
  if (x === y) {
    x.toLowerCase();
    y.toLocaleLowerCase();
  }
};
```

在这个例子中，我们判断了 x 和 y 是否完全相等，如果完全相等，那他们的类型肯定也完全相等。而 string 类型就是 x 和 y 唯一可能的相同类型。所以在第一个分支里，x 和 y 就一定是 string 类型。

## in 操作符收窄

JavaScript 中有一个 in 操作符可以判断一个对象是否有对应的属性名。TypeScript 也可以通过这个收窄类型。

举个例子，在 "value" in x 中，"value" 是一个字符串字面量，而 x 是一个联合类型：

```typescript
type Fish = { swim: () => void };
type Bird = { fly: () => void };

function move(animal: Fish | Bird) {
  if ('swim' in animal) {
    return animal.swim();
    // (parameter) animal: Fish
  }

  return animal.fly();
  // (parameter) animal: Bird
}
```

## instanceof 收窄

instanceof 也是一种类型保护，TypeScript 也可以通过识别 instanceof 正确的类型收窄：

```typescript
function logValue(x: Date | string) {
  if (x instanceof Date) {
    console.log(x.toUTCString());
  } else {
    console.log(x.toUpperCase());
  }
}
```

## 赋值语句（Assignments）

在给一个没有声明过类型的变量直接赋值时，TypeScript 查看等号的右侧并适当地收窄左侧的类型。

```typescript
// TypeScript 会自动推断 x 为联合类型 string | number
// let x: string | number
let x = Math.random() < 0.5 ? 10 : 'hello world!';

x = 1;

// 执行完 x = 1 后，x 收窄为 number 类型
// let x: number
console.log(x);

x = 'goodbye!';

// 执行完 x = 'goodbye!'，x 又收窄为 string 类型
// let x: string
console.log(x);

// 但是在等号左边的 x，始终为 string | number 类型，所以不能赋值成其他类型，下面这句代码报错
x = true;
```

## 控制流分析（Control flow analysis）

至此我们已经讲了 TypeScript 中一些基础的收窄类型的例子，现在我们看看在 `if` `while`等条件控制语句中的类型保护，举个例子：

```typescript
export const example = () => {
  let x: string | number | boolean;

  x = Math.random() < 0.5;

  // TypeScript 根据上一句赋值推断现在的 x 为 boolean 类型
  // let x: boolean
  console.log(x);

  if (Math.random() < 0.5) {
    x = 'hello';
    // let x: string
    console.log(x);
  } else {
    x = 100;
    // let x: number
    console.log(x);
  }

  // 在最后返回的时候，TypeScript 又会把 x 可能出现的类型合并
  // let x: string | number
  return x;
};
```

这种基于**可达性**(**reachability**) 的代码分析就叫做控制流分析(control flow analysis)。在遇到类型保护和赋值语句的时候，TypeScript 就是使用这样的方式收窄类型。

## never

比如在定义一个`switch`语句的时候，可以在`default`语句分支这样写。

```typescript
interface Circle {
  kind: 'circle';
  radius: number;
}

interface Square {
  kind: 'square';
  sideLength: number;
}

type Shape = Circle | Square;

function getArea(shape: Shape) {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2;
    case 'square':
      return shape.sideLength ** 2;
    default: {
      const exhaustiveCheck: never = shape;
      return exhaustiveCheck;
    }
  }
}
```

当我们添加了一个新类型`Triangle`的时候，default 语句分支就会报错`Type 'Triangle' isnotassignable to type 'never'.`可以帮助我们捕获一些由于`Switch`分支没有定义完整的错误。

```typescript
interface Triangle {
  kind: 'triangle';
  sideLength: number;
}

type Shape = Circle | Square | Triangle;

function getArea(shape: Shape) {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2;
    case 'square':
      return shape.sideLength ** 2;
    default: {
      // Type 'Triangle' is not assignable to type 'never'.
      const _exhaustiveCheck: never = shape;
      return _exhaustiveCheck;
    }
  }
}
```
