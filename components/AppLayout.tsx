'use client';

import React, { useMemo, useState } from 'react';
import { ProLayout, MenuDataItem, Settings as ProLayoutSettings } from '@ant-design/pro-components';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import Icon, { BookOutlined, EditOutlined, GatewayOutlined } from '@ant-design/icons';
import CustomFooter from '@/components/Footer';
import appLogo from '@/app/favicon.ico';
import TributeSVG from '@/public/svgs/tribute.svg?component';

const menuData: MenuDataItem[] = [
  {
    path: '/',
    name: '兰亭文存',
    icon: <BookOutlined />,
  },
  {
    path: '/tribute',
    name: '归档文章',
    icon: <Icon component={TributeSVG} />,
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

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const memoizedMenuData = useMemo(() => {
    return {
      path: '/',
      routes: menuData,
    };
  }, []);

  return (
    <div className="[&_.ant-pro-layout-bg-list]:bg-layout min-h-screen [&_.ant-page-header]:mb-6 [&_.ant-page-header]:bg-white">
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
          if (menuItemProps.isUrl || menuItemProps.target === '_blank' || !menuItemProps.path) {
            return <div style={{ fontWeight: 700 }}>{defaultDom}</div>;
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
        {...defaultSettings}
      >
        {children}
      </ProLayout>
    </div>
  );
};

export default AppLayout;
