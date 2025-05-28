// components/CommentSection/CommentForm.tsx
"use client";

import React, { useState } from "react";
import { Form, Input, Button, Avatar, message as AntMessage } from "antd";
import { UserOutlined } from "@ant-design/icons";

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

const CommentForm: React.FC<CommentFormProps> = ({
  articleId,
  onSubmit,
  submitting,
}) => {
  const [form] = Form.useForm<FormValues>();
  // 从 localStorage 获取作者名作为初始值
  const [initialAuthorName] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(`comment_author_name`) || "";
    }
    return "";
  });

  const handleFormSubmit = async (values: FormValues) => {
    if (!values.commentText || values.commentText.trim() === "") {
      AntMessage.error("评论内容不能为空");
      return;
    }
    // 使用表单中的 authorNameInput，如果为空则传递 undefined
    const authorToSubmit = values.authorNameInput?.trim() || undefined;
    await onSubmit(values.commentText, authorToSubmit);

    // 提交后清空评论内容输入框
    form.resetFields(["commentText"]);
    // 如果作者名被提交了，就保存到 localStorage
    if (authorToSubmit && typeof window !== "undefined") {
      localStorage.setItem(`comment_author_name`, authorToSubmit);
    }
  };

  return (
    <div className="flex mt-4">
      <Avatar icon={<UserOutlined />} className="mr-3 mt-1 flex-shrink-0" />
      <Form
        form={form}
        onFinish={handleFormSubmit}
        className="flex-grow"
        initialValues={{ authorNameInput: initialAuthorName }}
      >
        <Form.Item name="authorNameInput" className="mb-2">
          <Input
            placeholder="留下您的大名（可选，最多10个字）"
            maxLength={10}
            className="text-sm"
          />
        </Form.Item>
        <Form.Item
          name="commentText"
          rules={[{ required: true, message: "请输入评论内容!" }]}
          className="mb-2"
        >
          <TextArea rows={3} placeholder="说点什么吧..." className="text-sm" />
        </Form.Item>
        <Form.Item className="mb-0">
          <Button
            htmlType="submit"
            loading={submitting}
            type="primary"
            size="small"
          >
            发表评论
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default CommentForm;
