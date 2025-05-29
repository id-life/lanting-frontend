// lib/themeConfig.ts
import type { ThemeConfig } from "antd";

const theme: ThemeConfig = {
  token: {
    colorPrimary: "#755C1B",
  },
  components: {
    Layout: {
      // ProLayout 默认背景色是 #f0f2f5，如果需要匹配可以设置
      // bodyBg: '#f0f2f5',
      // headerBg: '#fff',
    },
    Menu: {
      // ProLayout 菜单项的默认颜色
      // itemColor: 'rgba(0, 0, 0, 0.65)',
      // itemSelectedColor: '#755C1B',
      // itemHoverColor: '#755C1B',
      // itemActiveBg: '#f0e9d1', // 一个浅色的匹配 primaryColor 的背景
      // itemSelectedBg: '#f0e9d1',
    },
    Collapse: {
      headerPadding: "4px 0",
    },
    Card: {
      bodyPadding: 12,
    },
  },
};

export default theme;
