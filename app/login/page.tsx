'use client';

import React, { useState } from 'react';
import { Button, Typography } from 'antd';
import { GithubOutlined, LoginOutlined } from '@ant-design/icons';
import { useGitHubOAuth } from '@/hooks/useGitHubOAuth';

const { Title } = Typography;

const LoginPage = () => {
  const { login } = useGitHubOAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = () => {
    setIsLoggingIn(true);
    login();
  };

  return (
    <div className="mx-auto my-8 w-[90%] max-w-2xl">
      <Title level={2} className="text-primary mb-8 flex items-center justify-center text-center">
        <LoginOutlined className="mr-2" /> 用户登录
      </Title>

      <div className="text-center">
        <Button
          type="primary"
          size="large"
          icon={<GithubOutlined />}
          onClick={handleLogin}
          loading={isLoggingIn}
          className="px-8 py-4 text-lg"
        >
          使用 GitHub 登录
        </Button>
      </div>
    </div>
  );
};

export default LoginPage;
