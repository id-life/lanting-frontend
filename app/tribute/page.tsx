'use client';

import React, { useState, FC, useCallback, useEffect, useRef } from 'react';
import { Form, notification, Upload, Button, Switch, Typography, Input, Select, Space, Divider } from 'antd';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
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
import type { TributeFormState } from '@/lib/types';
import { TRIBUTE_CHAPTERS, INITIAL_TRIBUTE_STATE } from '@/lib/constants';

import { useFetchTributeInfo, useExtractHtmlInfo, useCreateArchive } from '@/hooks/useTributeQuery';
import { HtmlExtractResult } from '@/apis/types';

const { TextArea } = Input;
const { Title, Text } = Typography;

const TributePage: FC = () => {
  const [form] = Form.useForm<TributeFormState>();
  const [notificationApi, contextHolder] = notification.useNotification();

  const [tributeState, setTributeState] = useState<TributeFormState>(JSON.parse(JSON.stringify(INITIAL_TRIBUTE_STATE)));
  const [fileLists, setFileLists] = useState<UploadFile[][]>([[]]);
  const [previewDataList, setPreviewDataList] = useState<(HtmlExtractResult | null)[]>([null]);
  const [loadingStates, setLoadingStates] = useState<boolean[]>([false]);
  const [fetchingLink, setFetchingLink] = useState<string | null>(null);
  const [fetchingIndex, setFetchingIndex] = useState<number | null>(null);
  const lastProcessedLink = useRef<string | null>(null);

  const extractHtmlMutation = useExtractHtmlInfo();
  const createArchiveMutation = useCreateArchive();

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
    if (lastProcessedLink.current === fetchingLink) return;

    // 当数据获取完成且有数据时
    if (fetchTributeData && !isFetchingTribute) {
      const { title, author, publisher, date, summary, keywords } = fetchTributeData;

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
      lastProcessedLink.current = fetchingLink;
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
      lastProcessedLink.current = fetchingLink;
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

  const getFilenameWithoutExtension = (filename: string): string => {
    return filename.substring(0, filename.lastIndexOf('.')) || filename;
  };

  const handleFetchLinkInfo = (index: number) => {
    const links = form.getFieldValue('links') || [];
    const linkData = links[index];
    if (!linkData?.link || linkData.link.trim() === '') {
      notificationApi.warning({ message: '请输入有效的文章链接' });
      return;
    }

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
          const newFormValues: Partial<TributeFormState> = {};
          newFormValues.title = title || getFilenameWithoutExtension(file.name);
          if (author) newFormValues.authors = Array.isArray(author) ? author.join(', ') : author;
          if (publisher) newFormValues.publisher = publisher;
          if (date) newFormValues.date = date;
          updateFormValues(newFormValues);
          setPreviewDataList((prev) => {
            const newPreviewDataList = [...prev];
            newPreviewDataList[index] = {
              title: newFormValues.title,
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
          if (!form.getFieldValue('title')) updateFormValues({ title: getFilenameWithoutExtension(file.name) });
        }
      },
      onError: (error: any) => {
        notificationApi.error({
          message: 'HTML信息提取失败',
          description: error.message || '请检查文件或稍后再试。',
        });
        if (!form.getFieldValue('title')) updateFormValues({ title: getFilenameWithoutExtension(file.name) });
      },
    });
  };

  const handleFileUploadChange = (info: any, index: number) => {
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
        if (!form.getFieldValue('title')) {
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

    values.links.forEach((linkData, index) => {
      if (linkData.useManualUpload) {
        // 手动上传模式
        const fileList = fileLists[index] || [];
        if (fileList.length > 0 && fileList[0].originFileObj) {
          files.push(fileList[0].originFileObj);
          originalUrls.push(linkData.link || '');
        } else {
          files.push(null);
          originalUrls.push('');
        }
      } else {
        // 链接模式
        files.push(null);
        originalUrls.push(linkData.link || '');
      }
    });

    // 检查是否至少有一个有效的输入
    const hasValidInput = originalUrls.some((url) => url.trim() !== '') || files.some((file) => file !== null);
    if (!hasValidInput) {
      notificationApi.error({
        message: '缺少输入',
        description: '请至少提供一个有效的链接或上传一个文件。',
      });
      return;
    }

    formData.append('originalUrls', originalUrls.join(','));

    // 添加文件
    files.forEach((file, index) => {
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
                    {fields.map(({ key, name, ...restField }, index) => (
                      <div
                        key={key}
                        className="relative mb-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
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

                        <Form.Item {...restField} name={[name, 'link']} className="mb-3">
                          <Space.Compact style={{ width: '100%' }}>
                            <Input
                              placeholder="http(s)://..."
                              disabled={extractHtmlMutation.isPending}
                              addonBefore={<LinkOutlined />}
                            />
                            <Button
                              type="primary"
                              onClick={() => handleFetchLinkInfo(index)}
                              loading={loadingStates[index]}
                              disabled={extractHtmlMutation.isPending || tributeState.links?.[index]?.useManualUpload}
                            >
                              获取信息
                            </Button>
                          </Space.Compact>
                        </Form.Item>

                        <Form.Item {...restField} name={[name, 'useManualUpload']} valuePropName="checked" className="mb-3">
                          <div className="flex items-center">
                            <Switch
                              onChange={(checked) => {
                                // 更新表单中的 useManualUpload 值
                                const links = form.getFieldValue('links') || [];
                                const newLinks = [...links];
                                newLinks[index] = { ...newLinks[index], useManualUpload: checked };

                                if (!checked) {
                                  // 切换到链接模式：清空文件列表
                                  setFileLists((prev) => {
                                    const newFileLists = [...prev];
                                    newFileLists[index] = [];
                                    return newFileLists;
                                  });
                                } else {
                                  // 切换到手动上传模式：清空链接和预览数据
                                  newLinks[index] = { ...newLinks[index], link: '' };
                                  setPreviewDataList((prev) => {
                                    const newPreviewDataList = [...prev];
                                    newPreviewDataList[index] = null;
                                    return newPreviewDataList;
                                  });
                                }

                                // 更新表单值
                                form.setFieldValue('links', newLinks);

                                // 手动触发表单值变化事件，确保 tributeState 同步更新
                                const allValues = form.getFieldsValue() as TributeFormState;
                                setTributeState(allValues);
                              }}
                            />
                            <Text type="secondary" className="ml-2 text-xs">
                              手动上传文件 (支持HTML, PDF, PNG, JPG)
                            </Text>
                          </div>
                        </Form.Item>

                        {tributeState.links?.[index]?.useManualUpload && (
                          <Upload
                            fileList={fileLists[index] || []}
                            onChange={(info) => handleFileUploadChange(info, index)}
                            beforeUpload={() => false}
                            accept=".html,text/html,.pdf,application/pdf,.png,image/png,.jpg,.jpeg,image/jpeg"
                            maxCount={1}
                          >
                            <Button
                              icon={extractHtmlMutation.isPending ? <LoadingOutlined /> : <UploadOutlined />}
                              disabled={extractHtmlMutation.isPending}
                            >
                              {extractHtmlMutation.isPending ? '处理文件中...' : '选择文件'}
                            </Button>
                          </Upload>
                        )}
                      </div>
                    ))}

                    <Form.Item className="mb-4">
                      <Button
                        type="dashed"
                        onClick={() => {
                          if (fields.length < 10) {
                            add({ link: '', useManualUpload: false });
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
