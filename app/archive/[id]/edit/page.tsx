'use client';

import React, { useState, FC, useCallback, useEffect, useRef, useMemo } from 'react';
import { Form, notification, Upload, Button, Typography, Input, Select, Divider, Spin, Radio } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import {
  LinkOutlined,
  UploadOutlined,
  LoadingOutlined,
  CheckCircleOutlined,
  BookOutlined,
  DownOutlined,
  PlusOutlined,
  MinusCircleOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { useParams, useRouter } from 'next/navigation';

import MultiLinkPreview from '@/components/TributeForm/MultiLinkPreview';
import KeywordSuggestions from '@/components/TributeForm/KeywordSuggestion';
import type { TributeFormState, TributeLinkMode } from '@/lib/types';
import { TRIBUTE_CHAPTERS } from '@/lib/constants';

import { useFetchTributeInfo, useExtractHtmlInfo, useUpdateArchive } from '@/hooks/useTributeQuery';
import { useFetchArchiveById, useArchivePendingOrigsQuery } from '@/hooks/useArchivesQuery';
import { HtmlExtractResult, ArchivePendingOrig } from '@/apis/types';
import type { Archive, ArchiveOrig } from '@/apis/types';

const { TextArea } = Input;
const { Title, Text } = Typography;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const CDN_DOMAIN = process.env.NEXT_PUBLIC_CDN_DOMAIN;

const EditArchivePage: FC = () => {
  const params = useParams();
  const router = useRouter();
  const archiveId = params.id as string;

  const [form] = Form.useForm<TributeFormState>();
  const [notificationApi, contextHolder] = notification.useNotification();

  const [tributeState, setTributeState] = useState<TributeFormState>({
    links: [{ link: '', mode: 'link', pendingOrigId: null }],
    title: '',
    authors: '',
    publisher: '',
    date: '',
    chapter: '本纪',
    tags: '',
    remarks: '',
  });
  const [fileLists, setFileLists] = useState<UploadFile[][]>([[]]);
  const [previewDataList, setPreviewDataList] = useState<(HtmlExtractResult | null)[]>([null]);
  const [loadingStates, setLoadingStates] = useState<boolean[]>([false]);
  const [fetchingLink, setFetchingLink] = useState<string | null>(null);
  const [fetchingIndex, setFetchingIndex] = useState<number | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [origsMapping, setOrigsMapping] = useState<(number | null)[]>([0]); // 跟踪表单项与原始origs的映射关系
  const lastProcessedLink = useRef<{ link: string; index: number } | null>(null);

  const extractHtmlMutation = useExtractHtmlInfo();
  const updateArchiveMutation = useUpdateArchive();
  const { data: pendingOrigs = [], isLoading: isPendingOrigsLoading } = useArchivePendingOrigsQuery();

  const pendingOrigMap = useMemo(() => {
    return pendingOrigs.reduce(
      (acc, orig) => {
        acc[orig.id] = orig;
        return acc;
      },
      {} as Record<number, ArchivePendingOrig>,
    );
  }, [pendingOrigs]);

  // 构建预览 URL 的函数
  const buildPreviewUrl = (orig: ArchiveOrig): string | null => {
    if (!orig.storageUrl) return null;

    if (orig.storageType === 'oss') {
      return `${CDN_DOMAIN}/archives/origs/${orig.storageUrl}`;
    } else if (orig.storageType === 's3') {
      return `${API_BASE_URL}/archives/content/${orig.storageUrl}`;
    } else {
      return null;
    }
  };

  // 获取归档详情
  const { data: archiveData, isLoading: isLoadingArchive, error: archiveError } = useFetchArchiveById(archiveId);

  // 使用 hook 获取链接信息
  const {
    data: fetchTributeData,
    isLoading: isFetchingTribute,
    error: fetchTributeError,
  } = useFetchTributeInfo(fetchingLink, { enabled: !!fetchingLink });

  const updateFormValues = useCallback(
    (values: Partial<TributeFormState>) => {
      form.setFieldsValue(values);
    },
    [form],
  );

  // 初始化表单数据
  useEffect(() => {
    if (archiveData && !isInitialized) {
      const initFormData: TributeFormState = {
        links:
          archiveData.origs?.length > 0
            ? archiveData.origs.map((orig) => ({
                link: orig.originalUrl || '',
                mode: orig.originalUrl ? 'link' : 'upload',
                pendingOrigId: null,
              }))
            : [{ link: '', mode: 'link', pendingOrigId: null }],
        title: archiveData.title || '',
        authors: archiveData.authors?.map((author) => author.name).join(', ') || '',
        publisher: archiveData.publisher?.name || '',
        date: archiveData.date?.value || '',
        chapter: archiveData.chapter || '本纪',
        tags: archiveData.tags?.map((tag) => tag.name).join(', ') || '',
        remarks: archiveData.remarks || '',
      };

      form.setFieldsValue(initFormData);
      setTributeState(initFormData);

      // 初始化文件列表和预览数据
      const initFileLists = archiveData.origs?.length > 0 ? archiveData.origs.map(() => []) : [[]];
      const initPreviewDataList = archiveData.origs?.length > 0 ? archiveData.origs.map(() => null) : [null];
      const initLoadingStates = archiveData.origs?.length > 0 ? archiveData.origs.map(() => false) : [false];
      const initOrigsMapping = archiveData.origs?.length > 0 ? archiveData.origs.map((_, index) => index) : [0];

      setFileLists(initFileLists);
      setPreviewDataList(initPreviewDataList);
      setLoadingStates(initLoadingStates);
      setOrigsMapping(initOrigsMapping);
      setIsInitialized(true);
    }
  }, [archiveData, isInitialized, form]);

  // 处理获取到的链接信息
  useEffect(() => {
    if (fetchingIndex === null || !fetchingLink) return;

    // 防止处理重复的响应
    if (lastProcessedLink.current?.link === fetchingLink && lastProcessedLink.current?.index === fetchingIndex) return;

    // 当数据获取完成且有数据时
    if (fetchTributeData && !isFetchingTribute) {
      const { title, author, publisher, date, summary, keywords } = fetchTributeData;

      // 只更新空字段，不覆盖已有的字段信息
      const currentFormValues = form.getFieldsValue();
      const newFormValues: Partial<TributeFormState> = {};

      // 只有当字段为空时才更新
      if (title && (!currentFormValues.title || currentFormValues.title.trim() === '')) {
        newFormValues.title = title;
      }
      if (author && (!currentFormValues.authors || currentFormValues.authors.trim() === '')) {
        newFormValues.authors = Array.isArray(author) ? author.join(', ') : author;
      }
      if (publisher && (!currentFormValues.publisher || currentFormValues.publisher.trim() === '')) {
        newFormValues.publisher = publisher;
      }
      if (date && (!currentFormValues.date || currentFormValues.date.trim() === '')) {
        newFormValues.date = date;
      }

      // 只有当有字段需要更新时才调用 updateFormValues
      if (Object.keys(newFormValues).length > 0) {
        updateFormValues(newFormValues);
      }

      // 设置预览数据
      setPreviewDataList((prev) => {
        const newPreviewDataList = [...prev];
        newPreviewDataList[fetchingIndex] = {
          title,
          author,
          publisher,
          date,
          summary,
          keywords: keywords || { predefined: [], extracted: [] },
        };
        return newPreviewDataList;
      });

      notificationApi.success({
        message: '信息获取成功',
        description: '已从链接获取信息，请核对并补充。',
        icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      });

      // 标记已处理并重置状态
      lastProcessedLink.current = { link: fetchingLink, index: fetchingIndex };
      setFetchingLink(null);
      setFetchingIndex(null);
    }
    // 当有错误且不在加载中时
    else if (fetchTributeError && !isFetchingTribute) {
      notificationApi.error({
        message: '获取链接信息失败',
        description: fetchTributeError.message || '请检查链接是否正确或稍后再试。',
      });

      // 标记已处理并重置状态
      lastProcessedLink.current = { link: fetchingLink, index: fetchingIndex };
      setFetchingLink(null);
      setFetchingIndex(null);
    }
  }, [
    fetchTributeData,
    isFetchingTribute,
    fetchTributeError,
    fetchingIndex,
    fetchingLink,
    updateFormValues,
    notificationApi,
    form,
  ]);

  // 单独处理加载状态更新，避免无限循环
  useEffect(() => {
    if (fetchingIndex !== null) {
      setLoadingStates((prev) => {
        const newLoadingStates = [...prev];
        newLoadingStates[fetchingIndex] = isFetchingTribute;
        return newLoadingStates;
      });
    }
  }, [fetchingIndex, isFetchingTribute]);

  const handleFormValuesChange = (_changedValues: Partial<TributeFormState>, allValues: TributeFormState) => {
    setTributeState(allValues);
  };

  const handleModeChange = (index: number, nextMode: TributeLinkMode) => {
    const links = form.getFieldValue('links') || [];
    const current = links[index] || { link: '', mode: 'link', pendingOrigId: null };

    if (current.mode === nextMode) {
      return;
    }

    const updated = {
      ...current,
      mode: nextMode,
      link: nextMode === 'link' ? current.link || '' : '',
      pendingOrigId: nextMode === 'pendingOrig' ? (current.pendingOrigId ?? null) : null,
    };

    if (nextMode !== 'pendingOrig') {
      updated.pendingOrigId = null;
    }
    if (nextMode !== 'link') {
      updated.link = '';
    }

    const newLinks = [...links];
    newLinks[index] = updated;
    form.setFieldValue('links', newLinks);

    setFileLists((prev) => {
      const next = [...prev];
      if (nextMode === 'upload') {
        next[index] = next[index] || [];
      } else {
        next[index] = [];
      }
      return next;
    });

    setPreviewDataList((prev) => {
      const next = [...prev];
      if (nextMode !== 'link') {
        next[index] = null;
      }
      return next;
    });

    setLoadingStates((prev) => {
      const next = [...prev];
      next[index] = nextMode === 'link' ? prev[index] : false;
      return next;
    });

    setTributeState(form.getFieldsValue() as TributeFormState);
  };

  const getPendingOrigUrl = (pendingOrigId?: number | null) => {
    if (!pendingOrigId) return null;
    const orig = pendingOrigMap[pendingOrigId];
    if (!orig?.storageUrl) return null;
    return `${API_BASE_URL}/archives/content/${orig.storageUrl}`;
  };

  const getFilenameWithoutExtension = (filename: string): string => {
    return filename.substring(0, filename.lastIndexOf('.')) || filename;
  };

  const handleFetchLinkInfo = (index: number) => {
    const links = form.getFieldValue('links') || [];
    const linkData = links[index];
    if (linkData?.mode !== 'link') return;
    if (!linkData?.link || linkData.link.trim() === '') {
      notificationApi.warning({ message: '请输入有效的文章链接' });
      return;
    }

    lastProcessedLink.current = null;

    // 清空对应索引的预览数据
    setPreviewDataList((prev) => {
      const newPreviewDataList = [...prev];
      newPreviewDataList[index] = null;
      return newPreviewDataList;
    });

    // 设置要获取信息的链接和索引，这将触发 useFetchTributeInfo hook
    setFetchingLink(linkData.link.trim());
    setFetchingIndex(index);
  };

  const handleExtractHtmlInfo = async (file: File, index: number) => {
    // 清空对应索引的预览数据
    setPreviewDataList((prev) => {
      const newPreviewDataList = [...prev];
      newPreviewDataList[index] = null;
      return newPreviewDataList;
    });
    const formData = new FormData();
    formData.append('file', file);

    extractHtmlMutation.mutate(formData, {
      onSuccess: (response) => {
        if (response && response.success && response.data) {
          notificationApi.success({
            message: 'HTML信息提取成功',
            description: `已从文件 ${file.name} 提取信息，请核对并补充。`,
          });
          const { title, author, publisher, date, summary, keywords } = response.data;

          // 只更新空字段，不覆盖已有的字段信息
          const currentFormValues = form.getFieldsValue();
          const newFormValues: Partial<TributeFormState> = {};

          // 对于标题，如果当前字段为空，优先使用提取的标题，否则使用文件名
          if (!currentFormValues.title || currentFormValues.title.trim() === '') {
            newFormValues.title = title || getFilenameWithoutExtension(file.name);
          }

          // 其他字段只有当为空时才更新
          if (author && (!currentFormValues.authors || currentFormValues.authors.trim() === '')) {
            newFormValues.authors = Array.isArray(author) ? author.join(', ') : author;
          }
          if (publisher && (!currentFormValues.publisher || currentFormValues.publisher.trim() === '')) {
            newFormValues.publisher = publisher;
          }
          if (date && (!currentFormValues.date || currentFormValues.date.trim() === '')) {
            newFormValues.date = date;
          }

          // 只有当有字段需要更新时才调用 updateFormValues
          if (Object.keys(newFormValues).length > 0) {
            updateFormValues(newFormValues);
          }

          setPreviewDataList((prev) => {
            const newPreviewDataList = [...prev];
            newPreviewDataList[index] = {
              title: title || getFilenameWithoutExtension(file.name),
              author,
              publisher,
              date,
              summary,
              keywords,
            };
            return newPreviewDataList;
          });
        } else {
          notificationApi.warning({
            message: 'HTML信息提取不完整',
            description: '请手动填写。',
          });
          const currentTitle = form.getFieldValue('title');
          if (!currentTitle || currentTitle.trim() === '') {
            updateFormValues({ title: getFilenameWithoutExtension(file.name) });
          }
        }
      },
      onError: (error: any) => {
        notificationApi.error({
          message: 'HTML信息提取失败',
          description: error.message || '请检查文件或稍后再试。',
        });
        const currentTitle = form.getFieldValue('title');
        if (!currentTitle || currentTitle.trim() === '') {
          updateFormValues({ title: getFilenameWithoutExtension(file.name) });
        }
      },
    });
  };

  const handleFileUploadChange = (info: any, index: number) => {
    const links = form.getFieldValue('links') || [];
    if (links[index]?.mode !== 'upload') {
      return;
    }

    let newFileList = [...info.fileList].slice(-1);
    newFileList = newFileList.filter((file) => {
      const isValidType =
        (file.type && ['text/html', 'application/pdf', 'image/png', 'image/jpeg'].includes(file.type)) ||
        (file.name &&
          (file.name.endsWith('.html') ||
            file.name.endsWith('.pdf') ||
            file.name.endsWith('.png') ||
            file.name.endsWith('.jpg') ||
            file.name.endsWith('.jpeg')));

      if (!isValidType && file.status !== 'removed') {
        notificationApi.error({
          message: '文件类型错误',
          description: '仅支持 HTML, PDF, PNG, JPG 文件。',
        });
      }
      return isValidType;
    });

    setFileLists((prev) => {
      const newFileLists = [...prev];
      newFileLists[index] = newFileList;
      return newFileLists;
    });

    if (newFileList.length > 0 && newFileList[0].originFileObj) {
      const file = newFileList[0].originFileObj;
      if (file.type === 'text/html' || file.name.endsWith('.html')) {
        handleExtractHtmlInfo(file, index);
      } else {
        const currentTitle = form.getFieldValue('title');
        if (!currentTitle || currentTitle.trim() === '') {
          updateFormValues({ title: getFilenameWithoutExtension(file.name) });
        }
      }
    } else {
      setPreviewDataList((prev) => {
        const newPreviewDataList = [...prev];
        newPreviewDataList[index] = null;
        return newPreviewDataList;
      });
    }
  };

  const onFinish = async (values: TributeFormState) => {
    const formData = new FormData();

    formData.append('title', values.title);
    formData.append('authors', values.authors);
    formData.append('publisher', values.publisher);
    formData.append('date', values.date);
    formData.append('chapter', values.chapter);
    formData.append('remarks', values.remarks);
    formData.append('tags', values.tags);

    // 处理多个链接和文件
    const originalUrls: string[] = [];
    const files: (File | string)[] = [];
    const pendingOrigIds: (number | null)[] = [];
    const pendingOrigMissing: number[] = [];

    values.links.forEach((linkData, index) => {
      const mode = linkData.mode || 'link';

      const trimmedLink = (linkData.link || '').trim();
      const origIndex = origsMapping[index];
      const existingOrig = origIndex !== null ? archiveData?.origs?.[origIndex] : null;
      const existingStorageUrl = existingOrig?.storageUrl || '';

      if (mode === 'upload') {
        originalUrls.push(trimmedLink);
        const fileList = fileLists[index] || [];
        if (fileList.length > 0 && fileList[0].originFileObj) {
          files.push(fileList[0].originFileObj);
        } else if (existingStorageUrl) {
          files.push(existingStorageUrl);
        } else {
          files.push('');
        }
        pendingOrigIds.push(null);
      } else if (mode === 'pendingOrig') {
        originalUrls.push('');
        const pendingId = linkData.pendingOrigId ?? null;
        pendingOrigIds.push(pendingId);
        files.push('');
        if (!pendingId) {
          pendingOrigMissing.push(index + 1);
        }
      } else {
        originalUrls.push(trimmedLink);
        if (existingStorageUrl) {
          files.push(existingStorageUrl);
        } else {
          files.push('');
        }
        pendingOrigIds.push(null);
      }
    });

    if (pendingOrigMissing.length > 0) {
      notificationApi.error({
        message: '缺少待处理原稿',
        description: `第 ${pendingOrigMissing.join(', ')} 条请选择待处理原稿。`,
      });
      return;
    }

    // 至少需要存在一种有效输入
    const hasValidInput =
      originalUrls.some((url) => url.trim() !== '') ||
      files.some((file) => file instanceof File) ||
      files.some((file) => typeof file === 'string' && file.trim() !== '') ||
      pendingOrigIds.some((id) => id !== null);

    if (!hasValidInput) {
      notificationApi.error({
        message: '缺少输入',
        description: '请至少提供一个有效的链接、上传文件或选择待处理原稿。',
      });
      return;
    }

    files.forEach((file) => {
      formData.append('files', file);
    });

    formData.append('originalUrls', originalUrls.join(','));
    formData.append('pendingOrigIds', pendingOrigIds.map((id) => (id === null ? '' : String(id))).join(','));

    updateArchiveMutation.mutate(
      { id: archiveId, formData },
      {
        onSuccess: () => {
          notificationApi.success({
            message: '更新成功',
            description: `文章 "${values.title}" 已成功更新。`,
            icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
            duration: null,
          });

          // 延迟跳转到详情页
          setTimeout(() => {
            router.push(`/archive/${archiveId}`);
          }, 1500);
        },
        onError: (error: any) => {
          notificationApi.error({
            message: '更新失败',
            description: error.message || '请检查网络或联系管理员。',
          });
        },
      },
    );
  };

  const handleSelectKeyword = (keyword: string) => {
    const currentTags = form.getFieldValue('tags')?.trim() || '';
    const newTags = currentTags ? `${currentTags}, ${keyword}` : keyword;
    updateFormValues({ tags: newTags });
    notificationApi.success({
      message: '关键词已添加',
      description: `"${keyword}" 已添加到标签。`,
      duration: 2,
    });
  };

  const handleSelectAllKeywords = (keywords: string[]) => {
    if (keywords.length === 0) return;
    const currentTags = form.getFieldValue('tags')?.trim() || '';
    const newKeywordsString = keywords.join(', ');
    const newTags = currentTags ? `${currentTags}, ${newKeywordsString}` : newKeywordsString;
    updateFormValues({ tags: newTags });
    notificationApi.success({
      message: '所有建议关键词已添加',
      description: `${keywords.length}个关键词已添加到标签。`,
      duration: 2,
    });
  };

  if (isLoadingArchive) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  if (archiveError) {
    return (
      <div className="mx-auto my-8 w-[90%] max-w-5xl text-center">
        <Title level={3}>加载失败</Title>
        <Text type="danger">{archiveError.message || '归档不存在或已被删除'}</Text>
      </div>
    );
  }

  if (!archiveData) {
    return (
      <div className="mx-auto my-8 w-[90%] max-w-5xl text-center">
        <Title level={3}>归档不存在</Title>
        <Text type="secondary">请检查链接是否正确</Text>
      </div>
    );
  }

  return (
    <>
      {contextHolder}
      <div className="mx-auto my-8 w-[90%] max-w-5xl">
        <Title level={2} className="text-primary mb-8 flex items-center justify-center text-center">
          <EditOutlined className="mr-2" /> 编辑归档
        </Title>
        <div className="flex flex-col gap-6 md:flex-row">
          <div className="min-w-[320px] flex-grow md:w-2/3">
            <Form form={form} layout="vertical" onFinish={onFinish} onValuesChange={handleFormValuesChange}>
              <Form.List name="links">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }, index) => {
                      const currentLink = tributeState.links?.[index];
                      const currentMode = currentLink?.mode ?? 'link';
                      const isLinkMode = currentMode === 'link';
                      const isUploadMode = currentMode === 'upload';
                      const isPendingMode = currentMode === 'pendingOrig';
                      const pendingOrigId = currentLink?.pendingOrigId ?? null;
                      const pendingOrigUrl = getPendingOrigUrl(pendingOrigId);
                      const origIndex = origsMapping[index];
                      const origData = origIndex !== null ? archiveData?.origs?.[origIndex] : null;
                      const hasStoredFile = !!origData?.storageUrl;
                      const storedFilePreviewUrl = hasStoredFile ? buildPreviewUrl(origData as ArchiveOrig) : null;

                      const activateMode = (mode: TributeLinkMode) => {
                        if (currentMode !== mode) {
                          handleModeChange(index, mode);
                        }
                      };

                      const handleCardKeyDown = (event: React.KeyboardEvent<HTMLDivElement>, mode: TributeLinkMode) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          activateMode(mode);
                        }
                      };

                      const getCardClasses = (active: boolean) =>
                        `rounded-lg border p-4 transition focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                          active ? 'border-primary bg-primary/5 shadow-sm' : 'border-gray-200 hover:border-primary/60'
                        }`;

                      return (
                        <div
                          key={key}
                          className="edit-archive-card relative mb-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                        >
                          <div className="mb-3 flex items-center justify-between">
                            <Text strong className="text-sm text-gray-700">
                              文件信息 {index + 1}
                            </Text>
                            {fields.length > 1 && (
                              <Button
                                type="text"
                                icon={<MinusCircleOutlined />}
                                onClick={() => {
                                  remove(name);
                                  setFileLists((prev) => {
                                    const newFileLists = [...prev];
                                    newFileLists.splice(index, 1);
                                    return newFileLists;
                                  });
                                  setLoadingStates((prev) => {
                                    const newLoadingStates = [...prev];
                                    newLoadingStates.splice(index, 1);
                                    return newLoadingStates;
                                  });
                                  setPreviewDataList((prev) => {
                                    const newPreviewDataList = [...prev];
                                    newPreviewDataList.splice(index, 1);
                                    return newPreviewDataList;
                                  });
                                  setOrigsMapping((prev) => {
                                    const newOrigsMapping = [...prev];
                                    newOrigsMapping.splice(index, 1);
                                    return newOrigsMapping;
                                  });
                                }}
                                danger
                                size="small"
                                className="hover:bg-red-50"
                              />
                            )}
                          </div>

                          {hasStoredFile ? (
                            <div className="mb-4 rounded-md border border-gray-200 bg-gray-50 p-3">
                              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                                <div className="flex-1">
                                  <Text type="secondary" className="mb-1 block text-xs">
                                    已存储的文件
                                  </Text>
                                  <Text className="font-mono text-sm break-all">{origData?.storageUrl}</Text>
                                </div>
                                <Button
                                  type="link"
                                  size="small"
                                  onClick={() => {
                                    if (storedFilePreviewUrl) {
                                      window.open(storedFilePreviewUrl, '_blank', 'noopener,noreferrer');
                                    }
                                  }}
                                  className="mt-2 ml-0 flex-shrink-0 md:mt-0 md:ml-4"
                                  disabled={!storedFilePreviewUrl}
                                >
                                  预览
                                </Button>
                              </div>
                            </div>
                          ) : null}

                          <Radio.Group
                            className="flex flex-col gap-4"
                            value={currentMode}
                            onChange={(event) => handleModeChange(index, event.target.value as TributeLinkMode)}
                          >
                            <div
                              className={`${getCardClasses(isLinkMode)} cursor-pointer`}
                              role="button"
                              tabIndex={0}
                              onClick={() => activateMode('link')}
                              onKeyDown={(event) => handleCardKeyDown(event, 'link')}
                            >
                              <Radio value="link" className="flex w-full items-start gap-3">
                                <div className="flex-1">
                                  <div className="flex flex-col gap-1 text-left md:flex-row md:items-center md:gap-3">
                                    <span className="font-medium text-gray-800">使用链接</span>
                                    <span className="text-xs text-gray-500">输入文章链接并尝试自动提取信息</span>
                                  </div>
                                </div>
                              </Radio>
                              <div className={`mt-3 pl-7 ${!isLinkMode ? 'pointer-events-none opacity-60' : ''}`}>
                                <Form.Item {...restField} name={[name, 'link']} className="mb-0">
                                  <Input.Search
                                    placeholder="http(s)://..."
                                    disabled={!isLinkMode || extractHtmlMutation.isPending}
                                    addonBefore={<LinkOutlined />}
                                    onSearch={() => handleFetchLinkInfo(index)}
                                    enterButton={
                                      <Button
                                        type="primary"
                                        onClick={() => handleFetchLinkInfo(index)}
                                        loading={loadingStates[index]}
                                        disabled={!isLinkMode || extractHtmlMutation.isPending}
                                      >
                                        获取信息
                                      </Button>
                                    }
                                  />
                                </Form.Item>
                              </div>
                            </div>

                            <div
                              className={`${getCardClasses(isUploadMode)} cursor-pointer`}
                              role="button"
                              tabIndex={0}
                              onClick={() => activateMode('upload')}
                              onKeyDown={(event) => handleCardKeyDown(event, 'upload')}
                            >
                              <div className="flex w-full items-start gap-3">
                                <Radio value="upload" />
                                <div className="flex-1">
                                  <div className="flex flex-col gap-1 text-left md:flex-row md:items-center md:gap-3">
                                    <span className="font-medium text-gray-800">上传文件</span>
                                    <span className="text-xs text-gray-500">手动上传文件 (支持HTML, PDF, PNG, JPG)</span>
                                  </div>
                                  <div className={`mt-3 ${!isUploadMode ? 'pointer-events-none opacity-60' : ''}`}>
                                    <Upload
                                      fileList={fileLists[index] || []}
                                      onChange={(info) => handleFileUploadChange(info, index)}
                                      beforeUpload={() => false}
                                      accept=".html,text/html,.pdf,application/pdf,.png,image/png,.jpg,.jpeg,image/jpeg"
                                      maxCount={1}
                                      disabled={!isUploadMode || extractHtmlMutation.isPending}
                                    >
                                      <Button
                                        icon={extractHtmlMutation.isPending ? <LoadingOutlined /> : <UploadOutlined />}
                                        disabled={!isUploadMode || extractHtmlMutation.isPending}
                                      >
                                        {extractHtmlMutation.isPending ? '处理文件中...' : '选择文件'}
                                      </Button>
                                    </Upload>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div
                              className={`${getCardClasses(isPendingMode)} cursor-pointer`}
                              role="button"
                              tabIndex={0}
                              onClick={() => activateMode('pendingOrig')}
                              onKeyDown={(event) => handleCardKeyDown(event, 'pendingOrig')}
                            >
                              <div className="flex w-full items-start gap-3">
                                <Radio value="pendingOrig" />
                                <div className="flex-1">
                                  <div className="flex flex-col gap-1 text-left md:flex-row md:items-center md:gap-3">
                                    <span className="font-medium text-gray-800">邮件附件</span>
                                    <span className="text-xs text-gray-500">从邮件附件待归档列表中选择</span>
                                  </div>
                                  <div className={`mt-3 ${!isPendingMode ? 'pointer-events-none opacity-60' : ''}`}>
                                    <Form.Item {...restField} name={[name, 'pendingOrigId']} className="mb-2">
                                      <Select
                                        placeholder="选择待处理原稿"
                                        loading={isPendingOrigsLoading}
                                        allowClear
                                        disabled={!isPendingMode}
                                        optionLabelProp="data-label"
                                      >
                                        {pendingOrigs.map((orig) => (
                                          <Select.Option key={orig.id} value={orig.id} data-label={orig.originalFilename}>
                                            <div className="flex flex-col">
                                              <span className="font-medium text-gray-700">{orig.originalFilename}</span>
                                              <span className="text-xs text-gray-500">{orig.senderEmail}</span>
                                              <span className="text-xs text-gray-500">{orig.subject || '（无主题）'}</span>
                                            </div>
                                          </Select.Option>
                                        ))}
                                      </Select>
                                    </Form.Item>
                                    <div className="flex justify-end">
                                      <Button
                                        type="primary"
                                        onClick={() => pendingOrigUrl && window.open(pendingOrigUrl, '_blank', 'noreferrer')}
                                        disabled={!isPendingMode || !pendingOrigUrl}
                                      >
                                        查看原稿
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Radio.Group>
                        </div>
                      );
                    })}

                    <Form.Item className="mb-4">
                      <Button
                        type="dashed"
                        onClick={() => {
                          if (fields.length < 10) {
                            add({ link: '', mode: 'link', pendingOrigId: null });
                            setFileLists((prev) => [...prev, []]);
                            setLoadingStates((prev) => [...prev, false]);
                            setPreviewDataList((prev) => [...prev, null]);
                            setOrigsMapping((prev) => [...prev, null]);
                          }
                        }}
                        disabled={fields.length >= 10}
                        block
                        icon={<PlusOutlined />}
                      >
                        添加文件 ({fields.length}/10)
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>

              <Divider orientation="left" className="!mb-4 text-sm">
                文章信息
              </Divider>

              <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
                <Form.Item label="标题" name="title" rules={[{ required: true, message: '请输入标题' }]} className="mb-3">
                  <Input placeholder="文章标题" />
                </Form.Item>
                <Form.Item label="作者" name="authors" className="mb-3">
                  <Input placeholder="作者 (多人用逗号隔开)" />
                </Form.Item>
                <Form.Item label="出版方/来源" name="publisher" className="mb-3">
                  <Input placeholder="例如：微信公众号、知乎、纽约时报" />
                </Form.Item>
                <Form.Item label="日期" name="date" className="mb-3">
                  <Input placeholder="格式：YYYY-MM-DD 或 YYYY-MM" />
                </Form.Item>
                <Form.Item label="章节" name="chapter" rules={[{ required: true, message: '请选择章节' }]} className="mb-3">
                  <Select
                    placeholder="选择文章所属章节"
                    suffixIcon={<DownOutlined />}
                    options={TRIBUTE_CHAPTERS.map((chapter) => ({
                      label: chapter,
                      value: chapter,
                    }))}
                  />
                </Form.Item>
                <Form.Item label="标签" name="tags" className="mb-3">
                  <Input placeholder="标签 (多个用逗号隔开)" />
                </Form.Item>
              </div>

              <KeywordSuggestions
                summary={previewDataList.find((data) => data?.summary)?.summary}
                keywords={previewDataList.reduce(
                  (acc, data) => {
                    if (!data?.keywords) return acc;
                    return {
                      predefined: [...(acc?.predefined || []), ...data.keywords.predefined],
                      extracted: [...(acc?.extracted || []), ...data.keywords.extracted],
                    };
                  },
                  undefined as { predefined: string[]; extracted: string[] } | undefined,
                )}
                loading={loadingStates.some((loading) => loading) || extractHtmlMutation.isPending}
                onSelectKeyword={handleSelectKeyword}
                onSelectAllKeywords={handleSelectAllKeywords}
              />

              <Form.Item label="备注/摘要" name="remarks" className="mb-3">
                <TextArea placeholder="关于文章的简要备注或摘要内容" rows={4} />
              </Form.Item>

              <Form.Item className="mt-6">
                <div className="flex w-full gap-4">
                  <Button type="default" onClick={() => router.push(`/archive/${archiveId}`)} size="large" className="flex-1">
                    取消
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={updateArchiveMutation.isPending}
                    size="large"
                    className="flex-1"
                  >
                    更新归档
                  </Button>
                </div>
              </Form.Item>
            </Form>
          </div>
          <div className="sticky top-20 self-start md:w-1/3">
            <MultiLinkPreview
              previewDataList={previewDataList}
              loading={loadingStates.some((loading) => loading) || extractHtmlMutation.isPending}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default EditArchivePage;
