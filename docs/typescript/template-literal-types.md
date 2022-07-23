## 模板字面量类型

模板字面量类型以字符串字面量类型为基础，可以通过联合类型扩展成多个字符串。

它们跟 JavaScript 的模板字符串是相同的语法，但是只能用在类型操作中。当使用模板字面量类型时，它会替换模板中的变量，返回一个新的字符串字面量：

```typescript
type World = 'world';

type Greeting = `hello ${World}`;
```

当模板中的变量是一个联合类型时，每一个可能的字符串字面量都会被表示：

```typescript
type EmailLocaleIDs = 'welcome_email' | 'email_heading';
type FooterLocaleIDs = 'footer_title' | 'footer_sendoff';

type AllLocaleIDs = `${EmailLocaleIDs | FooterLocaleIDs}_id`;
// type AllLocaleIDs = "welcome_email_id" | "email_heading_id" | "footer_title_id" | "footer_sendoff_id"
```

## 内置字符操作类型

TypeScript 的一些类型可以用于字符操作，这些类型处于性能的考虑被内置在编译器中，你不能在`.d.ts`文件里找到它们。

### Uppercase

把每个字符转为大写形式：

```typescript
type Greeting = 'Hello, world';
type ShoutyGreeting = Uppercase<Greeting>;
// type ShoutyGreeting = "HELLO, WORLD"

type ASCIICacheKey<Str extends string> = `ID-${Uppercase<Str>}`;
type MainID = ASCIICacheKey<'my_app'>;
// type MainID = "ID-MY_APP"
```

### Lowercase

把每个字符转为小写形式：

```typescript
type Greeting = 'Hello, world';
type QuietGreeting = Lowercase<Greeting>;
// type QuietGreeting = "hello, world"

type ASCIICacheKey<Str extends string> = `id-${Lowercase<Str>}`;
type MainID = ASCIICacheKey<'MY_APP'>;
// type MainID = "id-my_app"
```

### Capitalize<

把字符串的第一个字符转为大写形式：

```typescript
type LowercaseGreeting = 'hello, world';
type Greeting = Capitalize<LowercaseGreeting>;
// type Greeting = "Hello, world"
```

### Uncapitalize

把字符串的第一个字符转换为小写形式：

```typescript
type UppercaseGreeting = 'HELLO WORLD';
type UncomfortableGreeting = Uncapitalize<UppercaseGreeting>;
// type UncomfortableGreeting = "hELLO WORLD"
```
