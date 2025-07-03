"use client";

import React, { FC } from "react";
import { Button } from "antd";
import { SketchOutlined, DownOutlined, UpOutlined } from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ExpandCollapse from "@/components/ExpandCollapse";
import type { Archive } from "@/lib/types";
import ButtonGroup from "antd/es/button/button-group";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface ArchiveListContentProps {
  archive: Archive;
  search: string;
  onLike: (archiveId: number, isLike: boolean) => void;
}

const processMdImgSyntax = (md: string) => {
  return md?.replace(/!\[\]\((.+?)\)/g, (match, g1) => {
    if (g1.startsWith("http://") || g1.startsWith("https://")) {
      return match;
    }
    return `![](${API_BASE_URL}/archives/content/${g1})`;
  });
};

const ArchiveListContent: FC<ArchiveListContentProps> = ({
  archive,
  search,
  onLike,
}) => {
  const currentLikes = archive.likes ?? 0;

  const handleLike = (isLike: boolean) => {
    onLike(archive.id, isLike);
  };

  const renderers = {
    text: ({ value }: { value: string }) => (
      <Highlighter searchWords={[search]} autoEscape textToHighlight={value} />
    ),
    inlineCode: ({ value }: { value: string }) => (
      <code className="bg-gray-100 border border-gray-300 rounded px-1 py-0.5 text-sm text-red-700">
        <Highlighter
          searchWords={[search]}
          autoEscape
          textToHighlight={value}
        />
      </code>
    ),
    img: ({
      alt,
      src,
      title,
    }: {
      alt?: string;
      src?: string;
      title?: string;
    }) => {
      if (!src) return null;
      const resolvedSrc = src.startsWith("http")
        ? src
        : `${API_BASE_URL}/archives/content/${src}`;
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt={alt}
          src={resolvedSrc}
          title={title}
          className="max-w-full h-auto my-2"
        />
      );
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
        <div className="prose prose-sm max-w-none react-markdown!">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={renderers as any}
          >
            {processMdImgSyntax(archive.remarks || "")}
          </ReactMarkdown>
        </div>
      </ExpandCollapse>
      <div className="flex items-center mt-4 leading-[22px]">
        <ButtonGroup>
          <Button
            className={`flex items-center justify-center border border-gray-200 h-8 px-3.5 text-base rounded-sm ${
              currentLikes > 0 && "text-primary"
            }`}
            icon={<SketchOutlined className="rotate-180" />}
            onClick={() => handleLike(true)}
            type="text"
            size="small"
          >
            {currentLikes > 0 && <span>{currentLikes}</span>}
          </Button>
          <Button
            className="flex items-center justify-center border border-gray-200 h-8 px-3.5 text-base rounded-sm"
            icon={<SketchOutlined />}
            onClick={() => handleLike(false)}
            type="text"
            size="small"
          />
        </ButtonGroup>
        <div className="text-black/45 pl-3">
          <Highlighter
            searchWords={[search]}
            autoEscape
            textToHighlight={String(archive.id)}
          />
        </div>
      </div>
    </div>
  );
};

export default ArchiveListContent;
