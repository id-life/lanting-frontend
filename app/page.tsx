"use client";

import React, { FC, useEffect, useState } from "react";
import { Form, Spin, Typography } from "antd";
import { PageContainer } from "@ant-design/pro-components"; // 从 @ant-design/pro-components 引入
import { toChineseNumbers } from "@/lib/utils";
import Filters from "@/components/Filters";
import MiscRecipes from "@/components/MiscRecipes";
import ArchiveChapter from "@/components/ArchiveChapter";
import type {
  Archives,
  ChapterArchives,
  FilterValues,
  SearchList,
  LikesMap,
} from "@/lib/types";
import { DEFAULT_FILTER_VALUES, CHAPTERS } from "@/lib/constants"; // 假设常量已移至 constants.ts

const { Title } = Typography;

const initialArchives: Archives = {
  archives: {},
  fieldFreqMap: { author: {}, publisher: {}, date: {}, tag: {} },
};
const initialChapterArchives: ChapterArchives = CHAPTERS.reduce(
  (acc, chapter) => {
    acc[chapter] = [];
    return acc;
  },
  {} as ChapterArchives
);

const sortByLikesAndId = (
  arr: number[],
  archivesData: Archives,
  likesMap: LikesMap
): number[] => {
  return [...arr].sort((a, b) => {
    const aLikes = likesMap[a] || archivesData.archives[a]?.likes || 0;
    const bLikes = likesMap[b] || archivesData.archives[b]?.likes || 0;
    // 优先按点赞数降序，点赞数相同则按ID降序
    if (bLikes !== aLikes) {
      return bLikes - aLikes;
    }
    return b - a;
  });
};

const filterOneChapterArchives = (
  filters: FilterValues,
  archiveIds: number[],
  archivesData: Archives,
  likesMap: LikesMap
): number[] => {
  const results = archiveIds.filter((archiveId) => {
    const archive = archivesData.archives[archiveId];
    if (!archive) return false;

    const confirmSearchLower = filters.confirmSearch.toLowerCase();
    const matchesSearch =
      archive.author.some((a) =>
        a.toLowerCase().includes(confirmSearchLower)
      ) ||
      archive.chapter.toLowerCase().includes(confirmSearchLower) ||
      archive.date.toLowerCase().includes(confirmSearchLower) ||
      String(archive.id).toLowerCase().includes(confirmSearchLower) ||
      archive.publisher.toLowerCase().includes(confirmSearchLower) ||
      archive.remarks.toLowerCase().includes(confirmSearchLower) ||
      archive.tag.some((t) => t.toLowerCase().includes(confirmSearchLower)) ||
      archive.title.toLowerCase().includes(confirmSearchLower);

    if (!matchesSearch) return false;
    if (!filters.date.includes("all") && !filters.date.includes(archive.date))
      return false;
    if (
      !filters.publisher.includes("all") &&
      !filters.publisher.includes(archive.publisher)
    )
      return false;
    if (
      !filters.author.includes("all") &&
      !filters.author.some((a) => archive.author.includes(a))
    )
      return false;
    if (
      !filters.tag.includes("all") &&
      !filters.tag.some((t) => archive.tag.includes(t))
    )
      return false;

    const archiveLikes = likesMap[archiveId] || archive.likes || 0;
    if (archiveLikes < filters.likesMin || archiveLikes > filters.likesMax)
      return false;

    return true;
  });
  return sortByLikesAndId(results, archivesData, likesMap);
};

const filterArchives = (
  filters: FilterValues,
  initialData: ChapterArchives,
  archivesData: Archives,
  likesMap: LikesMap
): ChapterArchives => {
  const chapterArchives = CHAPTERS.reduce((acc, chapter) => {
    acc[chapter] = filterOneChapterArchives(
      filters,
      initialData[chapter] || [],
      archivesData,
      likesMap
    );
    return acc;
  }, {} as ChapterArchives);
  return chapterArchives;
};

const LantingPage: FC = () => {
  const [form] = Form.useForm();
  const [compiledArchives, setCompiledArchives] =
    useState<Archives>(initialArchives);
  const [initialChapterData, setInitialChapterData] = useState<ChapterArchives>(
    initialChapterArchives
  );
  const [currentArchives, setCurrentArchives] = useState<ChapterArchives>(
    initialChapterArchives
  );
  const [confirmSearch, setConfirmSearch] = useState<string>("");
  const [searchLists, setSearchLists] = useState<SearchList[]>([]);
  const [likesMap, setLikesMap] = useState<LikesMap>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [filters, setFilters] = useState<FilterValues>(DEFAULT_FILTER_VALUES);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [archivesRes, likesRes, keywordsRes] = await Promise.all([
          fetch("/api/archives").then((res) => res.json()),
          fetch("/api/likes").then((res) => res.json()),
          fetch("/api/search-keywords").then((res) => res.json()),
        ]);

        if (archivesRes && archivesRes.archives) {
          setCompiledArchives(archivesRes);
          const initialData = CHAPTERS.reduce((acc, chapter) => {
            acc[chapter] = sortByLikesAndId(
              Object.keys(archivesRes.archives)
                .map(Number)
                .filter((id) => archivesRes.archives[id]?.chapter === chapter),
              archivesRes,
              likesRes.likes || {}
            );
            return acc;
          }, {} as ChapterArchives);
          setInitialChapterData(initialData);
          setCurrentArchives(
            filterArchives(
              filters,
              initialData,
              archivesRes,
              likesRes.likes || {}
            )
          );
          setLikesMap(likesRes.likes || {});
        }
        if (keywordsRes && keywordsRes.keywords) {
          const formattedKeywords = Object.entries(keywordsRes.keywords).map(
            ([keyword, count]) => ({
              keyword,
              count: Number(count),
              updatedAt: Date.now(), // Fake API 不提供 updatedAt，用当前时间
            })
          );
          setSearchLists(formattedKeywords);
        }
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []); // 空依赖数组，仅在组件挂载时执行

  useEffect(() => {
    if (
      compiledArchives.archives &&
      Object.keys(compiledArchives.archives).length > 0
    ) {
      setCurrentArchives(
        filterArchives(filters, initialChapterData, compiledArchives, likesMap)
      );
    }
  }, [filters, compiledArchives, initialChapterData, likesMap]);

  const handleFilterChange = (_: any, values: FilterValues) => {
    setFilters(values);
    if (values.confirmSearch !== undefined) {
      setConfirmSearch(values.confirmSearch);
      if (values.confirmSearch.trim() !== "") {
        handleSaveSearch(values.confirmSearch);
      }
    }
  };

  const handleSaveSearch = async (keyword: string) => {
    const upperKeyword = keyword.toUpperCase();
    const newSearchLists = [...searchLists];
    const existingKeywordIndex = newSearchLists.findIndex(
      (item) => item.keyword.toUpperCase() === upperKeyword
    );

    if (existingKeywordIndex > -1) {
      newSearchLists[existingKeywordIndex].count += 1;
      newSearchLists[existingKeywordIndex].updatedAt = Date.now();
    } else {
      newSearchLists.push({ keyword, count: 1, updatedAt: Date.now() });
    }
    setSearchLists(
      newSearchLists.sort(
        (a, b) => b.count - a.count || b.updatedAt - a.updatedAt
      )
    );

    try {
      await fetch("/api/search-keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword }),
      });
    } catch (error) {
      console.error("Failed to save search keyword:", error);
    }
  };

  const handleLike = async (archiveId: number, isLike: boolean) => {
    const currentArchive = compiledArchives.archives[archiveId];
    if (!currentArchive) return;

    const optimisticLikes =
      (likesMap[archiveId] || currentArchive.likes || 0) + (isLike ? 1 : -1);
    const newLikesMap = { ...likesMap, [archiveId]: optimisticLikes };
    setLikesMap(newLikesMap);

    // Optimistically update currentArchives for immediate UI feedback
    setCurrentArchives((prev) =>
      filterArchives(filters, initialChapterData, compiledArchives, newLikesMap)
    );

    try {
      const response = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId: String(archiveId), like: isLike }),
      });
      const result = await response.json();
      if (result && result.likes) {
        setLikesMap(result.likes);
        // Update again with actual data from server
        setCurrentArchives((prev) =>
          filterArchives(
            filters,
            initialChapterData,
            compiledArchives,
            result.likes
          )
        );
      } else {
        // Rollback on error
        setLikesMap((current) => {
          const rollbackMap = { ...current };
          rollbackMap[archiveId] =
            (rollbackMap[archiveId] || 0) - (isLike ? 1 : -1);
          return rollbackMap;
        });
        setCurrentArchives((prev) =>
          filterArchives(
            filters,
            initialChapterData,
            compiledArchives,
            likesMap
          )
        );
      }
    } catch (error) {
      console.error("Failed to update like:", error);
      // Rollback on error
      setLikesMap((current) => {
        const rollbackMap = { ...current };
        rollbackMap[archiveId] =
          (rollbackMap[archiveId] || 0) - (isLike ? 1 : -1);
        return rollbackMap;
      });
      setCurrentArchives((prev) =>
        filterArchives(filters, initialChapterData, compiledArchives, likesMap)
      );
    }
  };

  const count = Object.values(currentArchives).reduce(
    (sum, ids) => sum + ids.length,
    0
  );

  if (loading && !compiledArchives.archives) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <PageContainer
      title={
        <div className="flex items-baseline">
          <Title
            level={1}
            style={{ margin: 0, color: "var(--ant-primary-color)" }}
          >
            兰亭文存
          </Title>
          {count > 0 && (
            <span className="ml-2 text-sm font-semibold text-primary">
              凡{toChineseNumbers(String(count))}篇
            </span>
          )}
        </div>
      }
      content={
        <Filters
          form={form}
          archives={compiledArchives}
          searchLists={searchLists}
          onValuesChange={handleFilterChange}
        />
      }
      className="pb-0"
    >
      {CHAPTERS.map((chapter) => (
        <ArchiveChapter
          key={chapter}
          chapter={chapter}
          archiveIds={currentArchives[chapter] || []}
          compiledArchives={compiledArchives}
          search={confirmSearch}
          onLike={handleLike}
          likesMap={likesMap}
        />
      ))}
      <MiscRecipes />
    </PageContainer>
  );
};

export default LantingPage;
