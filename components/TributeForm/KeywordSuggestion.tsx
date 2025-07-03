"use client";

import React from "react";
import { Tag, Empty, Card, Button, Typography, Spin } from "antd";
import {
  TagsOutlined,
  PlusOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import { generateKeywordSuggestions } from "@/lib/services/keywordExtractor";

const { Text } = Typography;

interface KeywordSuggestionsProps {
  summary?: string | null;
  keywords?: {
    predefined: string[];
    extracted: string[];
  } | null;
  loading?: boolean;
  onSelectKeyword?: (keyword: string) => void;
  onSelectAllKeywords?: (keywords: string[]) => void;
}

const KeywordSuggestions: React.FC<KeywordSuggestionsProps> = ({
  summary,
  keywords,
  loading = false,
  onSelectKeyword,
  onSelectAllKeywords,
}) => {
  const [suggestions, setSuggestions] = React.useState<{
    predefined: string[];
    extracted: string[];
  }>({
    predefined: [],
    extracted: [],
  });

  React.useEffect(() => {
    if (keywords) {
      setSuggestions(keywords);
    } else if (summary) {
      const newSuggestions = generateKeywordSuggestions(summary);
      setSuggestions(newSuggestions);
    } else {
      setSuggestions({ predefined: [], extracted: [] });
    }
  }, [summary, keywords]);

  const handleSelect = (keyword: string) => {
    onSelectKeyword?.(keyword);
  };

  const handleSelectAll = () => {
    const allKeywords = [
      ...new Set([...suggestions.predefined, ...suggestions.extracted]),
    ]; //去重
    onSelectAllKeywords?.(allKeywords);
  };

  const hasKeywords =
    (suggestions.predefined && suggestions.predefined.length > 0) ||
    (suggestions.extracted && suggestions.extracted.length > 0);

  return (
    <Card
      size="small"
      className="my-4"
      title={
        <span className="text-sm">
          <TagsOutlined className="mr-2" />
          关键词建议
        </span>
      }
      extra={
        hasKeywords &&
        onSelectAllKeywords && (
          <Button
            type="link"
            size="small"
            onClick={handleSelectAll}
            icon={<PlusOutlined />}
          >
            全部添加
          </Button>
        )
      }
    >
      {loading ? (
        <div className="h-24 flex items-center justify-center">
          <Spin />
        </div>
      ) : !hasKeywords ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="暂无关键词建议"
          className="py-2"
        />
      ) : (
        <>
          {suggestions.predefined.length > 0 && (
            <div className="mb-2">
              <Text type="secondary" className="text-xs">
                <AppstoreOutlined className="mr-1" />
                预定义:
              </Text>
              <div className="mt-1 flex flex-wrap gap-1">
                {suggestions.predefined.map((keyword) => (
                  <Tag
                    key={`pre-${keyword}`}
                    onClick={() => handleSelect(keyword)}
                    className="cursor-pointer hover:border-primary hover:text-primary transition-all"
                  >
                    {keyword}
                  </Tag>
                ))}
              </div>
            </div>
          )}
          {suggestions.extracted.length > 0 && (
            <div>
              <Text type="secondary" className="text-xs">
                <AppstoreOutlined className="mr-1" />
                提取的:
              </Text>
              <div className="mt-1 flex flex-wrap gap-1">
                {suggestions.extracted.map((keyword) => (
                  <Tag
                    key={`ext-${keyword}`}
                    onClick={() => handleSelect(keyword)}
                    className="cursor-pointer hover:border-primary hover:text-primary transition-all"
                  >
                    {keyword}
                  </Tag>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </Card>
  );
};

export default KeywordSuggestions;
