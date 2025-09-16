'use client';

import React from 'react';
import { Avatar, Typography, Spin, Button, Divider } from 'antd';
import { UserOutlined, MailOutlined, LogoutOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useGitHubOAuth } from '@/hooks/useGitHubOAuth';
import EmailWhitelistManager from '@/components/EmailWhitelistManager';

const { Title, Text } = Typography;

const UserPage = () => {
  const router = useRouter();
  const { user, isLoading, logout } = useGitHubOAuth();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Text type="secondary">未找到用户信息</Text>
      </div>
    );
  }

  return (
    <div className="mx-auto my-8 w-[90%] max-w-2xl">
      <Title level={2} className="text-primary mb-8 flex items-center justify-center text-center">
        <UserOutlined className="mr-2" /> 个人信息
      </Title>

      <div className="text-center">
        <Avatar size={120} src={user.avatar} alt={user.name || user.username} className="mb-6 shadow-lg" />

        <Title level={2} className="mb-4 text-2xl">
          {user.name || user.username}
        </Title>

        <div className="mb-6 space-y-3">
          <div className="flex items-center justify-center text-gray-600">
            <UserOutlined className="mr-2" />
            <Text type="secondary">@{user.username}</Text>
          </div>

          <div className="flex items-center justify-center text-gray-600">
            <MailOutlined className="mr-2" />
            <Text>{user.email}</Text>
          </div>
        </div>

        <Button type="default" icon={<LogoutOutlined />} onClick={handleLogout} size="large" className="mt-4">
          退出登录
        </Button>
      </div>

      <Divider className="my-8" />

      <div className="mt-8">
        <EmailWhitelistManager />
      </div>
    </div>
  );
};

export default UserPage;
