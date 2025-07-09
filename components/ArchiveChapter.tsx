'use client';

import React from 'react';
import { List, Tag } from 'antd';
import { BankOutlined, EditOutlined, BookOutlined, CalendarOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import { toChineseNumbers } from '@/lib/utils';
import ChapterCard from './ChapterCard';
import ArchiveListContent from './ArchiveListContent';
import type { Archives } from '@/lib/types';
import Link from 'next/link';
import { Archive } from '@/apis/types';
import { renderOrigsLinks } from './renderOrigsLinks';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const CDN_DOMAIN = process.env.NEXT_PUBLIC_CDN_DOMAIN;

export interface ArchiveChapterProps {
  chapter: string;
  compiledArchives: Archives;
  archiveIds: number[];
  search: string;
  onLike: (archiveId: number, isLike: boolean) => void;
}

const renderOrig = (item: Archive) => {
  return renderOrigsLinks(item.origs);
};

const ArchiveChapter: React.FC<ArchiveChapterProps> = ({ chapter, archiveIds, compiledArchives, search, onLike }) => {
  const archives = archiveIds.map((id) => compiledArchives.archives[id]).filter(Boolean) as Archive[];

  const renderArchiveItem = (item: Archive) => (
    <List.Item
      key={item.id}
      actions={[
        item.authors && item.authors.length > 0 && (
          <h4 key="edit" className="text-heading flex items-center font-medium">
            <EditOutlined className="mr-1" />
            <Highlighter
              searchWords={[search]}
              autoEscape
              textToHighlight={item.authors.map((author) => author.name).join(' ')}
            />
          </h4>
        ),
        item.publisher && (
          <div key="publisher" className="flex items-center">
            <BankOutlined className="mr-2" />
            <Highlighter searchWords={[search]} autoEscape textToHighlight={item.publisher.name} />
          </div>
        ),
        item.date && (
          <div key="date" className="flex items-center">
            <CalendarOutlined className="mr-2" />
            <Highlighter searchWords={[search]} autoEscape textToHighlight={item.date.value} />
          </div>
        ),
      ].filter((item) => Boolean(item))}
      className="py-4"
    >
      <List.Item.Meta
        title={
          <div>
            <Link
              href={`/archive/${item.id}`}
              target="_blank"
              rel="noreferrer"
              className="text-heading hover:text-primary font-medium"
            >
              <Highlighter searchWords={[search]} autoEscape textToHighlight={item.title} />
            </Link>
            {renderOrig(item)}
          </div>
        }
        description={
          item.tags?.length > 0 && (
            <span className="mt-1">
              {item.tags.map((tag) => (
                <Tag key={tag.id} className="mt-1 mr-1">
                  <Highlighter searchWords={[search]} autoEscape textToHighlight={tag.name} />
                </Tag>
              ))}
            </span>
          )
        }
      />
      {/* Remove likesMap from here */}
      <ArchiveListContent archive={item} search={search} onLike={onLike} />
    </List.Item>
  );

  return (
    <ChapterCard
      title={
        <h2 className="flex items-baseline text-xl font-medium text-gray-800">
          {chapter}
          <span className="text-primary pl-2 text-sm">{`凡${toChineseNumbers(archives.length)}篇`}</span>
        </h2>
      }
      defaultActiveKey={chapter === '本纪' || chapter === '世家' ? chapter : undefined}
    >
      <List<Archive>
        pagination={
          archives.length > 6
            ? {
                size: 'small',
                showSizeChanger: false,
                showQuickJumper: false,
                pageSize: 6,
                className: 'mr-4',
              }
            : false
        }
        className="[&_.ant-list-item_h4.ant-list-item-meta-title]:border-split [&_.ant-list-item_h4.ant-list-item-meta-title]:border-t [&_.ant-list-item_h4.ant-list-item-meta-title]:pt-[18px] [&_.ant-list-item-action]:ms-0"
        size="large"
        rowKey="id"
        itemLayout="vertical"
        locale={{ emptyText: '前不见古人' }}
        split
        grid={{ gutter: 0, column: 2, sm: 1, xs: 1 }}
        dataSource={archives}
        renderItem={renderArchiveItem}
      />
    </ChapterCard>
  );
};

export default ArchiveChapter;
