# Functions

TypeScript 有很多方法来描述如何调用函数，这部分主要学习编写描述函数的类型。

## 函数类型表达式（Function Type Expressions）

最简单的就是函数类型表达式，在语法上类似于箭头函数：

```typescript
export const greeter = (fn: (a: string) => void) => {
  fn('Hello World');
};
```

语法`(a: string) => void`表示一个函数有一个名为`a`，类型为字符串的参数，这个函数没有返回值。

当然，我们也可以使用类型别名（type alias）定义一个函数类型：

```typescript
type GreetFunction = (a: string) => void;
function greeter(fn: GreetFunction) {
  // ...
}
```

## 调用签名（Call Signatures）

在 JavaScript 中，函数除了可以被调用，自己也是可以有属性值的。然而上一节讲到的函数类型表达式并不能支持声明属性，如果我们想描述一个带有属性的函数，我们可以在一个对象类型中写一个调用签名（call signature）。

```typescript
type DescribableFunction = {
  description: string;
  (someArg: number): boolean;
};
function doSomething(fn: DescribableFunction) {
  console.log(fn.description + ' returned ' + fn(6));
}
```

注意这个语法跟函数类型表达式稍有不同，在参数列表和返回的类型之间用的是 `:` 而不是 `=>`。

## 构造签名 （Construct Signatures）

JavaScript 函数也可以使用 `new` 操作符调用，当被调用的时候，TypeScript 会认为这是一个构造函数(constructors)，因为他们会产生一个新对象。你可以写一个构造签名，方法是在调用签名前面加一个 `new` 关键词：

```typescript
type SomeConstructor = {
  new (s: string): SomeObject;
};
function fn(ctor: SomeConstructor) {
  return new ctor('hello');
}
```

一些对象，比如 `Date` 对象，可以直接调用，也可以使用 `new` 操作符调用，而你可以将调用签名和构造签名合并在一起：

```typescript
interface CallOrConstruct {
  new (s: string): Date;
  (n?: number): number;
}
```

## 泛型函数 （Generic Functions）

我们经常需要写这种函数，即函数的输出类型依赖函数的输入类型，或者两个输入的类型以某种形式相互关联。在 TypeScript 中，泛型就是被用来描述两个值之间的对应关系。我们需要在函数签名里声明一个**类型参数 (type parameter)**：

```typescript
function firstElement<Type>(arr: Type[]): Type | undefined {
  return arr[0];
}
```

通过给函数添加一个类型参数 `Type`，并且在两个地方使用它，我们就在函数的输入(即数组)和函数的输出(即返回值)之间创建了一个关联。现在当我们调用它，一个更具体的类型就会被判断出来：

```typescript
// s is of type 'string'
const s = firstElement(['a', 'b', 'c']);
// n is of type 'number'
const n = firstElement([1, 2, 3]);
// u is of type undefined
const u = firstElement([]);
```

### 推断（Inference）

注意在上面的例子中，我们没有明确指定 `Type` 的类型，类型是被 TypeScript 自动推断出来的。

我们也可以使用多个类型参数，举个例子：

```typescript
function map<Input, Output>(
  arr: Input[],
  func: (arg: Input) => Output
): Output[] {
  return arr.map(func);
}

// Parameter 'n' is of type 'string'
// 'parsed' is of type 'number[]'
const parsed = map(['1', '2', '3'], (n) => parseInt(n));
```

注意在这个例子中，TypeScript 既可以推断出 Input 的类型 （从传入的 `string` 数组），又可以根据函数表达式的返回值推断出 `Output` 的类型。

### 约束（Constraints）

有的时候，我们想关联两个值，但只能操作值的一些固定字段，这种情况，我们可以使用**约束（constraint）**对类型参数进行限制。

让我们写一个函数，函数返回两个值中更长的那个。为此，我们需要保证传入的值有一个 `number` 类型的 `length` 属性。我们使用 `extends` 语法来约束函数参数：

```typescript
function longest<Type extends { length: number }>(a: Type, b: Type) {
  if (a.length >= b.length) {
    return a;
  } else {
    return b;
  }
}

// longerArray is of type 'number[]'
const longerArray = longest([1, 2], [1, 2, 3]);
// longerString is of type 'alice' | 'bob'
const longerString = longest('alice', 'bob');
// Error! Numbers don't have a 'length' property
const notOK = longest(10, 100);
// Argument of type 'number' is not assignable to parameter of type '{ length: number; }'.
```

TypeScript 会推断 `longest` 的返回类型，所以返回值的类型推断在泛型函数里也是适用的。

正是因为我们对 `Type` 做了 `{ length: number }` 限制，我们才可以被允许获取 `a` `b`参数的 `.length` 属性。没有这个类型约束，我们甚至不能获取这些属性，因为这些值也许是其他类型，并没有 length 属性。

基于传入的参数，`longerArray`和 `longerString` 中的类型都被推断出来了。记住，所谓泛型就是用一个相同类型来关联两个或者更多的值。

### 声明类型参数 （Specifying Type Arguments）

TypeScript 通常能自动推断泛型调用中传入的类型参数，但也并不能总是推断出。举个例子，有这样一个合并两个数组的函数：

```typescript
function combine<Type>(arr1: Type[], arr2: Type[]): Type[] {
  return arr1.concat(arr2);
}
```

如果你像下面这样调用函数就会出现错误：

```typescript
const arr = combine([1, 2, 3], ['hello']);
// Type 'string' is not assignable to type 'number'.
```

而如果你执意要这样做，你可以手动指定 `Type`：

```typescript
const arr = combine<string | number>([1, 2, 3], ['hello']);
```

## 编写良好泛型函数的指南

有太多类型参数或在不需要它们的地方使用约束会使推理不太成功，让函数的调用者感到沮丧。

### 使用更少的类型参数

比较下面的两个函数：

```typescript
export const filter1 = <T>(arr: T[], func: (arg: T) => boolean): T[] => {
  return arr.filter(func);
};

export const filter2 = <T, Func extends (arg: T) => boolean>(
  arr: T[],
  func: Func
): T[] => {
  return arr.filter(func);
};

const arr = [1, 2, 3, 4, 5];

const filteredArr1 = filter1(arr, (v) => v % 2 === 0);
const filteredArr2 = filter2(arr, (v) => v % 2 === 0);
```

我们创建了一个`Func`不关联两个值的类型参数，而`Func`除了使函数更难阅读和推理之外，什么也没做。

### 类型参数应该出现两次

有时我们的函数并不需要泛型，类型参数用于关联多个值的类型，如果一个类型参数只在函数签名中使用一次，就不需要用到。

## 可选参数

我们可以使用`?`来把参数标记为可选。

```typescript
export const func = (x?: number) => {
  return x;
};
```

在可选参数情况下，尽管参数被指定为`number`，但`x`参数实际上的类型为`number | undefined`，因为 JavaScript 中未指定的参数会获取值`undefined`。

或者可以给参数提供一个`default`值：

```typescript
export const func = (x = 1) => {
  return x;
};
```

函数主体中的`x`的类型就会为`number`，因为任何`undefined`的参数都会被替换为`1`。

当参数是可选时，调用者总是可以传入`undefined`。

## 函数重载

在 TypeScript 中，我们可以通过编写重载签名来指定一个可以以不同方式调用的函数。为了实现重载，我们会编写两个或多个函数签名，然后是函数的主体。

```typescript
export function makeDate(timestamp: number): Date;
export function makeDate(m: number, d: number, y: number): Date;
export function makeDate(mOrTimestamp: number, d?: number, y?: number): Date {
  if (d !== undefined && y !== undefined) {
    return new Date(y, mOrTimestamp, d);
  } else {
    return new Date(mOrTimestamp);
  }
}

const d1 = makeDate(123456);
const d2 = makeDate(5, 5, 5);
// No overload expects 2 arguments, but overloads do exist that expect either 1 or 3 arguments.
const d3 = makeDate(1, 3);
```

在这个例子中，我们写了两个重载，一个接受一个参数，另一个接受三个参数。前两个签名称为**重载签名**。

然后，我们编写了一个具有兼容签名的函数实现。函数有一个实现签名，但是这个签名不能直接调用，即使我们在后面声明了两个可选参数，但是也不能用两个参数调用它。

在实际使用中，尽量使用联合类型的参数而不是重载。

## 其他需要了解的类型

在使用函数类型时，经常会见到以下类型。

### void

`void`表示不返回值的函数值。

在 JavaScript 中，不返回任何值的函数将隐式返回`undefined`，但是`void`和`undefined`在 TypeScript 中并不是一回事。

### object

特殊类型`object`是指任何不是原始值（`string`、`number`、`bigint`、`boolean`、`symbol`、`null`或`undefined`）的值。

`object`不是`Object`！

### unknown

`unknown`类型代表任何值，类似于`any`，但更安全，因为用类型为`unknown`的值做任何事情都是不合法的。

```typescript
function f1(a: any) {
  a.b(); // OK
}
function f2(a: unknown) {
  // Object is of type 'unknown'.
  a.b();
}
```

### never

有些函数永远不返回值，`never`类型表示从未观察到的值。

## Rest Parameters 和 Arguments

### Rest Parameters

除了使用可选参数和重载，我们还可以使用剩余参数来定义接受无限数量参数的函数。

```typescript
export const multiply = (n: number, ...m: number[]) => {
  return m.map((x) => x * n);
};

const res = multiply(10, 1, 2, 3, 4);
console.log(res);
```

### Rest Arguments

相反，我们可以使用扩展语法从数组中提供一些参数。

```typescript
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];
const res = arr1.push(...arr2);
```
