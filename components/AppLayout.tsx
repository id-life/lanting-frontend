'use client';

import React, { useMemo, useState, Suspense } from 'react';
import { ProLayout, MenuDataItem, Settings as ProLayoutSettings } from '@ant-design/pro-components';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Avatar, Button, Dropdown, MenuProps } from 'antd';
import Icon, {
  BookOutlined,
  EditOutlined,
  GatewayOutlined,
  LoginOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import CustomFooter from '@/components/Footer';
import appLogo from '@/app/favicon.ico';
import TributeSVG from '@/public/svgs/tribute.svg?component';
import { useGitHubOAuth } from '@/hooks/useGitHubOAuth';
import { useTokenRedirect } from '@/hooks/useTokenRedirect';

const menuData: MenuDataItem[] = [
  {
    path: '/',
    name: '兰亭文存',
    icon: <BookOutlined />,
    target: '_blank',
  },
  {
    path: '/tribute',
    name: '归档文章',
    icon: <Icon component={TributeSVG} />,
    target: '_blank',
  },
  {
    path: 'https://www.thenetworkstate-zh.com/foreword/',
    name: '网络国家',
    target: '_blank',
    icon: <GatewayOutlined />,
  },
  {
    path: 'https://blog.wangboyang.com',
    name: '芦柑笔谈',
    target: '_blank',
    icon: <EditOutlined />,
  },
];

const PRIMARY_COLOR = '#755c1b';

const defaultSettings: ProLayoutSettings = {
  layout: 'top',
  contentWidth: 'Fluid',
  fixedHeader: true,
  fixSiderbar: true,
  colorPrimary: PRIMARY_COLOR,
};

interface AppLayoutProps {
  children: React.ReactNode;
}

// Token重定向处理组件
const TokenRedirectHandler: React.FC = () => {
  useTokenRedirect();
  return null;
};

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { user, isAuthenticated, isLoading, logout } = useGitHubOAuth();

  const memoizedMenuData = useMemo(() => {
    return {
      path: '/',
      routes: menuData,
    };
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'user',
      icon: <UserOutlined />,
      label: '个人信息',
      onClick: () => router.push('/user'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  const renderRightContent = () => {
    if (isLoading) {
      return null;
    }

    if (isAuthenticated && user) {
      return (
        <div className="md:mr-4">
          <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
            <div className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-gray-50">
              <Avatar size={32} src={user.avatar} alt={user.name || user.username} />
              <span className="hidden text-sm font-medium text-gray-700 sm:inline">{user.name || user.username}</span>
            </div>
          </Dropdown>
        </div>
      );
    }

    return (
      <Button type="primary" icon={<LoginOutlined />} onClick={() => router.push('/login')} size="middle" className="md:mr-4">
        登录
      </Button>
    );
  };

  return (
    <div className="[&_.ant-pro-layout-bg-list]:bg-layout min-h-screen [&_.ant-page-header]:mb-6 [&_.ant-page-header]:bg-white">
      <Suspense fallback={null}>
        <TokenRedirectHandler />
      </Suspense>
      <ProLayout
        logo={appLogo.src}
        title="兰亭"
        collapsed={collapsed}
        onCollapse={setCollapsed}
        onMenuHeaderClick={() => router.push('/')}
        token={{
          header: {
            colorTextMenuSelected: PRIMARY_COLOR,
            colorTextMenuActive: PRIMARY_COLOR,
            colorBgMenuItemSelected: 'transparent',
            colorBgMenuItemHover: 'transparent',
            heightLayoutHeader: 64,
            colorBgHeader: '#fff',
          },
          sider: {
            colorTextMenuSelected: PRIMARY_COLOR,
          },
          pageContainer: {
            paddingBlockPageContainerContent: 75,
            paddingInlinePageContainerContent: 24,
          },
        }}
        menuItemRender={(menuItemProps, defaultDom) => {
          if (menuItemProps.isUrl || !menuItemProps.path) {
            return <div style={{ fontWeight: 700 }}>{defaultDom}</div>;
          }

          if (menuItemProps.target === '_blank' && pathname !== menuItemProps.path) {
            return (
              <Link href={menuItemProps.path} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 700 }}>
                {defaultDom}
              </Link>
            );
          }

          return (
            <Link href={menuItemProps.path} style={{ fontWeight: 700 }}>
              {defaultDom}
            </Link>
          );
        }}
        menuHeaderRender={(logo, title) => (
          <div className="flex items-center gap-3 pr-17 md:ml-3">
            <div className="flex h-8">{logo}</div>
            <span className="text-3xl font-bold">{title}</span>
          </div>
        )}
        route={memoizedMenuData}
        location={{
          pathname: pathname,
        }}
        footerRender={() => <CustomFooter />}
        actionsRender={() => [renderRightContent()]}
        {...defaultSettings}
      >
        {children}
      </ProLayout>
    </div>
  );
};

export default AppLayout;
