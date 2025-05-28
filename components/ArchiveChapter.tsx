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
import { CDN_DOMAIN, toChineseNumbers } from "@/lib/utils";
import ChapterCard from "./ChapterCard";
import ArchiveListContent from "./ArchiveListContent";
import type { Archive, Archives, LikesMap } from "@/lib/types";
import Link from "next/link";

interface ArchiveChapterProps {
  chapter: string;
  compiledArchives: Archives;
  archiveIds: number[];
  search: string;
  onLike: (archiveId: number, isLike: boolean) => void;
  likesMap: LikesMap;
}

const renderOrig = (item: Archive) => {
  if (!item.origs || item.origs.length === 0) {
    return null;
  }
  return item.origs.map((orig, index) => (
    <a
      key={orig}
      className="ml-1.5" // Tailwind for padding-left
      href={`${CDN_DOMAIN}/archives/origs/${orig}`}
      rel="noreferrer"
      target="_blank"
      title={item.origs && item.origs.length > 1 ? `原文 ${index + 1}` : "原文"}
    >
      <BookOutlined />
    </a>
  ));
};

const ArchiveChapter: React.FC<ArchiveChapterProps> = ({
  chapter,
  archiveIds,
  compiledArchives,
  search,
  onLike,
  likesMap,
}) => {
  const archives = archiveIds
    .map((id) => compiledArchives.archives[id])
    .filter(Boolean) as Archive[];

  const renderArchiveItem = (item: Archive) => (
    <List.Item
      key={item.id}
      actions={[
        <h4 key="edit" className="flex items-center">
          <EditOutlined className="mr-1" />
          {item.author.map((a, index) => (
            <Highlighter
              key={index}
              searchWords={[search]}
              autoEscape
              textToHighlight={`${a} `}
            />
          ))}
        </h4>,
        <div key="publisher" className="flex items-center">
          <BankOutlined className="mr-2" />
          <Highlighter
            searchWords={[search]}
            autoEscape
            textToHighlight={item.publisher}
          />
        </div>,
        <div key="date" className="flex items-center">
          <CalendarOutlined className="mr-2" />
          <Highlighter
            searchWords={[search]}
            autoEscape
            textToHighlight={item.date}
          />
        </div>,
      ]}
      className="py-4" // Tailwind for padding
    >
      <List.Item.Meta
        title={
          <div className="flex items-center">
            <Link
              href={`/archive/${item.id}`}
              target="_blank"
              rel="noreferrer"
              className="text-lg font-semibold text-primary hover:underline"
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
        }
      />
      <ArchiveListContent
        archive={item}
        search={search}
        onLike={onLike}
        likesMap={likesMap}
      />
    </List.Item>
  );

  return (
    <ChapterCard
      title={
        <h2 className="text-3xl font-bold text-gray-800 flex items-baseline">
          {chapter}
          <span className="chapter-archive-count">
            {`凡${toChineseNumbers(archives.length)}篇`}
          </span>
        </h2>
      }
      defaultActiveKey={
        chapter === "本纪" || chapter === "世家" ? chapter : undefined
      } // 默认展开前两个
    >
      <List<Archive>
        pagination={
          archives.length > 6
            ? {
                size: "small",
                showSizeChanger: false,
                showQuickJumper: false,
                pageSize: 6,
              }
            : false
        }
        className="archive-chapter-list" //
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
