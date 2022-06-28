export default {
  title: '大胖猫',
  description: '大胖猫的个人网站.',
  themeConfig: {
    nav: nav(),
    sidebar: {
      '/notes/': sidebarNotes(),
      '/posts/': sidebarPosts(),
    },
  },
};

function nav() {
  return [
    { text: 'Notes', link: '/notes/linux' },
    { text: 'Blog', link: '/posts/eslint' },
  ];
}

function sidebarNotes() {
  return [
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
  ];
}
