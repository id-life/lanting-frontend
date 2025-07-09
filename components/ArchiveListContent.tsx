'use client';

import React, { FC } from 'react';
import { Button, Space } from 'antd';
import { SketchOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ExpandCollapse from '@/components/ExpandCollapse';
import { Archive } from '@/apis/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface ArchiveListContentProps {
  archive: Archive;
  search: string;
  onLike: (archiveId: number, isLike: boolean) => void;
}

const processMdImgSyntax = (md: string) => {
  return md?.replace(/!\[\]\((.+?)\)/g, (match, g1) => {
    if (g1.startsWith('http://') || g1.startsWith('https://')) {
      return match;
    }
    return `![](${API_BASE_URL}/archives/content/${g1})`;
  });
};

const ArchiveListContent: FC<ArchiveListContentProps> = ({ archive, search, onLike }) => {
  const currentLikes = archive.likes ?? 0;

  const handleLike = (isLike: boolean) => {
    onLike(archive.id, isLike);
  };

  const renderers = {
    text: ({ value }: { value: string }) => <Highlighter searchWords={[search]} autoEscape textToHighlight={value} />,
    inlineCode: ({ value }: { value: string }) => (
      <code className="rounded border border-gray-300 bg-gray-100 px-1 py-0.5 text-sm text-red-700">
        <Highlighter searchWords={[search]} autoEscape textToHighlight={value} />
      </code>
    ),
    img: ({ alt, src, title }: { alt?: string; src?: string; title?: string }) => {
      if (!src) return null;
      const resolvedSrc = src.startsWith('http') ? src : `${API_BASE_URL}/archives/content/${src}`;
      return <img alt={alt} src={resolvedSrc} title={title} className="my-2 h-auto max-w-full" />;
    },
  };

  return (
    <div>
      <ExpandCollapse
        previewHeight="128px"
        expandText={
          <>
            一叶知秋 <DownOutlined />
          </>
        }
        collapseText={
          <>
            微言大义 <UpOutlined />
          </>
        }
        ellipsis={false}
      >
        <div className="prose prose-sm react-markdown! max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={renderers as any}>
            {processMdImgSyntax(archive.remarks || '')}
          </ReactMarkdown>
        </div>
      </ExpandCollapse>
      <div className="mt-4 flex items-center leading-[22px]">
        <Space.Compact>
          <Button
            className={`flex h-8 items-center justify-center rounded-sm border border-gray-200 px-3.5 text-base ${
              currentLikes > 0 && 'text-primary'
            }`}
            icon={<SketchOutlined className="rotate-180" />}
            onClick={() => handleLike(true)}
            type="text"
            size="small"
          >
            {currentLikes > 0 && <span>{currentLikes}</span>}
          </Button>
          <Button
            className="flex h-8 items-center justify-center rounded-sm border border-gray-200 px-3.5 text-base"
            icon={<SketchOutlined />}
            onClick={() => handleLike(false)}
            type="text"
            size="small"
          />
        </Space.Compact>
        <div className="pl-3 text-black/45">
          <Highlighter searchWords={[search]} autoEscape textToHighlight={String(archive.id)} />
        </div>
      </div>
    </div>
  );
};

export default ArchiveListContent;
