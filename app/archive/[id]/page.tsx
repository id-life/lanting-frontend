"use client";

import React, { useEffect, useState, FC, useCallback } from "react";
import { PageContainer, PageLoading } from "@ant-design/pro-components";
import {
  Card,
  List,
  Tag,
  Typography,
  Button,
  message as AntMessage,
} from "antd";
import {
  BankOutlined,
  BookOutlined,
  CalendarOutlined,
  EditOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { useRouter, useParams, notFound } from "next/navigation";
import ArchiveListContent from "@/components/ArchiveListContent";
import CommentSection from "@/components/CommentSection";
import { CDN_DOMAIN } from "@/lib/utils";
import type { Archive, CommentData, LikesMap } from "@/lib/types";

const { Title } = Typography;

const ArchiveDetailPageContent: FC<{ articleId: string }> = ({ articleId }) => {
  const router = useRouter();
  const [archive, setArchive] = useState<Archive | null | undefined>(undefined); // undefined: loading, null: not found
  const [comments, setComments] = useState<CommentData[]>([]);
  const [likesMap, setLikesMap] = useState<LikesMap>({});

  const [loadingPageData, setLoadingPageData] = useState<boolean>(true);
  const [loadingComments, setLoadingComments] = useState<boolean>(false);
  const [submittingComment, setSubmittingComment] = useState<boolean>(false);

  const fetchArticleData = useCallback(async () => {
    if (!articleId || isNaN(Number(articleId))) {
      setArchive(null);
      setLoadingPageData(false);
      return;
    }
    setLoadingPageData(true);
    try {
      const [articleData, likesData] = await Promise.all([
        fetch(`/api/archives/${articleId}`).then((res) => res.json()),
        fetch(`/api/likes?articleId=${articleId}`).then((res) => res.json()),
      ]);

      console.log({ articleData });

      setArchive(articleData || null);

      if (likesData && likesData.likes) {
        setLikesMap(likesData.likes);
      }
    } catch (error: any) {
      console.error(`Failed to fetch article ${articleId}:`, error);
      setArchive(null);
      if (error.status !== 404) {
        AntMessage.error(error.message || "加载文章失败。");
      }
    } finally {
      setLoadingPageData(false);
    }
  }, [articleId]);

  const fetchCommentsForArticle = useCallback(async () => {
    if (!archive || !archive.id) return;
    setLoadingComments(true);
    try {
      const data = (await fetch(`/api/comments?articleId=${archive.id}`).then(
        (res) => res.json
      )) as { comments: CommentData[] };
      setComments(data.comments || []);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
      AntMessage.error("加载评论失败。");
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  }, [archive]);

  useEffect(() => {
    fetchArticleData();
  }, [fetchArticleData]);

  useEffect(() => {
    if (archive?.id) {
      fetchCommentsForArticle();
    }
  }, [archive, fetchCommentsForArticle]);

  const handleLike = async (id: number, isLike: boolean) => {
    if (!archive) return;
    const currentArchiveLikes = likesMap[id] || archive.likes || 0;
    const optimisticLikes = currentArchiveLikes + (isLike ? 1 : -1);
    const newLikesMap = {
      ...likesMap,
      [id]: optimisticLikes < 0 ? 0 : optimisticLikes,
    };
    setLikesMap(newLikesMap);

    try {
      const result = (await fetch("/api/likes", {
        method: "POST",
        body: JSON.stringify({ articleId: String(id), like: isLike }),
      }).then((res) => res.json())) as { likes: LikesMap };
      if (result && result.likes) {
        setLikesMap(result.likes);
      } else {
        setLikesMap((prev) => ({ ...prev, [id]: currentArchiveLikes }));
      }
    } catch (error: any) {
      console.error("Failed to update like:", error);
      AntMessage.error(error.message || "点赞失败，请稍后再试。");
      setLikesMap((prev) => ({ ...prev, [id]: currentArchiveLikes }));
    }
  };

  const handleCommentSubmit = async (content: string, authorName?: string) => {
    if (!archive || !archive.id) return;
    setSubmittingComment(true);
    try {
      const result = (await fetch(`/api/comments`, {
        method: "POST",
        body: JSON.stringify({
          articleId: String(archive.id),
          content,
          author: authorName,
        }),
      }).then((res) => res.json())) as {
        allComments: CommentData[];
        error?: string;
      };
      if (result.allComments) {
        setComments(result.allComments);
        AntMessage.success("评论已发表！");
      } else {
        throw new Error(result.error || "Failed to submit comment");
      }
    } catch (error: any) {
      console.error("Failed to submit comment:", error);
      AntMessage.error(error.message || "评论发表失败，请稍后再试。");
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loadingPageData) {
    return <PageLoading />;
  }

  if (archive === null) {
    notFound();
    return null;
  }
  if (!archive) {
    return <div className="p-8 text-center">文章加载中或未找到...</div>;
  }

  return (
    <PageContainer
      title={
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={() => router.back()}
          className="p-0 h-auto mb-2 text-primary hover:text-primary-dark"
        >
          返回列表
        </Button>
      }
      className="pb-0"
      header={{
        title: (
          <div className="p-2 font-bold">
            <Title level={2} className="text-5xl mb-3">
              兰亭文存
            </Title>
            <span className="text-primary text-sm">
              兰亭已矣, 梓泽丘墟. 何处世家? 几人游侠?
            </span>
          </div>
        ),
      }}
    >
      <Card variant="outlined" className="mb-6 p-3">
        <List
          itemLayout="vertical"
          dataSource={[archive]}
          renderItem={(item) => (
            <List.Item
              key={item.id}
              actions={[
                <span key="author" className="text-heading font-medium">
                  <EditOutlined className="mr-1" /> {item.author?.join(", ")}
                </span>,
                <span key="publisher">
                  <BankOutlined className="mr-2" /> {item.publisher}
                </span>,
                <span key="date">
                  <CalendarOutlined className="mr-2" /> {item.date}
                </span>,
              ]}
              className="py-4 first:pt-0 last:pb-0 [&_.ant-list-item-action]:ms-0"
            >
              <List.Item.Meta
                title={
                  <div className="flex items-center">
                    <span className="text-xl font-medium text-heading">
                      {item.title}
                    </span>
                    {item.origs &&
                      item.origs.length > 0 &&
                      item.origs.map((origFilename, index) => (
                        <a
                          key={origFilename}
                          className="ml-2 text-sm text-primary hover:underline"
                          href={`${CDN_DOMAIN}/archives/origs/${origFilename}`}
                          rel="noreferrer"
                          target="_blank"
                          title={
                            item.origs && item.origs.length > 1
                              ? `原文 ${index + 1}`
                              : "原文"
                          }
                        >
                          <BookOutlined />
                        </a>
                      ))}
                  </div>
                }
                description={
                  <div className="mt-1">
                    {item?.tag?.map((t) => (
                      <Tag key={t} className="mt-1 mr-1">
                        {t}
                      </Tag>
                    ))}
                  </div>
                }
              />
              <ArchiveListContent
                archive={item}
                search={""}
                onLike={handleLike}
                likesMap={likesMap}
              />
            </List.Item>
          )}
        />
      </Card>

      <CommentSection
        articleId={String(archive.id)}
        comments={comments}
        loading={loadingComments}
        submitting={submittingComment}
        onSubmit={handleCommentSubmit}
      />
    </PageContainer>
  );
};

const ArchivePageWrapper: FC = () => {
  const params = useParams();
  const articleId = Array.isArray(params.id) ? params.id[0] : params.id;

  if (!articleId) {
    notFound();
    return null;
  }

  if (isNaN(Number(articleId))) {
    notFound();
    return null;
  }

  return <ArchiveDetailPageContent articleId={articleId} />;
};

export default ArchivePageWrapper;
