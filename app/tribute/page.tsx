'use client';

import React, { useState, FC, useCallback, useEffect, useRef, useMemo } from 'react';
import { Form, notification, Upload, Button, Typography, Input, Select, Space, Divider, Radio } from 'antd';
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
} from '@ant-design/icons';

import MultiLinkPreview from '@/components/TributeForm/MultiLinkPreview';
import KeywordSuggestions from '@/components/TributeForm/KeywordSuggestion';
import type { TributeFormState, TributeLinkMode } from '@/lib/types';
import { TRIBUTE_CHAPTERS, INITIAL_TRIBUTE_STATE } from '@/lib/constants';

import { useFetchTributeInfo, useExtractHtmlInfo, useCreateArchive } from '@/hooks/useTributeQuery';
import { useArchivePendingOrigsQuery } from '@/hooks/useArchivesQuery';
import { HtmlExtractResult, ArchivePendingOrig } from '@/apis/types';

const { TextArea } = Input;
const { Title, Text } = Typography;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

const TributePage: FC = () => {
  const [form] = Form.useForm<TributeFormState>();
  const [notificationApi, contextHolder] = notification.useNotification();

  const [tributeState, setTributeState] = useState<TributeFormState>(JSON.parse(JSON.stringify(INITIAL_TRIBUTE_STATE)));
  const [fileLists, setFileLists] = useState<UploadFile[][]>([[]]);
  const [previewDataList, setPreviewDataList] = useState<(HtmlExtractResult | null)[]>([null]);
  const [loadingStates, setLoadingStates] = useState<boolean[]>([false]);
  const [fetchingLink, setFetchingLink] = useState<string | null>(null);
  const [fetchingIndex, setFetchingIndex] = useState<number | null>(null);
  const lastProcessedLink = useRef<{ link: string; index: number } | null>(null);

  const { data: pendingOrigs = [], isLoading: isPendingOrigsLoading } = useArchivePendingOrigsQuery();

  const extractHtmlMutation = useExtractHtmlInfo();
  const createArchiveMutation = useCreateArchive();

  const pendingOrigMap = useMemo(() => {
    return pendingOrigs.reduce(
      (acc, orig) => {
        acc[orig.id] = orig;
        return acc;
      },
      {} as Record<number, ArchivePendingOrig>,
    );
  }, [pendingOrigs]);

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

  // 处理获取到的链接信息
  useEffect(() => {
    if (fetchingIndex === null || !fetchingLink) return;

    // 防止处理重复的响应
    if (lastProcessedLink.current?.link === fetchingLink && lastProcessedLink.current?.index === fetchingIndex) return;

    // 当数据获取完成且有数据时
    if (fetchTributeData && !isFetchingTribute) {
      const { title, author, publisher, date, summary, highlights, keywords } = fetchTributeData;

      // 更新表单值
      const newFormValues: Partial<TributeFormState> = {};
      if (title) newFormValues.title = title;
      if (author) newFormValues.authors = Array.isArray(author) ? author.join(', ') : author;
      if (publisher) newFormValues.publisher = publisher;
      if (date) newFormValues.date = date;
      updateFormValues(newFormValues);

      // 设置预览数据
      setPreviewDataList((prev) => {
        const newPreviewDataList = [...prev];
        newPreviewDataList[fetchingIndex] = {
          title,
          author,
          publisher,
          date,
          summary,
          highlights,
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
  }, [fetchTributeData, isFetchingTribute, fetchTributeError, fetchingIndex, fetchingLink, updateFormValues, notificationApi]);

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
      if (nextMode === 'link') {
        return next;
      }
      next[index] = null;
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

  const isHtmlFile = (filename: string, mimeType?: string | null) => {
    const lowerName = filename.toLowerCase();
    if (lowerName.endsWith('.html') || lowerName.endsWith('.htm')) return true;
    if (!mimeType) return false;
    return mimeType.toLowerCase().includes('html');
  };

  const ensureTitleFallback = (fallbackTitle: string) => {
    const currentTitle = form.getFieldValue('title');
    if (!currentTitle || currentTitle.trim() === '') {
      updateFormValues({ title: fallbackTitle });
    }
  };

  const applyExtractedDataToForm = (data: HtmlExtractResult, fallbackTitle: string) => {
    const { title, author, publisher, date } = data;
    const newFormValues: Partial<TributeFormState> = {
      title: title || fallbackTitle,
    };

    if (author) newFormValues.authors = Array.isArray(author) ? author.join(', ') : author;
    if (publisher) newFormValues.publisher = publisher;
    if (date) newFormValues.date = date;

    updateFormValues(newFormValues);
  };

  const runExtractHtml = (
    index: number,
    { formData, fallbackTitle, sourceLabel }: { formData: FormData; fallbackTitle: string; sourceLabel: string },
  ) => {
    setPreviewDataList((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });

    extractHtmlMutation.mutate(formData, {
      onSuccess: (response) => {
        if (response && response.success && response.data) {
          const { data } = response;
          notificationApi.success({
            message: 'HTML信息提取成功',
            description: `已从${sourceLabel}提取信息，请核对并补充。`,
          });

          applyExtractedDataToForm(data, fallbackTitle);

          setPreviewDataList((prev) => {
            const next = [...prev];
            next[index] = {
              title: data.title || fallbackTitle,
              author: data.author,
              publisher: data.publisher,
              date: data.date,
              summary: data.summary,
              highlights: data.highlights,
              keywords: data.keywords,
            };
            return next;
          });
        } else {
          notificationApi.warning({
            message: 'HTML信息提取不完整',
            description: '请手动填写。',
          });
          ensureTitleFallback(fallbackTitle);
        }
      },
      onError: (error: any) => {
        notificationApi.error({
          message: 'HTML信息提取失败',
          description: error.message || '请检查文件或稍后再试。',
        });
        ensureTitleFallback(fallbackTitle);
      },
    });
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

  const handleFileHtmlExtraction = (file: File, index: number) => {
    const fallbackTitle = getFilenameWithoutExtension(file.name);
    const formData = new FormData();
    formData.append('file', file);

    runExtractHtml(index, {
      formData,
      fallbackTitle,
      sourceLabel: `文件 ${file.name}`,
    });
  };

  const handlePendingOrigHtmlExtraction = (orig: ArchivePendingOrig, index: number) => {
    const fallbackTitle = getFilenameWithoutExtension(orig.originalFilename);
    const formData = new FormData();
    formData.append('pendingOrigId', String(orig.id));

    runExtractHtml(index, {
      formData,
      fallbackTitle,
      sourceLabel: `原稿 ${orig.originalFilename}`,
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
      const file = newFileList[0].originFileObj as File;
      if (isHtmlFile(file.name, file.type)) {
        handleFileHtmlExtraction(file, index);
      } else {
        ensureTitleFallback(getFilenameWithoutExtension(file.name));
      }
    } else {
      setPreviewDataList((prev) => {
        const newPreviewDataList = [...prev];
        newPreviewDataList[index] = null;
        return newPreviewDataList;
      });
    }
  };

  const handlePendingOrigChange = (index: number, pendingOrigId: number | null) => {
    const links = form.getFieldValue('links') || [];
    const current = links[index] || { link: '', mode: 'link', pendingOrigId: null };
    const newLinks = [...links];
    newLinks[index] = {
      ...current,
      pendingOrigId,
    };
    form.setFieldValue('links', newLinks);
    setTributeState(form.getFieldsValue() as TributeFormState);

    if (!pendingOrigId) {
      setPreviewDataList((prev) => {
        const next = [...prev];
        next[index] = null;
        return next;
      });
      return;
    }

    const orig = pendingOrigMap[pendingOrigId];
    if (!orig) {
      notificationApi.warning({
        message: '原稿不可用',
        description: '请选择有效的待处理原稿。',
      });
      setPreviewDataList((prev) => {
        const next = [...prev];
        next[index] = null;
        return next;
      });
      return;
    }

    if (isHtmlFile(orig.originalFilename, orig.fileType)) {
      handlePendingOrigHtmlExtraction(orig, index);
    } else {
      setPreviewDataList((prev) => {
        const next = [...prev];
        next[index] = null;
        return next;
      });
      ensureTitleFallback(getFilenameWithoutExtension(orig.originalFilename));
    }
  };

  const resetFormAndState = () => {
    form.resetFields();
    setFileLists([[]]);
    setPreviewDataList([null]);
    setLoadingStates([false]);
    setTributeState(JSON.parse(JSON.stringify(INITIAL_TRIBUTE_STATE)));
    setFetchingLink(null);
    setFetchingIndex(null);
    lastProcessedLink.current = null;
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
    const files: (File | null)[] = [];
    const pendingOrigIds: (number | null)[] = [];
    const pendingOrigMissing: number[] = [];

    values.links.forEach((linkData, index) => {
      const mode = linkData.mode || 'link';

      const trimmedLink = (linkData.link || '').trim();

      if (mode === 'upload') {
        const fileList = fileLists[index] || [];
        if (fileList.length > 0 && fileList[0].originFileObj) {
          files.push(fileList[0].originFileObj);
        } else {
          files.push(null);
        }
        originalUrls.push(trimmedLink);
        pendingOrigIds.push(null);
      } else if (mode === 'pendingOrig') {
        files.push(null);
        originalUrls.push('');
        const pendingId = linkData.pendingOrigId ?? null;
        pendingOrigIds.push(pendingId);
        if (!pendingId) {
          pendingOrigMissing.push(index + 1);
        }
      } else {
        files.push(null);
        originalUrls.push(trimmedLink);
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

    // 检查是否至少有一个有效的输入
    const hasValidInput =
      originalUrls.some((url) => url.trim() !== '') ||
      files.some((file) => file !== null) ||
      pendingOrigIds.some((id) => id !== null);
    if (!hasValidInput) {
      notificationApi.error({
        message: '缺少输入',
        description: '请至少提供一个有效的链接、上传文件或选择待处理原稿。',
      });
      return;
    }

    formData.append('originalUrls', originalUrls.join(','));
    formData.append('pendingOrigIds', pendingOrigIds.map((id) => (id === null ? '' : String(id))).join(','));

    // 添加文件
    files.forEach((file) => {
      if (file) {
        formData.append(`files`, file);
      }
    });

    createArchiveMutation.mutate(formData, {
      onSuccess: () => {
        notificationApi.success({
          message: '归档成功',
          description: `文章 "${values.title}" 已成功归档。`,
          icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
          duration: null,
        });
        resetFormAndState();
      },
      onError: (error: any) => {
        notificationApi.error({
          message: '归档请求失败',
          description: error.message || '请检查网络或联系管理员。',
        });
      },
    });
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

  return (
    <>
      {contextHolder}
      <div className="mx-auto my-8 w-[90%] max-w-5xl">
        <Title level={2} className="text-primary mb-8 flex items-center justify-center text-center">
          <BookOutlined className="mr-2" /> 文章归档
        </Title>
        <div className="flex flex-col gap-6 md:flex-row">
          <div className="min-w-[320px] flex-grow md:w-2/3">
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              initialValues={INITIAL_TRIBUTE_STATE}
              onValuesChange={handleFormValuesChange}
            >
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
                          className="tribute-form-card relative mb-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
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
                                }}
                                danger
                                size="small"
                                className="hover:bg-red-50"
                              />
                            )}
                          </div>

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
                                    <span className="font-medium text-gray-800">文章链接</span>
                                    <span className="text-xs text-gray-500">输入文章链接并尝试自动提取信息</span>
                                  </div>
                                </div>
                              </Radio>
                              <div className={`mt-3 pl-7 ${!isLinkMode ? 'pointer-events-none opacity-60' : ''}`}>
                                <Form.Item {...restField} name={[name, 'link']} className="mb-0">
                                  <Space.Compact style={{ width: '100%' }}>
                                    <Input
                                      placeholder="http(s)://..."
                                      disabled={!isLinkMode || extractHtmlMutation.isPending}
                                      addonBefore={<LinkOutlined />}
                                    />
                                    <Button
                                      type="primary"
                                      onClick={() => handleFetchLinkInfo(index)}
                                      loading={loadingStates[index]}
                                      disabled={!isLinkMode || extractHtmlMutation.isPending}
                                    >
                                      获取信息
                                    </Button>
                                  </Space.Compact>
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
                              <Radio value="upload" className="flex w-full items-start gap-3">
                                <div className="flex-1">
                                  <div className="flex flex-col gap-1 text-left md:flex-row md:items-center md:gap-3">
                                    <span className="font-medium text-gray-800">上传文件</span>
                                    <span className="text-xs text-gray-500">手动上传文件 (支持HTML, PDF, PNG, JPG)</span>
                                  </div>
                                </div>
                              </Radio>
                              <div className={`mt-3 pl-7 ${!isUploadMode ? 'pointer-events-none opacity-60' : ''}`}>
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

                            <div
                              className={`${getCardClasses(isPendingMode)} cursor-pointer`}
                              role="button"
                              tabIndex={0}
                              onClick={() => activateMode('pendingOrig')}
                              onKeyDown={(event) => handleCardKeyDown(event, 'pendingOrig')}
                            >
                              <Radio value="pendingOrig" className="flex w-full items-start gap-3">
                                <div className="flex-1">
                                  <div className="flex flex-col gap-1 text-left md:flex-row md:items-center md:gap-3">
                                    <span className="font-medium text-gray-800">邮件附件</span>
                                    <span className="text-xs text-gray-500">从邮件附件待归档列表中选择</span>
                                  </div>
                                </div>
                              </Radio>
                              <div className={`mt-3 pl-7 ${!isPendingMode ? 'pointer-events-none opacity-60' : ''}`}>
                                <Form.Item {...restField} name={[name, 'pendingOrigId']} className="mb-2">
                                  <Select
                                    placeholder="选择待处理原稿"
                                    loading={isPendingOrigsLoading}
                                    allowClear
                                    disabled={!isPendingMode}
                                    optionLabelProp="data-label"
                                    onChange={(value) => handlePendingOrigChange(index, value ?? null)}
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
                <Button type="primary" htmlType="submit" loading={createArchiveMutation.isPending} block size="large">
                  归档文章
                </Button>
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

export default TributePage;
