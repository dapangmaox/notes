如何取消 HTTP 请求？是在面试过程中经常遇到的一个问题，并且在日常开发中也会遇到，比如不使用防抖的情况下如何取消请求，再比如一个请求等待时间过长，用户不想等了，可以取消这个请求。

最近在使用 Angular 的过程中，用到了 switchMap 操作符，发现每次发送新的请求时，上一个请求都会被自动取消掉，为了探究原理，就有了本文章。

我们知道，浏览器能发送请求，靠两个重要的 API，一个是比较老旧的 XHR，另一个比较新的 Fetch。所以本文会分别介绍使用 XHR 和 Fetch 如何取消请求，并且会分析一下 Angular 内置的 http 模块是怎样取消请求的。

## XHR 取消请求

为了测试，首先创建一个 `index.html` 文件，内容如下，并且我们会使用 `http://httpbin.org/` 提供的开放 API 来发送和取消请求。

``` html
<!DOCTYPE html>
<html lang="en">
<body>
  <script>
    // 测试代码
  </script>
  <hr>
  <button onclick="beginFetching();">
    Begin
  </button>
  <button onclick="abortFetching();">
    Abort
  </button>
</body>
</html>
```

XHR 使用实例的 `abort()` 方法来取消请求。

``` js
function beginFetching() {
  console.log('Now fetching');
  xhr.send();
}

function abortFetching() {
  console.log('Now aborting');
  xhr.abort();
  console.log('aborted!');
}

const xhr = new XMLHttpRequest();

const urlToFetch = 'https://httpbin.org/delay/3';
xhr.open('GET', urlToFetch, true);

xhr.onreadystatechange = (state) => {
  if (xhr.readyState === 4 && xhr.status === 200) {
    console.log(xhr.responseText);
  }
};
```

先点击 `Begin`，并且在 3 秒内点击 `Abort`，效果如下：

![xhr](https://notes-1312649150.cos.ap-shanghai.myqcloud.com/images/48df6fb206fb49b2b79307edbf7d8f4d~tplv-k3u1fbpfcp-zoom-1.gif)

可以看到，在点击 Abort 的时候，当前的 HTTP 请求的 Status 会变成 canceled 的状态。

## Fetch 取消请求

Fetch 使用 `AbortController` 来取消请求。

``` js
// Create an instance.
const controller = new AbortController();
const signal = controller.signal;

// Register a listenr.
signal.addEventListener('abort', () => {
  console.log('aborted!');
});

function beginFetching() {
  console.log('Now fetching');
  var urlToFetch = 'https://httpbin.org/delay/3';

  fetch(urlToFetch, {
    method: 'get',
    signal: signal,
  })
    .then(function (response) {
      console.log(`Fetch complete. (Not aborted)`);
    })
    .catch(function (err) {
      console.error(` Err: ${err}`);
    });
}

function abortFetching() {
  console.log('Now aborting');
  // Abort.
  controller.abort();
}
```

同样先点击 `Begin`，并且在 3 秒内点击 `Abort`，效果如下：

![fetch](https://notes-1312649150.cos.ap-shanghai.myqcloud.com/images/61290e384779497ca68938f82eb26324~tplv-k3u1fbpfcp-zoom-1.gif)

可以看到，当点击 `Abort` 之后会调用 `controller` 实例的 `Abort` 方法，并且在 `singal` 上订阅的 `abort` event 也会被执行。与 XHR 不同的是，控制台会多打印一条 Error 信息。

## Angular 中的 http 模块取消请求

了解了 XHR 和 Fetch 取消请求的方式之后，我们来看一下 Angular 中是使用的哪种方式。

首先在 sandbox 上创建一个 Angular 项目，地址：[演示代码](https://codesandbox.io/s/how-angular-cancel-http-request-qdx43?file=/src/app/app.component.ts)

通过多次点击按钮可以发现，每次点击都会先取消上一个请求，并且发送新的请求。那么 Angular 和 RxJS 内部是怎么实现的呢？

带着这个问题，我们首先来看 switchMap 的代码：[switchMap](https://github1s.com/ReactiveX/rxjs/blob/master/src/internal/operators/switchMap.ts)

其中有这么几行是我们关心的：

```js
// Cancel the previous inner subscription if there was one
innerSubscriber?.unsubscribe();
```

我们知道 switchMap 操作符的行为是每次上游产生数据的时候都会去调用函数参数 project，只要有新的内部 Observable 产生，就会立刻退订之前的内部 Observable 对象，所以 Angular 中取消 http 请求的代码应该是该请求内部 Observable 的返回值，比如对应到演示代码中就是 `this.http.get(url)`方法内部 Observable 的返回值。

接下来我们去查看 Angular http 模块的 `get` 方法，地址：[client.ts](https://github1s.com/angular/angular/blob/HEAD/packages/common/http/src/client.ts)

通过查看代码，可以发现 `get` 方法会调用一个名为 `handle` 的函数，这个函数返回了一个 Observable，而这个 Observable 的返回值也是一个函数，代码如下：

``` js
// This is the return from the Observable function, which is the
// request cancellation handler.
return () => {
  // On a cancellation, remove all registered event listeners.
  xhr.removeEventListener('error', onError);
  xhr.removeEventListener('abort', onError);
  xhr.removeEventListener('load', onLoad);
  xhr.removeEventListener('timeout', onError);
  if (req.reportProgress) {
    xhr.removeEventListener('progress', onDownProgress);
    if (reqBody !== null && xhr.upload) {
      xhr.upload.removeEventListener('progress', onUpProgress);
    }
  }

  // Finally, abort the in-flight request.
  if (xhr.readyState !== xhr.DONE) {
    xhr.abort();
  }
};
```

通过 `abort` 和变量命名也能猜出来，Angular 中内置的 http 模块是使用的 XHR 来发送请求，更详细的过程可以阅读 Angular http 模块的源码。