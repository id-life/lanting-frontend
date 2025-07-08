import type { ThemeConfig } from 'antd';

const theme: ThemeConfig = {
  token: {
    colorPrimary: '#755C1B',
  },
  components: {
    Collapse: {
      headerPadding: '4px 0',
    },
    Card: {
      bodyPadding: 12,
    },
  },
};

export default theme;
