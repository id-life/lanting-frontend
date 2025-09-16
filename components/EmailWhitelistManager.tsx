'use client';

import React, { useState } from 'react';
import { Card, Tag, Input, Button, message, Spin, Typography, Empty, Space } from 'antd';
import { MailOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useFetchEmailWhitelist, useUpdateEmailWhitelist } from '@/hooks/useEmailQuery';

const { Text } = Typography;
const { Search } = Input;

const EmailWhitelistManager: React.FC = () => {
  const [newEmail, setNewEmail] = useState('');
  const { data: emailList = [], isLoading, error } = useFetchEmailWhitelist();
  const updateEmailWhitelist = useUpdateEmailWhitelist();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleAddEmail = () => {
    if (!newEmail.trim()) {
      message.warning('请输入邮箱地址');
      return;
    }

    if (!validateEmail(newEmail.trim())) {
      message.error('请输入有效的邮箱地址');
      return;
    }

    const emailToAdd = newEmail.trim().toLowerCase();

    if (emailList.some((item) => item.email === emailToAdd)) {
      message.warning('该邮箱已存在于白名单中');
      return;
    }

    const updatedEmails = [...emailList.map((item) => item.email), emailToAdd];

    updateEmailWhitelist.mutate(updatedEmails, {
      onSuccess: () => {
        message.success('邮箱添加成功');
        setNewEmail('');
      },
      onError: () => {
        message.error('邮箱添加失败，请重试');
      },
    });
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    const updatedEmails = emailList.filter((item) => item.email !== emailToRemove).map((item) => item.email);

    updateEmailWhitelist.mutate(updatedEmails, {
      onSuccess: () => {
        message.success('邮箱删除成功');
      },
      onError: () => {
        message.error('邮箱删除失败，请重试');
      },
    });
  };

  const renderEmailTags = () => {
    if (emailList.length === 0) {
      return (
        <div className="flex h-24 items-center justify-center">
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无邮箱白名单" />
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {emailList.map((item) => (
          <Tag
            key={item.id}
            closable
            onClose={() => handleRemoveEmail(item.email)}
            className="mb-2 flex items-center justify-between px-3 py-1 text-sm"
            color="blue"
          >
            <span>{item.email}</span>
          </Tag>
        ))}
      </div>
    );
  };

  return (
    <Card
      title={
        <span className="text-primary text-base font-semibold">
          <MailOutlined className="mr-2" />
          邮件白名单管理
        </span>
      }
      className="border-gray-200 bg-white shadow-sm"
    >
      {isLoading ? (
        <div className="flex h-32 items-center justify-center">
          <Spin tip="正在加载白名单..." />
        </div>
      ) : error ? (
        <div className="flex h-32 items-center justify-center">
          <Text type="danger">加载失败，请刷新重试</Text>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <Text strong className="mb-2 block text-gray-700">
              当前白名单邮箱 ({emailList.length})
            </Text>
            {renderEmailTags()}
          </div>

          <div>
            <Text strong className="mb-2 block text-gray-700">
              添加新邮箱
            </Text>
            <Space.Compact style={{ width: '100%' }}>
              <Search
                placeholder="输入邮箱地址"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                onSearch={handleAddEmail}
                enterButton={
                  <Button icon={<PlusOutlined />} loading={updateEmailWhitelist.isPending} type="primary">
                    添加
                  </Button>
                }
                disabled={updateEmailWhitelist.isPending}
              />
            </Space.Compact>
          </div>
        </div>
      )}
    </Card>
  );
};

export default EmailWhitelistManager;
