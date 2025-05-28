// components/CommentSection/index.tsx
"use client";

import React from "react";
import { Card, List, Spin, Empty, Divider, Typography } from "antd";
import type { CommentData } from "@/lib/types";
import CommentItem from "./CommentItem";
import CommentForm from "./CommentForm";

const { Title } = Typography;

interface CommentSectionProps {
  articleId: string;
  comments: CommentData[];
  loading: boolean;
  submitting: boolean;
  onSubmit: (content: string, authorName?: string) => Promise<void>;
}

const CommentSection: React.FC<CommentSectionProps> = ({
  articleId,
  comments,
  loading,
  submitting,
  onSubmit,
}) => {
  return (
    <Card variant="outlined" className="mt-6">
      <Title level={3} className="mb-4 text-xl font-semibold text-gray-700">
        评论区 ({comments.length} 条)
      </Title>
      {loading ? (
        <div className="text-center py-5">
          <Spin />
        </div>
      ) : comments.length === 0 ? (
        <Empty description="暂无评论，快来抢沙发吧！" className="py-5" />
      ) : (
        <List
          dataSource={comments}
          itemLayout="horizontal"
          renderItem={(comment) => <CommentItem comment={comment} />}
          className="mb-6"
        />
      )}
      <Divider />
      <CommentForm
        articleId={articleId}
        onSubmit={onSubmit}
        submitting={submitting}
      />
    </Card>
  );
};

export default CommentSection;
