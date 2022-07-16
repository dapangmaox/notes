# 对象类型（Object Types）

在 JavaScript 中，最基本的将数据成组和分发的方式就是通过对象。在 TypeScript 中，我们通过对象类型（object types）来描述对象。

对象类型可以是匿名的：

```typescript
function greet(person: { name: string; age: number }) {
  return 'Hello ' + person.name;
}
```

也可以使用接口进行定义：

```typescript
interface Person {
  name: string;
  age: number;
}

function greet(person: Person) {
  return 'Hello ' + person.name;
}
```

或者通过类型别名：

```typescript
type Person = {
  name: string;
  age: number;
};

function greet(person: Person) {
  return 'Hello ' + person.name;
}
```

## 属性修饰符（Property Modifiers）

对象类型中的每个属性可以说明它的类型、属性是否可选、属性是否只读等信息。

### 可选属性（Optional Properties）

我们可以在属性名后面加一个 `?` 标记表示这个属性是可选的：

```typescript
interface PaintOptions {
  shape: Shape;
  xPos?: number;
  yPos?: number;
}

function paintShape(opts: PaintOptions) {
  // ...
}

const shape = getShape();
paintShape({ shape });
paintShape({ shape, xPos: 100 });
paintShape({ shape, yPos: 100 });
paintShape({ shape, xPos: 100, yPos: 100 });
```

在这个例子中，`xPos` 和 `yPos` 就是可选属性。因为他们是可选的，所以上面所有的调用方式都是合法的。

我们也可以尝试读取这些属性，但如果我们是在 `strictNullChecks` 模式下，TypeScript 会提示我们，属性值可能是 `undefined`。

```typescript
function paintShape(opts: PaintOptions) {
  let xPos = opts.xPos;
  // (property) PaintOptions.xPos?: number | undefined
  let yPos = opts.yPos;
  // (property) PaintOptions.yPos?: number | undefined
}
```

在 JavaScript 中，如果一个属性值没有被设置，我们获取会得到 `undefined` 。所以我们可以针对 `undefined` 特殊处理一下：

```typescript
function paintShape(opts: PaintOptions) {
  let xPos = opts.xPos === undefined ? 0 : opts.xPos;
  // let xPos: number
  let yPos = opts.yPos === undefined ? 0 : opts.yPos;
  // let yPos: number
}
```

这种判断在 JavaScript 中很常见，以至于提供了专门的语法糖：

```typescript
function paintShape({ shape, xPos = 0, yPos = 0 }: PaintOptions) {
  console.log('x coordinate at', xPos); // (parameter) xPos: number
  console.log('y coordinate at', yPos); // (parameter) yPos: number
  // ...
}
```

这里我们使用了解构语法以及为 `xPos` 和 `yPos` 提供了默认值。现在 `xPos` 和 `yPos` 的值在 `paintShape` 函数内部一定存在，但对于 `paintShape` 的调用者来说，却是可选的。

> 注意现在并没有在解构语法里放置类型注解的方式。这是因为在 JavaScript 中，下面的语法代表的意思完全不同。

```typescript
function draw({ shape: Shape, xPos: number = 100 /*...*/ }) {
  render(shape);
  // Cannot find name 'shape'. Did you mean 'Shape'?
  render(xPos);
  // Cannot find name 'xPos'.
}
```

在对象解构语法中，`shape: Shape` 表示的是把 `shape` 的值赋值给局部变量 `Shape`。 `xPos: number` 也是一样，会基于 `xPos` 创建一个名为 `number` 的变量。

### `readonly` 属性（readonly Properties）

在 TypeScript 中，属性可以被标记为 `readonly`，这不会改变任何运行时的行为，但在类型检查的时候，一个标记为 `readonly`的属性是不能被写入的。

```typescript
interface SomeType {
  readonly prop: string;
}

function doSomething(obj: SomeType) {
  // We can read from 'obj.prop'.
  console.log(`prop has the value '${obj.prop}'.`);

  // But we can't re-assign it.
  obj.prop = 'hello';
  // Cannot assign to 'prop' because it is a read-only property.
}
```

不过使用 `readonly` 并不意味着一个值就完全是不变的，亦或者说，内部的内容是不能变的。`readonly` 仅仅表明属性本身是不能被重新写入的。

```typescript
interface Home {
  readonly resident: { name: string; age: number };
}

function visitForBirthday(home: Home) {
  // We can read and update properties from 'home.resident'.
  console.log(`Happy birthday ${home.resident.name}!`);
  home.resident.age++;
}

function evict(home: Home) {
  // But we can't write to the 'resident' property itself on a 'Home'.
  home.resident = {
    // Cannot assign to 'resident' because it is a read-only property.
    name: 'Victor the Evictor',
    age: 42,
  };
}
```

TypeScript 在检查两个类型是否兼容的时候，并不会考虑两个类型里的属性是否是 `readonly`，这就意味着，`readonly` 的值是可以通过别名修改的。

```typescript
interface Person {
  name: string;
  age: number;
}

interface ReadonlyPerson {
  readonly name: string;
  readonly age: number;
}

let writablePerson: Person = {
  name: 'Person McPersonface',
  age: 42,
};

// works
let readonlyPerson: ReadonlyPerson = writablePerson;

console.log(readonlyPerson.age); // prints '42'
writablePerson.age++;
console.log(readonlyPerson.age); // prints '43'
```

### 索引签名（Index Signatures）

有的时候，你不能提前知道一个类型里的所有属性的名字，但是你知道这些值的特征。

这种情况，你就可以用一个索引签名 (index signature) 来描述可能的值的类型，举个例子：

```typescript
interface StringArray {
  [index: number]: string;
}

const myArray: StringArray = getStringArray();
const secondItem = myArray[1]; // const secondItem: string
```

这样，我们就有了一个具有索引签名的接口 `StringArray`，这个索引签名表示当一个 `StringArray` 类型的值使用 `number` 类型的值进行索引的时候，会返回一个 `string`类型的值。

一个索引签名的属性类型必须是 `string` 或者是 `number`。

虽然 TypeScript 可以同时支持 `string` 和 `number` 类型，但数字索引的返回类型一定要是字符索引返回类型的子类型。这是因为当使用一个数字进行索引的时候，JavaScript 实际上把它转成了一个字符串。这就意味着使用数字 100 进行索引跟使用字符串 100 索引，是一样的。

```typescript
interface Animal {
  name: string;
}

interface Dog extends Animal {
  breed: string;
}

// Error: indexing with a numeric string might get you a completely separate type of Animal!
interface NotOkay {
  [x: number]: Animal;
  // 'number' index type 'Animal' is not assignable to 'string' index type 'Dog'.
  [x: string]: Dog;
}
```

尽管字符串索引用来描述字典模式（dictionary pattern）非常的有效，但也会强制要求所有的属性要匹配索引签名的返回类型。这是因为一个声明类似于 `obj.property` 的字符串索引，跟 `obj["property"]`是一样的。在下面的例子中，`name` 的类型并不匹配字符串索引的类型，所以类型检查器会给出报错：

```typescript
interface NumberDictionary {
  [index: string]: number;

  length: number; // ok
  name: string;
  // Property 'name' of type 'string' is not assignable to 'string' index type 'number'.
}
```

然而，如果一个索引签名是属性类型的联合，那各种类型的属性就可以接受了：

```typescript
interface NumberOrStringDictionary {
  [index: string]: number | string;
  length: number; // ok, length is a number
  name: string; // ok, name is a string
}
```

最后，你也可以设置索引签名为 `readonly`。

```typescript
interface ReadonlyStringArray {
  readonly [index: number]: string;
}

let myArray: ReadonlyStringArray = getReadOnlyStringArray();
myArray[2] = 'Mallory';
// Index signature in type 'ReadonlyStringArray' only permits reading.
```

因为索引签名是 `readonly` ，所以你无法设置 `myArray[2]` 的值。

## 属性继承（Extending Types）

有时我们需要一个比其他类型更具体的类型。举个例子，假设我们有一个 `BasicAddress` 类型用来描述在美国邮寄信件和包裹的所需字段。

```typescript
interface BasicAddress {
  name?: string;
  street: string;
  city: string;
  country: string;
  postalCode: string;
}
```

这在一些情况下已经满足了，但同一个地址的建筑往往还有不同的单元号，我们可以再写一个 `AddressWithUnit`：

```typescript
interface AddressWithUnit {
  name?: string;
  unit: string;
  street: string;
  city: string;
  country: string;
  postalCode: string;
}
```

这样写固然可以，但为了加一个字段，就是要完全的拷贝一遍。

我们可以改成继承 `BasicAddress`的方式来实现：

```typescript
interface BasicAddress {
  name?: string;
  street: string;
  city: string;
  country: string;
  postalCode: string;
}

interface AddressWithUnit extends BasicAddress {
  unit: string;
}
```

对接口使用 `extends`关键字允许我们有效的从其他声明过的类型中拷贝成员，并且随意添加新成员。

接口也可以继承多个类型：

```typescript
interface Colorful {
  color: string;
}

interface Circle {
  radius: number;
}

interface ColorfulCircle extends Colorful, Circle {}

const cc: ColorfulCircle = {
  color: 'red',
  radius: 42,
};
```

## 交叉类型（Intersection Types）

TypeScript 也提供了名为交叉类型（Intersection types）的方法，用于合并已经存在的对象类型。

交叉类型的定义需要用到 `&` 操作符：

```typescript
interface Colorful {
  color: string;
}
interface Circle {
  radius: number;
}

type ColorfulCircle = Colorful & Circle;
```

这里，我们连结 `Colorful` 和 `Circle` 产生了一个新的类型，新类型拥有 `Colorful` 和 `Circle` 的所有成员。

```typescript
function draw(circle: Colorful & Circle) {
  console.log(`Color was ${circle.color}`);
  console.log(`Radius was ${circle.radius}`);
}

// okay
draw({ color: 'blue', radius: 42 });

// oops
draw({ color: 'red', raidus: 42 });
// Argument of type '{ color: string; raidus: number; }' is not assignable to parameter of type 'Colorful & Circle'.
// Object literal may only specify known properties, but 'raidus' does not exist in type 'Colorful & Circle'. Did you mean to write 'radius'?
```

## 接口继承与交叉类型（Interfalces vs Intersections）

这两种方式在合并类型上看起来很相似，但实际上还是有很大的不同。最原则性的不同就是在于冲突怎么处理，这也是你决定选择那种方式的主要原因。

```typescript
interface Colorful {
  color: string;
}

interface ColorfulSub extends Colorful {
  color: number;
}

// Interface 'ColorfulSub' incorrectly extends interface 'Colorful'.
// Types of property 'color' are incompatible.
// Type 'number' is not assignable to type 'string'.
```

使用继承的方式，如果重写类型会导致编译错误，但交叉类型不会：

```typescript
interface Colorful {
  color: string;
}

type ColorfulSub = Colorful & {
  color: number;
};
```

虽然不会报错，那 `color` 属性的类型是什么呢，答案是 `never`，取得是 `string` 和 `number` 的交集。

## 泛型对象类型（Generic Object Types）

让我们写这样一个 `Box` 类型，可以包含任何值：

```typescript
interface Box {
  contents: any;
}
```

现在 `content` 属性的类型为 `any`，可以用，但容易导致翻车。

我们也可以代替使用 `unknown`，但这也意味着，如果我们已经知道了 `contents` 的类型，我们需要做一些预防检查，或者用一个容易错误的类型断言。

```typescript
interface Box {
  contents: unknown;
}

let x: Box = {
  contents: 'hello world',
};

// we could check 'x.contents'
if (typeof x.contents === 'string') {
  console.log(x.contents.toLowerCase());
}

// or we could use a type assertion
console.log((x.contents as string).toLowerCase());
```

一个更加安全的做法是将 `Box` 根据 `contents` 的类型拆分的更具体一些：

```typescript
interface NumberBox {
  contents: number;
}

interface StringBox {
  contents: string;
}

interface BooleanBox {
  contents: boolean;
}
```

但是这也意味着我们不得不创建不同的函数或者函数重载处理不同的类型：

```typescript
function setContents(box: StringBox, newContents: string): void;
function setContents(box: NumberBox, newContents: number): void;
function setContents(box: BooleanBox, newContents: boolean): void;
function setContents(box: { contents: any }, newContents: any) {
  box.contents = newContents;
}
```

这样写就太繁琐了。

所以我们可以创建一个泛型 `Box` ，它声明了一个类型参数 (type parameter)：

```typescript
interface Box<Type> {
  contents: Type;
}
```

你可以这样理解：`Box` 的 `Type` 就是 `contents` 拥有的类型 `Type`。

当我们引用 `Box` 的时候，我们需要给予一个类型实参替换掉 `Type`：

```typescript
let box: Box<string>;
```

把 `Box` 想象成一个实际类型的模板，`Type` 就是一个占位符，可以被替代为具体的类型。当 TypeScript 看到 `Box<string>`，它就会替换为 `Box<Type>` 的 `Type` 为 `string` ，最后的结果就会变成 `{ contents: string }`。换句话说，`Box<string>`和 `StringBox` 是一样的。

```typescript
interface Box<Type> {
  contents: Type;
}
interface StringBox {
  contents: string;
}

let boxA: Box<string> = { contents: 'hello' };
boxA.contents;
// (property) Box<string>.contents: string

let boxB: StringBox = { contents: 'world' };
boxB.contents;
// (property) StringBox.contents: string
```

不过现在的 `Box` 是可重复使用的，如果我们需要一个新的类型，我们完全不需要再重新声明一个类型。

```typescript
interface Box<Type> {
  contents: Type;
}

interface Apple {
  // ....
}

// Same as '{ contents: Apple }'.
type AppleBox = Box<Apple>;
```

这也意味着我们可以利用泛型函数避免使用函数重载。

```typescript
function setContents<Type>(box: Box<Type>, newContents: Type) {
  box.contents = newContents;
}
```

类型别名也是可以使用泛型的。比如：

```typescript
interface Box<Type> {
  contents: Type;
}
```

使用别名对应就是：

```typescript
type Box<Type> = {
  contents: Type;
};
```

类型别名不同于接口，可以描述的不止是对象类型，所以我们也可以用类型别名写一些其他种类的的泛型帮助类型。

```typescript
type OrNull<Type> = Type | null;

type OneOrMany<Type> = Type | Type[];

type OneOrManyOrNull<Type> = OrNull<OneOrMany<Type>>;

type OneOrManyOrNull<Type> = OneOrMany<Type> | null;

type OneOrManyOrNullStrings = OneOrManyOrNull<string>;

type OneOrManyOrNullStrings = OneOrMany<string> | null;
```

### `Array` 类型（The Array Type）

我们之前讲过 `Array` 类型，当我们这样写类型 `number[]` 或者 `string[]` 的时候，其实它们只是 `Array<number>` 和 `Array<string>` 的简写形式而已。

```typescript
function doSomething(value: Array<string>) {
  // ...
}

let myArray: string[] = ['hello', 'world'];

// either of these work!
doSomething(myArray);
doSomething(new Array('hello', 'world'));
```

类似于上面的 `Box` 类型，`Array` 本身就是一个泛型：

```typescript
interface Array<Type> {
  /**
   * Gets or sets the length of the array.
   */
  length: number;

  /**
   * Removes the last element from an array and returns it.
   */
  pop(): Type | undefined;

  /**
   * Appends new elements to an array, and returns the new length of the array.
   */
  push(...items: Type[]): number;

  // ...
}
```

现代 JavaScript 也提供其他是泛型的数据结构，比如 `Map<K, V>` ， `Set<T>` 和 `Promise<T>`。因为 `Map` 、`Set` 、`Promise`的行为表现，它们可以跟任何类型搭配使用。

### `ReadonlyArray` 类型（The ReadonlyArray Type）

`ReadonlyArray` 是一个特殊类型，它可以描述数组不能被改变。

```typescript
function doStuff(values: ReadonlyArray<string>) {
  // We can read from 'values'...
  const copy = values.slice();
  console.log(`The first value is ${values[0]}`);

  // ...but we can't mutate 'values'.
  values.push('hello!');
  // Property 'push' does not exist on type 'readonly string[]'.
}
```

`ReadonlyArray` 主要是用来做意图声明。当我们看到一个函数返回 `ReadonlyArray`，就是在告诉我们不能去更改其中的内容，当我们看到一个函数支持传入 `ReadonlyArray` ，这是在告诉我们我们可以放心的传入数组到函数中，而不用担心会改变数组的内容。 不像 `Array`，`ReadonlyArray` 并不是一个我们可以用的构造器函数。

```typescript
new ReadonlyArray('red', 'green', 'blue');
// 'ReadonlyArray' only refers to a type, but is being used as a value here.
```

然而，我们可以直接把一个常规数组赋值给 `ReadonlyArray`。

```typescript
const roArray: ReadonlyArray<string> = ['red', 'green', 'blue'];
```

TypeScript 也针对 `ReadonlyArray<Type>` 提供了更简短的写法 `readonly Type[]`。

```typescript
function doStuff(values: readonly string[]) {
  // We can read from 'values'...
  const copy = values.slice();
  console.log(`The first value is ${values[0]}`);

  // ...but we can't mutate 'values'.
  values.push('hello!');
  // Property 'push' does not exist on type 'readonly string[]'.
}
```

最后有一点要注意，就是 `Arrays` 和 `ReadonlyArray` 并不能双向的赋值：

```typescript
let x: readonly string[] = [];
let y: string[] = [];

x = y; // ok
y = x; // The type 'readonly string[]' is 'readonly' and cannot be assigned to the mutable type 'string[]'.
```

### 元组类型（Tuple Types）

元组类型是另外一种 `Array` 类型，当你明确知道数组包含多少个元素，并且每个位置元素的类型都明确知道的时候，就适合使用元组类型。

```typescript
type StringNumberPair = [string, number];
```

在这个例子中，`StringNumberPair` 就是 `string` 和 `number` 的元组类型。

跟 `ReadonlyArray` 一样，它并不会在运行时产生影响，但是对 TypeScript 很有意义。因为对于类型系统，`StringNumberPair` 描述了一个数组，索引 0 的值的类型是 `string`，索引 1 的值的类型是 `number`。

```typescript
function doSomething(pair: [string, number]) {
  const a = pair[0];

  const a: string;
  const b = pair[1];

  const b: number;
  // ...
}

doSomething(['hello', 42]);
```

如果要获取元素数量之外的元素，TypeScript 会提示错误：

```typescript
function doSomething(pair: [string, number]) {
  // ...

  const c = pair[2];
  // Tuple type '[string, number]' of length '2' has no element at index '2'.
}
```

我们也可以使用 JavaScript 的数组解构语法解构元组：

```typescript
function doSomething(stringHash: [string, number]) {
  const [inputString, hash] = stringHash;
  console.log(inputString); // const inputString: string
  console.log(hash); // const hash: number
}
```

> 元组类型在重度依赖约定的 API 中很有用，因为它会让每个元素的意义都很明显。当我们解构的时候，元组给了我们命名变量的自由度。在上面的例子中，我们可以命名元素 `0` 和 `1` 为我们想要的名字。

> 然而，也不是每个用户都这样认为，所以有的时候，使用一个带有描述属性名字的对象也许是个更好的方式。

除了长度检查，简单的元组类型跟声明了 `length` 属性和具体的索引属性的 `Array` 是一样的。

```typescript
interface StringNumberPair {
  // specialized properties
  length: 2;
  0: string;
  1: number;

  // Other 'Array<string | number>' members...
  slice(start?: number, end?: number): Array<string | number>;
}
```

在元组类型中，你也可以写一个可选属性，但可选元素必须在最后面，而且也会影响类型的 `length` 。

```typescript
type Either2dOr3d = [number, number, number?];

function setCoordinate(coord: Either2dOr3d) {
  const [x, y, z] = coord;

  const z: number | undefined;

  console.log(`Provided coordinates had ${coord.length} dimensions`);
  // (property) length: 2 | 3
}
```

Tuples 也可以使用剩余元素语法，但必须是 array/tuple 类型：

```typescript
type StringNumberBooleans = [string, number, ...boolean[]];
type StringBooleansNumber = [string, ...boolean[], number];
type BooleansStringNumber = [...boolean[], string, number];
```

有剩余元素的元组并不会设置 `length`，因为它只知道在不同位置上的已知元素信息：

```typescript
const a: StringNumberBooleans = ['hello', 1];
const b: StringNumberBooleans = ['beautiful', 2, true];
const c: StringNumberBooleans = ['world', 3, true, false, true, false, true];

console.log(a.length); // (property) length: number

type StringNumberPair = [string, number];
const d: StringNumberPair = ['1', 1];
console.log(d.length); // (property) length: 2
```

可选元素和剩余元素的存在，使得 TypeScript 可以在参数列表里使用元组，就像这样：

```typescript
function readButtonInput(...args: [string, number, ...boolean[]]) {
  const [name, version, ...input] = args;
  // ...
}
```

基本等同于：

```typescript
function readButtonInput(name: string, version: number, ...input: boolean[]) {
  // ...
}
```

### `readonly` 元组类型（readonly Tuple Types）

元组类型也是可以设置 `readonly` 的：

```typescript
function doSomething(pair: readonly [string, number]) {
  // ...
}
```

这样 TypeScript 就不会允许写入`readonly` 元组的任何属性：

```typescript
function doSomething(pair: readonly [string, number]) {
  pair[0] = 'hello!';
  // Cannot assign to '0' because it is a read-only property.
}
```

在大部分的代码中，元组只是被创建，使用完后也不会被修改，所以尽可能的将元组设置为 `readonly` 是一个好习惯。

如果我们给一个数组字面量 `const` 断言，也会被推断为 `readonly` 元组类型。

```typescript
let point = [3, 4] as const;

function distanceFromOrigin([x, y]: [number, number]) {
  return Math.sqrt(x ** 2 + y ** 2);
}

distanceFromOrigin(point);

// Argument of type 'readonly [3, 4]' is not assignable to parameter of type '[number, number]'.
// The type 'readonly [3, 4]' is 'readonly' and cannot be assigned to the mutable type '[number, number]'.
```

尽管 `distanceFromOrigin` 并没有更改传入的元素，但函数希望传入一个可变元组。因为 `point` 的类型被推断为 `readonly [3, 4]`，它跟 `[number number]` 并不兼容，所以 TypeScript 给了一个报错。
