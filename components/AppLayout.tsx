"use client";

import React, { useMemo, useState } from "react";
import {
  ProLayout,
  MenuDataItem,
  Settings as ProLayoutSettings,
} from "@ant-design/pro-components";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Flex } from "antd";
import { BookOutlined, EditOutlined, GatewayOutlined } from "@ant-design/icons";
import CustomFooter from "@/components/Footer";
import appLogo from "@/public/favicon.ico";

const menuData: MenuDataItem[] = [
  {
    path: "/",
    name: "兰亭文存",
    icon: <BookOutlined />,
  },
  {
    path: "https://www.thenetworkstate-zh.com/foreword/",
    name: "网络国家",
    target: "_blank",
    icon: <GatewayOutlined />,
  },
  {
    path: "https://blog.wangboyang.com",
    name: "芦柑笔谈",
    target: "_blank",
    icon: <EditOutlined />,
  },
];

const PRIMARY_COLOR = "#755c1b";

const defaultSettings: ProLayoutSettings = {
  layout: "top",
  contentWidth: "Fluid",
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
      path: "/",
      routes: menuData,
    };
  }, []);

  return (
    <div className="h-screen overflow-auto">
      <ProLayout
        // className="bg-[#f0f2f5]"
        logo={appLogo.src}
        title="兰亭"
        collapsed={collapsed}
        onCollapse={setCollapsed}
        onMenuHeaderClick={() => router.push("/")}
        token={{
          header: {
            colorTextMenuSelected: PRIMARY_COLOR,
            colorTextMenuActive: PRIMARY_COLOR,
            colorBgMenuItemSelected: "transparent",
            colorBgMenuItemHover: "transparent",
            heightLayoutHeader: 64,
            colorBgHeader: "#fff",
          },
          sider: {
            // colorMenuBackground: "#fff", // Default is light
            // colorTextMenu: PRIMARY_COLOR, // Default menu item text color
            colorTextMenuSelected: PRIMARY_COLOR, // Selected menu item text color
            // colorBgMenuItemSelected: "transparent", // No background color for selected item
            // colorBgMenuItemHover: "transparent", // No background color for hovered item
          },
          pageContainer: {
            paddingBlockPageContainerContent: 44,
            paddingInlinePageContainerContent: 16,
          },
        }}
        menuItemRender={(menuItemProps, defaultDom) => {
          if (
            menuItemProps.isUrl ||
            menuItemProps.target === "_blank" ||
            !menuItemProps.path
          ) {
            return <div style={{ fontWeight: 700 }}>{defaultDom}</div>;
          }

          return (
            <Link href={menuItemProps.path} style={{ fontWeight: 700 }}>
              {defaultDom}
            </Link>
          );
        }}
        menuHeaderRender={(logo, title) => (
          <div className="pr-17 flex items-center gap-3 md:ml-3">
            <div className="h-8 flex">{logo}</div>
            <span className="text-3xl font-bold ">{title}</span>
          </div>
        )}
        route={memoizedMenuData}
        location={{
          pathname: pathname || "/",
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
