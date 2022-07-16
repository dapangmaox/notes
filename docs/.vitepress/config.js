export default {
  title: '大胖猫',
  description: '大胖猫的个人网站.',
  themeConfig: {
    nav: nav(),
    sidebar: {
      '/notes/': sidebarNotes(),
      '/posts/': sidebarPosts(),
      '/typescript/': sidebarTypeScript(),
    },
  },
};

function nav() {
  return [
    { text: 'Notes', link: '/notes/linux' },
    { text: 'Blog', link: '/posts/eslint' },
    { text: 'TypeScript', link: '/typescript/basic' },
  ];
}

function sidebarNotes() {
  return [
    {
      text: 'Java',
      collapsible: true,
      items: [
        { text: 'Java 基础', link: '/notes/java/java-basic' },
        { text: 'Java 继承', link: '/notes/java/java-inheritance' },
        { text: 'Spring Boot', link: '/notes/java/springboot' },
        { text: 'Maven', link: '/notes/java/maven' },
        { text: 'Gradle', link: '/notes/java/gradle' },
      ],
    },
    {
      text: 'Linux',
      collapsible: true,
      items: [
        { text: 'Linux基础知识', link: '/notes/linux' },
        { text: '编程环境和软件设施安装', link: '/notes/environment-setup' },
      ],
    },
  ];
}

function sidebarPosts() {
  return [
    {
      items: [{ text: '深入理解 ESLint', link: '/posts/eslint' }],
    },
    {
      text: 'Angular',
      collapsible: true,
      items: [
        {
          text: '可配置模板的可重用组件',
          link: '/posts/Angular/reusable-components-with-configurable-templates',
        },
        {
          text: '使用 ng-content 进行内容投影',
          link: '/posts/Angular/ng-content',
        },
        {
          text: '组件样式工作原理',
          link: '/posts/Angular/how-component-style-works',
        },
        {
          text: '如何取消 HTTP 请求',
          link: '/posts/Angular/cancel-http-request',
        },
        {
          text: '使用ESLint和Prettier配置Angular项目',
          link: '/posts/Angular/angular-eslint-prettier',
        },
      ],
    },
  ];
}

function sidebarTypeScript() {
  return [
    {
      items: [
        {
          text: '类型收窄',
          link: '/typescript/narrowing',
        },
        {
          text: '函数',
          link: '/typescript/functions',
        },
        {
          text: '对象类型',
          link: '/typescript/object-types',
        },
        {
          text: 'keyof 和 typeof',
          link: '/typescript/keyof-typeof',
        },
        {
          text: '索引访问类型',
          link: '/typescript/indexed-access-types',
        },
        {
          text: '条件类型',
          link: '/typescript/conditional-types',
        },
        {
          text: '映射类型',
          link: '/typescript/mapped-types',
        },
        {
          text: '模板字符串类型',
          link: '/typescript/template-literal-types',
        },
      ],
    },
  ];
}
