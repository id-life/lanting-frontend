/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { FC, useState, useMemo } from "react";
import { Form, Spin, Typography, message as AntMessage } from "antd";
import { PageContainer } from "@ant-design/pro-components";
import { toChineseNumbers } from "@/lib/utils";
import Filters from "@/components/Filters";
import MiscRecipes from "@/components/MiscRecipes";
import ArchiveChapter from "@/components/ArchiveChapter";
import type { ChapterArchives, FilterValues, Archive } from "@/lib/types";
import {
  DEFAULT_FILTER_VALUES,
  CHAPTERS as CHAPTERS_LIST,
} from "@/lib/constants";

import { useFetchArchives } from "@/hooks/useArchivesQuery";
import { useUpdateLike } from "@/hooks/useLikesQuery";

const { Title } = Typography;

const initialChapterArchives: ChapterArchives = CHAPTERS_LIST.reduce(
  (acc, chapter) => {
    acc[chapter] = [];
    return acc;
  },
  {} as ChapterArchives
);

const filterOneChapterArchives = (
  filters: FilterValues,
  archiveIds: number[],
  archivesData: Record<number, Archive>
): number[] => {
  return archiveIds
    .filter((archiveId) => {
      const archive = archivesData[archiveId];
      if (!archive) return false;

      const confirmSearchLower = (filters.confirmSearch || "").toLowerCase();
      if (confirmSearchLower) {
        const matchesSearch =
          archive.title?.toLowerCase().includes(confirmSearchLower) ||
          archive.author?.toLowerCase().includes(confirmSearchLower) ||
          archive.publisher?.toLowerCase().includes(confirmSearchLower) ||
          archive.date?.toLowerCase().includes(confirmSearchLower) ||
          archive.remarks?.toLowerCase().includes(confirmSearchLower) ||
          String(archive.id).toLowerCase().includes(confirmSearchLower) ||
          archive.tag?.some(
            (t) => t && t.toLowerCase().includes(confirmSearchLower)
          );
        if (!matchesSearch) return false;
      }

      if (
        !filters.author.includes("all") &&
        (!archive.author || !filters.author.includes(archive.author))
      )
        return false;
      if (
        !filters.publisher.includes("all") &&
        (!archive.publisher || !filters.publisher.includes(archive.publisher))
      )
        return false;
      if (
        !filters.date.includes("all") &&
        (!archive.date ||
          !filters.date.some((d) => archive.date!.startsWith(d)))
      )
        return false;
      if (
        !filters.tag.includes("all") &&
        (!archive.tag || !archive.tag.some((t) => filters.tag.includes(t)))
      )
        return false;

      const archiveLikes = archive.likes || 0;
      if (archiveLikes < filters.likesMin || archiveLikes > filters.likesMax)
        return false;

      return true;
    })
    .sort((a, b) => {
      const archiveA = archivesData[a];
      const archiveB = archivesData[b];
      if (!archiveA || !archiveB) return 0;
      const aLikes = archiveA.likes || 0;
      const bLikes = archiveB.likes || 0;
      return bLikes - aLikes || b - a;
    });
};

const LantingPage: FC = () => {
  const [form] = Form.useForm();
  const [filters, setFilters] = useState<FilterValues>(DEFAULT_FILTER_VALUES);
  const [confirmSearch, setConfirmSearch] = useState<string>("");

  const {
    data: compiledArchives,
    isLoading: isLoadingArchives,
    isError: isArchivesError,
  } = useFetchArchives();

  const updateLikeMutation = useUpdateLike();

  const initialChapterData = useMemo<ChapterArchives>(() => {
    if (!compiledArchives?.archives) {
      return initialChapterArchives;
    }

    const chapters: ChapterArchives = {};
    for (const idStr in compiledArchives.archives) {
      const archive = compiledArchives.archives[idStr];
      if (archive && archive.chapter) {
        if (!chapters[archive.chapter]) {
          chapters[archive.chapter] = [];
        }
        chapters[archive.chapter].push(archive.id);
      }
    }

    return chapters;
  }, [compiledArchives]);

  const currentArchives = useMemo<ChapterArchives>(() => {
    if (!compiledArchives?.archives) {
      return initialChapterArchives;
    }

    const filteredChapters: ChapterArchives = {};
    for (const chapter of CHAPTERS_LIST) {
      const idsToFilter = initialChapterData[chapter] || [];
      filteredChapters[chapter] = filterOneChapterArchives(
        filters,
        idsToFilter,
        compiledArchives.archives
      );
    }
    return filteredChapters;
  }, [filters, initialChapterData, compiledArchives]);

  const totalDisplayedCount = useMemo(() => {
    return Object.values(currentArchives).reduce(
      (sum, ids) => sum + ids.length,
      0
    );
  }, [currentArchives]);

  const handleFilterChange = (_: any, values: FilterValues) => {
    setFilters(values);

    if (
      values.confirmSearch !== undefined &&
      values.confirmSearch !== confirmSearch
    ) {
      setConfirmSearch(values.confirmSearch);
    }
  };

  const handleLike = (archiveId: number, isLike: boolean) => {
    updateLikeMutation.mutate({ articleId: String(archiveId), like: isLike });
  };

  if (isLoadingArchives) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" tip="兰亭加载中..." />
      </div>
    );
  }

  if (isArchivesError) {
    AntMessage.error("加载核心数据失败，请刷新或稍后再试。", 5);
    return (
      <div className="flex justify-center items-center h-screen">
        <Typography.Text type="danger">
          加载文章列表失败，请检查网络并刷新页面。
        </Typography.Text>
      </div>
    );
  }

  const finalCompiledArchives = compiledArchives || {
    archives: {},
    fieldFreqMap: { author: {}, publisher: {}, date: {}, tag: {} },
  };

  return (
    <PageContainer
      title={
        <div className="flex items-baseline gap-2">
          <Title level={1} className="m-0 text-5xl">
            兰亭文存
          </Title>
          <span
            style={{ fontSize: 12, fontWeight: 600 }}
            className="text-primary"
          >
            凡{toChineseNumbers(String(totalDisplayedCount))}篇
          </span>
        </div>
      }
      content={
        <Filters
          form={form}
          archives={finalCompiledArchives}
          onValuesChange={handleFilterChange}
        />
      }
      className="pb-0"
    >
      <div className="w-full flex flex-col gap-6">
        {CHAPTERS_LIST.map((chapter) => (
          <ArchiveChapter
            key={chapter}
            chapter={chapter}
            archiveIds={currentArchives[chapter] || []}
            compiledArchives={finalCompiledArchives}
            search={confirmSearch}
            onLike={handleLike}
          />
        ))}
        <MiscRecipes />
      </div>
    </PageContainer>
  );
};

export default LantingPage;
