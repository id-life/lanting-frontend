"use client";

import React from "react";
import { Tag } from "antd";

const ENVTagColor: { [key: string]: string } = {
  dev: "orange",
  test: "green",
  pre: "#87d068",
};

const RightContent: React.FC = () => {
  const reactAppEnv = process.env.NEXT_PUBLIC_REACT_APP_ENV; // Next.js 推荐环境变量以 NEXT_PUBLIC_ 开头

  return (
    <div className="flex items-center">
      {reactAppEnv && (
        <span>
          <Tag color={ENVTagColor[reactAppEnv] || "default"}>
            {reactAppEnv.toUpperCase()}
          </Tag>
        </span>
      )}
      {/* 可以添加用户头像、设置等 */}
    </div>
  );
};

export default RightContent;
