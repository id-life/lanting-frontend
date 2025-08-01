'use client';

import React from 'react';
import { Card, List, Spin, Empty, Divider, Typography } from 'antd';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';
import { ArchiveComment } from '@/apis/types';

const { Title } = Typography;

interface CommentSectionProps {
  articleId: string;
  comments: ArchiveComment[];
  loading: boolean;
  submitting: boolean;
  onSubmit: (content: string, authorName?: string) => Promise<void>;
}

const CommentSection: React.FC<CommentSectionProps> = ({ articleId, comments, loading, submitting, onSubmit }) => {
  return (
    <Card variant="outlined" className="mt-6 p-3">
      <Title level={3} className="text-heading mb-4 text-base font-medium">
        评论区 ({comments.length} 条)
      </Title>
      {loading ? (
        <div className="py-5 text-center">
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
      <CommentForm articleId={articleId} onSubmit={onSubmit} submitting={submitting} />
    </Card>
  );
};

export default CommentSection;
