"use client";

import React, { FC } from "react";
import { Button } from "antd";
import { SketchOutlined, DownOutlined, UpOutlined } from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ExpandCollapse from "@/components/ExpandCollapse";
import { CDN_DOMAIN } from "@/lib/utils";
import type { Archive, LikesMap } from "@/lib/types";

// const { Text } = Typography;

interface ArchiveListContentProps {
  archive: Archive;
  search: string;
  onLike: (archiveId: number, isLike: boolean) => void;
  likesMap: LikesMap;
}

const processMdImgSyntax = (md: string) => {
  return md?.replace(/!\[\]\((.+?)\)/g, (match, g1) => {
    if (g1.startsWith("http://") || g1.startsWith("https://")) {
      return match; // 已经是绝对路径，不处理
    }
    return `![](${CDN_DOMAIN}/archives/${g1})`;
  });
};

const ArchiveListContent: FC<ArchiveListContentProps> = ({
  archive,
  search,
  onLike,
  likesMap,
}) => {
  const currentLikes = likesMap[archive.id] ?? archive.likes ?? 0;

  const handleLike = (isLike: boolean) => {
    onLike(archive.id, isLike);
  };

  const renderers = {
    text: (
      { value }: { value: string } // 明确 value 类型
    ) => (
      <Highlighter searchWords={[search]} autoEscape textToHighlight={value} />
    ),
    inlineCode: (
      { value }: { value: string } // 明确 value 类型
    ) => (
      <code className="bg-gray-100 border border-gray-300 rounded px-1 py-0.5 text-sm text-red-700">
        <Highlighter
          searchWords={[search]}
          autoEscape
          textToHighlight={value}
        />
      </code>
    ),
    // 可以根据需要添加更多自定义渲染器，例如处理图片路径
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
        : `${CDN_DOMAIN}/archives/origs/${src}`;
      return (
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
    <div className="list-content">
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
        <div className="prose prose-sm max-w-none react-markdown">
          {/* prose-sm 调整基础字体大小 */}
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={renderers as any} // 使用 any 临时解决类型问题，理想情况是为 ReactMarkdown 的 components prop 提供更精确的类型
          >
            {processMdImgSyntax(archive.remarks)}
          </ReactMarkdown>
        </div>
      </ExpandCollapse>
      <div className="list-content-extra">
        <div className={`extra-up-div ${currentLikes > 0 ? "has-likes" : ""}`}>
          <Button
            className="extra-up-btn"
            icon={<SketchOutlined className="extra-up-icon" />}
            onClick={() => handleLike(true)}
            type="text"
            size="small"
          >
            {currentLikes > 0 ? ` ${currentLikes} ` : ""}
          </Button>
        </div>
        <div className="extra-down-div">
          <Button
            className="extra-down-btn"
            icon={<SketchOutlined />}
            onClick={() => handleLike(false)}
            type="text"
            size="small"
          />
        </div>
        <div className="extra-id">
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
