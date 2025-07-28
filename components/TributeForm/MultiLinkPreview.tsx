'use client';

import React from 'react';
import { Spin, Divider, Empty, Card, Typography, Collapse, Badge } from 'antd';
import { LinkOutlined, FileOutlined } from '@ant-design/icons';
import { HtmlExtractResult } from '@/apis/types';

const { Paragraph, Text } = Typography;
const { Panel } = Collapse;

interface MultiLinkPreviewProps {
  previewDataList: (HtmlExtractResult | null)[];
  loading: boolean;
}

const MultiLinkPreview: React.FC<MultiLinkPreviewProps> = ({ previewDataList, loading }) => {
  const validPreviews = previewDataList.filter((data) => data !== null) as HtmlExtractResult[];

  const renderPreviewContent = (data: HtmlExtractResult, index: number) => (
    <div key={index} className="text-sm">
      {data.title && (
        <div className="mb-2">
          <Text strong>标题：</Text>
          <Text>{data.title}</Text>
        </div>
      )}
      {data.author && (
        <div className="mb-2">
          <Text strong>作者：</Text>
          <Text>{Array.isArray(data.author) ? data.author.join(', ') : data.author}</Text>
        </div>
      )}
      {data.publisher && (
        <div className="mb-2">
          <Text strong>来源：</Text>
          <Text>{data.publisher}</Text>
        </div>
      )}
      {data.date && (
        <div className="mb-2">
          <Text strong>日期：</Text>
          <Text>{data.date}</Text>
        </div>
      )}
      {data.summary && (
        <>
          <Divider className="my-2" />
          <div className="rounded border border-gray-200 bg-white p-3">
            <Text strong className="mb-1 block">
              内容摘要：
            </Text>
            <Paragraph className="mb-0 text-xs leading-relaxed whitespace-pre-line text-gray-600">{data.summary}</Paragraph>
          </div>
        </>
      )}
    </div>
  );

  return (
    <Card
      title={
        <span className="text-primary text-base font-semibold">
          <FileOutlined className="mr-2" />
          文件预览
          {validPreviews.length > 0 && <Badge count={validPreviews.length} className="ml-2" />}
        </span>
      }
      className="sticky top-5 border-gray-200 bg-gray-50 shadow-sm"
    >
      {loading ? (
        <div className="flex h-36 items-center justify-center">
          <Spin tip="正在加载预览..." />
        </div>
      ) : validPreviews.length === 0 ? (
        <div className="flex h-36 items-center justify-center">
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="输入链接或上传文件后将在此显示预览" />
        </div>
      ) : validPreviews.length === 1 ? (
        <div className="max-h-[calc(100vh-12rem)] overflow-y-auto">{renderPreviewContent(validPreviews[0], 0)}</div>
      ) : (
        <div className="max-h-[calc(100vh-12rem)] overflow-y-auto">
          <Collapse size="small" ghost>
            {validPreviews.map((data, index) => (
              <Panel
                header={
                  <span className="text-sm">
                    <LinkOutlined className="mr-2" />
                    {data.title || `文件 ${index + 1}`}
                  </span>
                }
                key={index}
              >
                {renderPreviewContent(data, index)}
              </Panel>
            ))}
          </Collapse>
        </div>
      )}
    </Card>
  );
};

export default MultiLinkPreview;
