# Java 基础

## 数据类型

- 整型：`int`、`short`、`long`、`byte`
- 浮点类型：`float`、`double`
- `char`
- `boolean`

Java 中整型默认为 `int`，且 Java 会自动向下转型，`byte` 和 `short` 都可以由 `int` 自动向下转型，但是 `long` 类型的不能自动向上转型，所以要加 `L`，转为 `long` 类型。

浮点类型同理，默认为 `double`类型，`double` 转 `float` 可能会损失精度，所以要加 `F` 强转。

```java
// 小于 int 最大值，可以自动转换
long num1 = 1000000000;
// 大于 int 最大值，会报错：Integer number too large
long num2 = 10000000000;
// 加 L 强转
long num3 = 10000000000L;

float num4 = 3.14F;
```

## 变量与常量

- 变量命名规范
- 变量初始化
- 常量 `final`
- 枚举

```java
// 常量
final double PI = 3.14;

// 枚举
enum Size { SMALL, MEDIUM, LARGE, EXTRA_LARGE };
Size s = Size.LARGE;
System.out.println(s);
```

## 运算符

### 算数运算符

算术运算符有 `+`、`-`、`*`、`/`。

当参与 `/` 运算的两个操作数都是整数时，表示整数除法；否则，表示浮点除法。

整数的**求余**操作用 `%` 表示。

```java
System.out.println(15 / 2);     // 7
System.out.println(15.0 / 2);   // 7.5
System.out.println(15%2);       // 1
System.out.println(15.0%2);     // 1.0
```

### 数学函数与常量

在 Math 类中，包含了各种各样的数学函数。

在 Java 中，没有幂运算符，需要借助  `Math.pow(x, a)`，表示 x 的 a 次幂。

Java 还提供了两个用于表示 π 和 e 常量的最近接的近似值：`Math.PI` 和 `Math.E`。

```java
System.out.println(Math.pow(2, 3)); // 8.0
System.out.println(Math.PI);
System.out.println(Math.E);
```

### Others

- 强制类型转换
- 结合赋值和运算符（二元运算符）
- 自增自减运算符

## 字符串

- 字符串拼接
- 字符串是否相等 `equals`、`equalsIgnoreCase`
- String API
- `StringBuilder`

## 数组

```java
int[] a = new int[100];

int[] nums = {1, 2, 3, 5,};
```

- 创建数字数组时，所有元素都初始化为 0.
- 创建 boolean 数组时，所有元素都初始化为 false
- 创建对象元素时，所有元素都初始化为 null

## 对象与类

- 类之间的常见关系：依赖、聚合、继承

- 对象变量并没有实际包含一个对象，它只是引用一个对象。

- 在 Java 中，任何对象变量的值都是对存储在另外一个地方的某个对象的引用。new 操作符返回的也是一个引用。

- 隐式参数与显式参数：在每一个方法中，关键字 this 指向隐式参数。使用 this 可以将实例字段与局部变量明显地区分开来。

- Employee 类的方法可以访问任何 Employee 类型对象的私有字段。
- final 实例字段
- **`static`**：如果将一个字段定义为 static，每个类只有一个这样的字段。它属于类，不属于任何单个的对象。
- 静态常量：`public static final double PI = 3.14`
- 静态方法：不在对象上执行的方法。
  - 方法不需要访问对象状态可以使用静态方法
  - 方法只需要访问类的静态字段可以使用静态方法

### 方法参数

按值调用表示方法接收的是调用者提供的值。

按引用调用表示方法接收的是调用者提供的变量地址。

方法可以修改按引用传递的变量的值，而不能修改按值传递的变量的值。

**Java 总是采用按值调用。也就是说，方法所得到的是所有参数值的一个副本。**原来的对象引用和这个副本都引用同一个对象。

Java 中对方法参数能做什么和不能做什么：

- 方法不能修改基本数据类型的参数（即数值型或布尔型）
- 方法可以改变对象参数的状态
- 方法不能让一个对象参数引用一个新的对象

### 对象构造

重载：多个方法有相同的名字、不同的参数，便出现了重载。

### 包

静态导入：有一种 import 语句允许导入静态方法和静态字段，而不只是类。

```java
import static java.lang.Math.*;

public class MainApplication {
    public static void main(String[] args) {

        System.out.println(pow(4, 2));
    }
}
```

### JAR 文件

一个 JAR 文件既可以包含类文件，也可以包含诸如图像和声音等其他类型的文件。此外，JAR 文件是压缩的，它使用了我们熟悉的 ZIP 压缩格式。

