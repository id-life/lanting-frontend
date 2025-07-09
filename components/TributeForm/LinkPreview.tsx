'use client';

import React from 'react';
import { Spin, Divider, Empty, Card, Typography } from 'antd';
import { LinkOutlined } from '@ant-design/icons';
import { HtmlExtractResult } from '@/apis/types';

const { Paragraph, Text } = Typography;

interface LinkPreviewProps {
  previewData: HtmlExtractResult | null;
  loading: boolean;
}

const LinkPreview: React.FC<LinkPreviewProps> = ({ previewData, loading }) => {
  return (
    <Card
      title={
        <span className="text-primary text-base font-semibold">
          <LinkOutlined className="mr-2" />
          网页预览
        </span>
      }
      className="sticky top-5 border-gray-200 bg-gray-50 shadow-sm"
    >
      {loading ? (
        <div className="flex h-36 items-center justify-center">
          <Spin tip="正在加载预览..." />
        </div>
      ) : !previewData || Object.values(previewData).every((val) => !val || (Array.isArray(val) && val.length === 0)) ? (
        <div className="flex h-36 items-center justify-center">
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="输入链接后将在此显示预览" />
        </div>
      ) : (
        <div className="max-h-[calc(100vh-12rem)] overflow-y-auto text-sm">
          {previewData.title && (
            <div className="mb-2">
              <Text strong>标题：</Text>
              <Text>{previewData.title}</Text>
            </div>
          )}
          {previewData.author && (
            <div className="mb-2">
              <Text strong>作者：</Text>
              <Text>{Array.isArray(previewData.author) ? previewData.author.join(', ') : previewData.author}</Text>
            </div>
          )}
          {previewData.publisher && (
            <div className="mb-2">
              <Text strong>来源：</Text>
              <Text>{previewData.publisher}</Text>
            </div>
          )}
          {previewData.date && (
            <div className="mb-2">
              <Text strong>日期：</Text>
              <Text>{previewData.date}</Text>
            </div>
          )}
          {previewData.summary && (
            <>
              <Divider className="my-2" />
              <div className="rounded border border-gray-200 bg-white p-3">
                <Text strong className="mb-1 block">
                  内容摘要：
                </Text>
                <Paragraph className="mb-0 text-xs leading-relaxed whitespace-pre-line text-gray-600">
                  {previewData.summary}
                </Paragraph>
              </div>
            </>
          )}
        </div>
      )}
    </Card>
  );
};

export default LinkPreview;
