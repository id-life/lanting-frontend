"use client";

import React, { useMemo, useState } from "react";
import {
  ProLayout,
  MenuDataItem,
  Settings as ProLayoutSettings,
} from "@ant-design/pro-components";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  const [settings, setSettings] =
    useState<Partial<ProLayoutSettings>>(defaultSettings);
  const [collapsed, setCollapsed] = useState(false);

  const memoizedMenuData = useMemo(() => {
    // You can add logic here to transform menuData if needed,
    // e.g., based on roles or other dynamic conditions
    return {
      path: "/",
      routes: menuData,
    };
  }, []);

  return (
    <div id="app-pro-layout" className="h-screen overflow-auto">
      <ProLayout
        style={{ fontWeight: "bold" }}
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
          },
          sider: {
            // colorMenuBackground: "#fff", // Default is light
            // colorTextMenu: PRIMARY_COLOR, // Default menu item text color
            colorTextMenuSelected: PRIMARY_COLOR, // Selected menu item text color
            // colorBgMenuItemSelected: "transparent", // No background color for selected item
            // colorBgMenuItemHover: "transparent", // No background color for hovered item
          },
        }}
        menuItemRender={(menuItemProps, defaultDom) => {
          if (
            menuItemProps.isUrl ||
            menuItemProps.target === "_blank" ||
            !menuItemProps.path
          ) {
            return defaultDom;
          }

          return <Link href={menuItemProps.path}>{defaultDom}</Link>;
        }}
        menuHeaderRender={(logo, title) => (
          <div
            style={{
              height: "32px",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {logo}
            {title}
          </div>
        )}
        route={memoizedMenuData}
        location={{
          pathname: pathname || "/",
        }}
        footerRender={() => <CustomFooter />}
        {...settings}
      >
        {children}
      </ProLayout>
    </div>
  );
};

export default AppLayout;
