'use client';

import React, { FC, useEffect } from 'react';
import { PageContainer, PageLoading } from '@ant-design/pro-components';
import { Card, List, Tag, Button, message as AntMessage, Typography, Spin } from 'antd';
import Icon, { BankOutlined, CalendarOutlined, EditOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useRouter, useParams, notFound } from 'next/navigation';
import ArchiveListContent from '@/components/ArchiveListContent';
import CommentSection from '@/components/CommentSection';
import { useFetchArchiveById } from '@/hooks/useArchivesQuery';
import { useUpdateLike } from '@/hooks/useLikesQuery';
import { useFetchComments, useSubmitComment } from '@/hooks/useCommentsQuery';
import { renderOrigsLinks } from '@/components/renderOrigsLinks';
import EditSVG from '@/public/svgs/edit.svg?component';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const CDN_DOMAIN = process.env.NEXT_PUBLIC_CDN_DOMAIN;

const ArchiveDetailPageContent: FC<{ articleId: string }> = ({ articleId }) => {
  const router = useRouter();

  const {
    data: archive,
    isLoading: isLoadingArchive,
    error: archiveError,
    isError: isArchiveError,
  } = useFetchArchiveById(articleId);

  const { data: comments, isLoading: isLoadingComments } = useFetchComments(articleId);

  const updateLikeMutation = useUpdateLike();
  const submitCommentMutation = useSubmitComment();

  useEffect(() => {
    if (isArchiveError && (archiveError as any)?.status === 404) {
      notFound();
    } else if (archiveError) {
      AntMessage.error((archiveError as any).message || '加载文章失败。');
    }
  }, [archiveError, isArchiveError]);

  const handleLike = (id: number, isLike: boolean) => {
    updateLikeMutation.mutate({ articleId: String(id), like: isLike });
  };

  const handleCommentSubmit = async (content: string, authorName?: string) => {
    if (!archive) return;

    submitCommentMutation.mutate(
      { articleId: String(archive.id), content, nickname: authorName },
      {
        onSuccess: (response) => {
          if (response.success) {
            AntMessage.success('评论已发表！');
          } else {
            AntMessage.error(response.message || '评论发表失败。');
          }
        },
        onError: (error: any) => AntMessage.error(error.message || '评论发表失败。'),
      },
    );
  };

  if (isLoadingArchive) {
    return <PageLoading />;
  }

  if (!archive) {
    return (
      <PageContainer title="文章加载出错">
        <Card>
          <Typography.Text>无法加载文章内容，请返回首页。</Typography.Text>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title={
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={() => router.back()}
          className="text-primary hover:text-primary-dark mb-2 h-auto p-0"
        >
          返回列表
        </Button>
      }
      className="pb-0"
      header={{
        title: (
          <div className="font-bold">
            <header className="text-5xl">兰亭文存</header>
            <span className="text-primary flex pt-7 text-sm">兰亭已矣, 梓泽丘墟. 何处世家? 几人游侠?</span>
          </div>
        ),
      }}
    >
      <Card variant="borderless" className="mb-6 p-3 shadow-none">
        <List
          itemLayout="vertical"
          dataSource={[archive]}
          renderItem={(archive) => (
            <List.Item
              key={archive.id}
              actions={[
                archive.authors && archive.authors.length > 0 && (
                  <span key="author" className="text-heading font-medium">
                    <EditOutlined className="mr-1" /> {archive.authors.map((author) => author.name).join(' ')}
                  </span>
                ),
                archive.publisher && (
                  <span key="publisher">
                    <BankOutlined className="mr-2" /> {archive.publisher.name}
                  </span>
                ),
                archive.date && (
                  <span key="date">
                    <CalendarOutlined className="mr-2" /> {archive.date.value}
                  </span>
                ),
              ]}
              className="py-4 first:pt-0 last:pb-0 [&_.ant-list-item-action]:ms-0"
            >
              <List.Item.Meta
                title={
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-heading text-base font-medium">{archive.title}</span>
                      {renderOrigsLinks(archive.origs)}
                    </div>
                    <Button
                      type="link"
                      size="small"
                      icon={<Icon component={EditSVG} />}
                      onClick={() => router.push(`/archive/${articleId}/edit`)}
                      className="text-heading hover:text-primary"
                    >
                      编辑
                    </Button>
                  </div>
                }
                description={
                  <div className="mt-1">
                    {archive.tags?.map((tag) => (
                      <Tag key={tag.id} className="mt-1 mr-1">
                        {tag.name}
                      </Tag>
                    ))}
                  </div>
                }
              />
              <ArchiveListContent archive={archive} search={''} onLike={handleLike} />
            </List.Item>
          )}
        />
      </Card>

      {isLoadingComments ? (
        <div className="py-5 text-center">
          <Spin />
        </div>
      ) : (
        <CommentSection
          articleId={String(archive.id)}
          comments={comments || []}
          loading={isLoadingComments}
          submitting={submitCommentMutation.isPending}
          onSubmit={handleCommentSubmit}
        />
      )}
    </PageContainer>
  );
};

const ArchivePageWrapper: FC = () => {
  const params = useParams();
  const articleId = Array.isArray(params.id) ? params.id[0] : params.id;

  if (!articleId || isNaN(Number(articleId))) {
    notFound();
  }

  return <ArchiveDetailPageContent articleId={articleId} />;
};

export default ArchivePageWrapper;
