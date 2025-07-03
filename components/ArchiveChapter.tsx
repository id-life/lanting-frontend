"use client";

import React from "react";
import { List, Tag } from "antd";
import {
  BankOutlined,
  EditOutlined,
  BookOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import { toChineseNumbers } from "@/lib/utils";
import ChapterCard from "./ChapterCard";
import ArchiveListContent from "./ArchiveListContent";
import type { Archive, Archives } from "@/lib/types";
import Link from "next/link";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface ArchiveChapterProps {
  chapter: string;
  compiledArchives: Archives;
  archiveIds: number[];
  search: string;
  onLike: (archiveId: number, isLike: boolean) => void;
}

const renderOrig = (item: Archive) => {
  if (!item.archiveFilename) {
    return null;
  }

  return (
    <a
      key={item.archiveFilename}
      className="ml-1.5"
      href={`${API_BASE_URL}/archives/content/${item.archiveFilename}`}
      rel="noreferrer"
      target="_blank"
      title="原文"
    >
      <BookOutlined className="text-heading hover:text-primary" />
    </a>
  );
};

const ArchiveChapter: React.FC<ArchiveChapterProps> = ({
  chapter,
  archiveIds,
  compiledArchives,
  search,
  onLike,
}) => {
  const archives = archiveIds
    .map((id) => compiledArchives.archives[id])
    .filter(Boolean) as Archive[];

  const renderArchiveItem = (item: Archive) => (
    <List.Item
      key={item.id}
      actions={[
        item.author && (
          <h4 key="edit" className="flex items-center font-medium text-heading">
            <EditOutlined className="mr-1" />
            <Highlighter
              searchWords={[search]}
              autoEscape
              textToHighlight={item.author}
            />
          </h4>
        ),
        item.publisher && (
          <div key="publisher" className="flex items-center">
            <BankOutlined className="mr-2" />
            <Highlighter
              searchWords={[search]}
              autoEscape
              textToHighlight={item.publisher}
            />
          </div>
        ),
        item.date && (
          <div key="date" className="flex items-center">
            <CalendarOutlined className="mr-2" />
            <Highlighter
              searchWords={[search]}
              autoEscape
              textToHighlight={item.date}
            />
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
              className="font-medium text-heading hover:text-primary"
            >
              <Highlighter
                searchWords={[search]}
                autoEscape
                textToHighlight={item.title}
              />
            </Link>
            {renderOrig(item)}
          </div>
        }
        description={
          item.tag?.length > 0 && (
            <span className="mt-1">
              {item.tag.map((t) => (
                <Tag key={t} className="mt-1 mr-1">
                  <Highlighter
                    searchWords={[search]}
                    autoEscape
                    textToHighlight={t}
                  />
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
        <h2 className="text-xl font-medium text-gray-800 flex items-baseline">
          {chapter}
          <span className="text-sm pl-2 text-primary">
            {`凡${toChineseNumbers(archives.length)}篇`}
          </span>
        </h2>
      }
      defaultActiveKey={
        chapter === "本纪" || chapter === "世家" ? chapter : undefined
      }
    >
      <List<Archive>
        pagination={
          archives.length > 6
            ? {
                size: "small",
                showSizeChanger: false,
                showQuickJumper: false,
                pageSize: 6,
                className: "mr-4",
              }
            : false
        }
        className="[&_.ant-list-item_h4.ant-list-item-meta-title]:pt-[18px]
    [&_.ant-list-item_h4.ant-list-item-meta-title]:border-t
    [&_.ant-list-item_h4.ant-list-item-meta-title]:border-split
    [&_.ant-list-item-action]:ms-0
    "
        size="large"
        rowKey="id"
        itemLayout="vertical"
        locale={{ emptyText: "前不见古人" }}
        split
        grid={{ gutter: 0, column: 2, sm: 1, xs: 1 }}
        dataSource={archives}
        renderItem={renderArchiveItem}
      />
    </ChapterCard>
  );
};

export default ArchiveChapter;
