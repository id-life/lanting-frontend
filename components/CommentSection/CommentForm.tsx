'use client';

import React, { useState } from 'react';
import { Form, Input, Button, Avatar, message as AntMessage } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const { TextArea } = Input;

interface CommentFormProps {
  articleId: string;
  onSubmit: (content: string, authorName?: string) => Promise<void>;
  submitting: boolean;
}

interface FormValues {
  commentText: string;
  authorNameInput?: string;
}

const CommentForm: React.FC<CommentFormProps> = ({ articleId, onSubmit, submitting }) => {
  const [form] = Form.useForm<FormValues>();

  const [initialAuthorName] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(`comment_author_name`) || '';
    }
    return '';
  });

  const handleFormSubmit = async (values: FormValues) => {
    if (!values.commentText || values.commentText.trim() === '') {
      AntMessage.error('评论内容不能为空');
      return;
    }
    const authorToSubmit = values.authorNameInput?.trim() || undefined;
    await onSubmit(values.commentText, authorToSubmit);

    form.resetFields(['commentText']);
    if (authorToSubmit && typeof window !== 'undefined') {
      localStorage.setItem(`comment_author_name`, authorToSubmit);
    }
  };

  return (
    <div className="mt-4 flex">
      <Avatar icon={<UserOutlined />} className="mt-1 mr-3 flex-shrink-0" />
      <Form
        form={form}
        onFinish={handleFormSubmit}
        className="flex-grow"
        initialValues={{ authorNameInput: initialAuthorName }}
      >
        <Form.Item name="authorNameInput" className="mb-4">
          <Input placeholder="留下您的昵称（可选，最多10个字）" maxLength={10} className="text-sm" />
        </Form.Item>
        <Form.Item name="commentText" rules={[{ required: true, message: '请输入评论内容!' }]} className="mb-4">
          <TextArea rows={3} placeholder="说点什么吧..." className="text-sm" />
        </Form.Item>
        <Form.Item className="mb-0">
          <Button htmlType="submit" variant="solid" color="primary" className="shadow-none" loading={submitting}>
            发表评论
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default CommentForm;
