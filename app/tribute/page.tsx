"use client";

import React, { useState, FC, useCallback, useEffect } from "react";
import {
  Form,
  notification,
  Upload,
  Button,
  Switch,
  Typography,
  Input,
  Select,
  Space,
  Divider,
} from "antd";
import type { UploadFile, UploadProps } from "antd/es/upload/interface";
import {
  LinkOutlined,
  UploadOutlined,
  LoadingOutlined,
  CheckCircleOutlined,
  BookOutlined,
  DownOutlined,
} from "@ant-design/icons";

import LinkPreview from "@/components/TributeForm/LinkPreview";
import KeywordSuggestions from "@/components/TributeForm/KeywordSuggestion";
import type { TributeFormState, LinkPreviewData } from "@/lib/types";
import { TRIBUTE_CHAPTERS, INITIAL_TRIBUTE_STATE } from "@/lib/constants";

import {
  useFetchTributeInfo,
  useExtractHtmlInfo,
  useCreateArchive,
} from "@/hooks/useTributeQuery";

const { TextArea } = Input;
const { Title, Text } = Typography;

const TributePage: FC = () => {
  const [form] = Form.useForm<TributeFormState>();
  const [notificationApi, contextHolder] = notification.useNotification();

  const [currentLink, setCurrentLink] = useState<string | null>(null);
  const [shouldFetchLinkInfo, setShouldFetchLinkInfo] = useState(false);

  const [tributeState, setTributeState] = useState<TributeFormState>(
    JSON.parse(JSON.stringify(INITIAL_TRIBUTE_STATE))
  );
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [useManualUpload, setUseManualUpload] = useState(false);
  const [previewData, setPreviewData] = useState<LinkPreviewData | null>(null);

  const {
    data: fetchedLinkInfo,
    isLoading: linkLoading,
    error: linkError,
    refetch: refetchLinkInfo,
  } = useFetchTributeInfo(currentLink, { enabled: false });
  const extractHtmlMutation = useExtractHtmlInfo();
  const createArchiveMutation = useCreateArchive();

  useEffect(() => {
    if (shouldFetchLinkInfo && currentLink) {
      refetchLinkInfo();
      setShouldFetchLinkInfo(false);
    }
  }, [shouldFetchLinkInfo, currentLink, refetchLinkInfo]);

  useEffect(() => {
    if (fetchedLinkInfo) {
      notificationApi.success({
        message: "信息获取成功",
        description: "已从链接获取信息，请核对并补充。",
        icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
      });
      const { title, author, publisher, date, summary, keywords } =
        fetchedLinkInfo;
      const newFormValues: Partial<TributeFormState> = {};
      if (title) newFormValues.title = title;
      if (author)
        newFormValues.author = Array.isArray(author)
          ? author.join(", ")
          : author;
      if (publisher) newFormValues.publisher = publisher;
      if (date) newFormValues.date = date;
      form.setFieldsValue(newFormValues);
      setPreviewData({ title, author, publisher, date, summary, keywords });
    }
    if (linkError) {
      notificationApi.error({
        message: "获取链接信息失败",
        description:
          (linkError as Error).message || "请检查链接是否正确或稍后再试。",
      });
    }
  }, [fetchedLinkInfo, linkError, form, notificationApi]);

  const updateFormValues = useCallback(
    (values: Partial<TributeFormState>) => {
      form.setFieldsValue(values);
    },
    [form]
  );

  const handleFormValuesChange = (
    _changedValues: Partial<TributeFormState>,
    allValues: TributeFormState
  ) => {
    setTributeState(allValues);
  };

  const getFilenameWithoutExtension = (filename: string): string => {
    return filename.substring(0, filename.lastIndexOf(".")) || filename;
  };

  const handleFetchLinkInfo = async () => {
    const link = form.getFieldValue("link");
    if (!link || link.trim() === "") {
      notificationApi.warning({ message: "请输入有效的文章链接" });
      return;
    }
    setCurrentLink(link.trim());
    setShouldFetchLinkInfo(true);
    setPreviewData(null);
  };

  const handleExtractHtmlInfo = async (file: File) => {
    setPreviewData(null);
    const formData = new FormData();
    formData.append("file", file);

    extractHtmlMutation.mutate(formData, {
      onSuccess: (response) => {
        if (response && response.success && response.data) {
          notificationApi.success({
            message: "HTML信息提取成功",
            description: `已从文件 ${file.name} 提取信息，请核对并补充。`,
          });
          const { title, author, publisher, date, summary, keywords } =
            response.data;
          const newFormValues: Partial<TributeFormState> = {};
          newFormValues.title = title || getFilenameWithoutExtension(file.name);
          if (author)
            newFormValues.author = Array.isArray(author)
              ? author.join(", ")
              : author;
          if (publisher) newFormValues.publisher = publisher;
          if (date) newFormValues.date = date;
          updateFormValues(newFormValues);
          setPreviewData({
            title: newFormValues.title,
            author,
            publisher,
            date,
            summary,
            keywords,
          });
        } else {
          notificationApi.warning({
            message: "HTML信息提取不完整",
            description: "请手动填写。",
          });
          if (!form.getFieldValue("title"))
            updateFormValues({ title: getFilenameWithoutExtension(file.name) });
        }
      },
      onError: (error: any) => {
        notificationApi.error({
          message: "HTML信息提取失败",
          description: error.message || "请检查文件或稍后再试。",
        });
        if (!form.getFieldValue("title"))
          updateFormValues({ title: getFilenameWithoutExtension(file.name) });
      },
    });
  };

  const handleFileUploadChange: UploadProps["onChange"] = (info) => {
    let newFileList = [...info.fileList].slice(-1);
    newFileList = newFileList.filter((file) => {
      const isValidType =
        (file.type &&
          ["text/html", "application/pdf", "image/png", "image/jpeg"].includes(
            file.type
          )) ||
        (file.name &&
          (file.name.endsWith(".html") ||
            file.name.endsWith(".pdf") ||
            file.name.endsWith(".png") ||
            file.name.endsWith(".jpg") ||
            file.name.endsWith(".jpeg")));

      if (!isValidType && file.status !== "removed") {
        notificationApi.error({
          message: "文件类型错误",
          description: "仅支持 HTML, PDF, PNG, JPG 文件。",
        });
      }
      return isValidType;
    });

    setFileList(newFileList);

    if (newFileList.length > 0 && newFileList[0].originFileObj) {
      const file = newFileList[0].originFileObj;
      if (file.type === "text/html" || file.name.endsWith(".html")) {
        handleExtractHtmlInfo(file);
      } else {
        if (!form.getFieldValue("title")) {
          updateFormValues({ title: getFilenameWithoutExtension(file.name) });
        }
      }
    } else {
      setPreviewData(null);
    }
  };

  const resetFormAndState = () => {
    form.resetFields();
    setFileList([]);
    setPreviewData(null);
    setUseManualUpload(false);
    setCurrentLink(null);
    setTributeState(JSON.parse(JSON.stringify(INITIAL_TRIBUTE_STATE)));
  };

  const onFinish = async (values: TributeFormState) => {
    const formData = new FormData();

    formData.append("title", values.title);
    formData.append("author", values.author);
    formData.append("publisher", values.publisher);
    formData.append("date", values.date);
    formData.append("chapter", values.chapter);
    formData.append("remarks", values.remarks);
    formData.append("tag", values.tag);

    if (useManualUpload) {
      if (fileList.length === 0 || !fileList[0].originFileObj) {
        notificationApi.error({
          message: "缺少文件",
          description: "手动上传模式下，必须上传一个源文件。",
        });
        return;
      }
      formData.append("file", fileList[0].originFileObj);

      if (values.link) {
        formData.append("originalUrl", values.link);
      }
    } else {
      if (!values.link || values.link.trim() === "") {
        notificationApi.error({
          message: "缺少链接",
          description: "链接归档模式下，必须提供一个有效的文章链接。",
        });
        return;
      }
      formData.append("originalUrl", values.link);
    }

    createArchiveMutation.mutate(formData, {
      onSuccess: () => {
        notificationApi.success({
          message: "归档成功",
          description: `文章 "${values.title}" 已成功归档。`,
          icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
          duration: null,
        });
        resetFormAndState();
      },
      onError: (error: any) => {
        notificationApi.error({
          message: "归档请求失败",
          description: error.message || "请检查网络或联系管理员。",
        });
      },
    });
  };

  const handleSelectKeyword = (keyword: string) => {
    const currentTags = form.getFieldValue("tag")?.trim() || "";
    const newTags = currentTags ? `${currentTags}, ${keyword}` : keyword;
    updateFormValues({ tag: newTags });
    notificationApi.success({
      message: "关键词已添加",
      description: `"${keyword}" 已添加到标签。`,
      duration: 2,
    });
  };

  const handleSelectAllKeywords = (keywords: string[]) => {
    if (keywords.length === 0) return;
    const currentTags = form.getFieldValue("tag")?.trim() || "";
    const newKeywordsString = keywords.join(", ");
    const newTags = currentTags
      ? `${currentTags}, ${newKeywordsString}`
      : newKeywordsString;
    updateFormValues({ tag: newTags });
    notificationApi.success({
      message: "所有建议关键词已添加",
      description: `${keywords.length}个关键词已添加到标签。`,
      duration: 2,
    });
  };

  return (
    <>
      {contextHolder}
      <div className="w-[90%] max-w-5xl mx-auto my-8">
        <Title
          level={2}
          className="text-center mb-8 text-primary flex items-center justify-center"
        >
          <BookOutlined className="mr-2" /> 文章归档
        </Title>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-grow min-w-[320px] md:w-2/3">
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              initialValues={INITIAL_TRIBUTE_STATE}
              onValuesChange={handleFormValuesChange}
            >
              <Form.Item label="文章链接" name="link" className="mb-4">
                <Space.Compact style={{ width: "100%" }}>
                  <Input
                    placeholder="http(s)://..."
                    disabled={
                      linkLoading ||
                      extractHtmlMutation.isPending ||
                      useManualUpload
                    }
                    addonBefore={<LinkOutlined />}
                  />
                  <Button
                    type="primary"
                    onClick={handleFetchLinkInfo}
                    loading={linkLoading}
                    disabled={
                      !tributeState.link?.trim() ||
                      extractHtmlMutation.isPending ||
                      useManualUpload
                    }
                  >
                    获取信息
                  </Button>
                </Space.Compact>
              </Form.Item>

              <Form.Item label="或手动上传文件" className="mb-4">
                <div className="flex items-center">
                  <Switch
                    checked={useManualUpload}
                    onChange={(checked) => {
                      setUseManualUpload(checked);
                      if (!checked) {
                        setFileList([]);
                      } else {
                        updateFormValues({ link: "" });
                        setCurrentLink(null);
                        setPreviewData(null);
                      }
                    }}
                  />
                  <Text type="secondary" className="ml-2 text-xs">
                    支持HTML, PDF, PNG, JPG。选中后将忽略上方链接。
                  </Text>
                </div>
                {useManualUpload && (
                  <Upload
                    fileList={fileList}
                    onChange={handleFileUploadChange}
                    beforeUpload={() => false}
                    accept=".html,text/html,.pdf,application/pdf,.png,image/png,.jpg,.jpeg,image/jpeg"
                    className="mt-2"
                    maxCount={1}
                  >
                    <Button
                      icon={
                        extractHtmlMutation.isPending ? (
                          <LoadingOutlined />
                        ) : (
                          <UploadOutlined />
                        )
                      }
                      disabled={extractHtmlMutation.isPending}
                    >
                      {extractHtmlMutation.isPending
                        ? "处理文件中..."
                        : "选择文件 (单个)"}
                    </Button>
                  </Upload>
                )}
              </Form.Item>

              <Divider orientation="left" className="text-sm !mb-4">
                文章信息
              </Divider>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                <Form.Item
                  label="标题"
                  name="title"
                  rules={[{ required: true, message: "请输入标题" }]}
                  className="mb-3"
                >
                  <Input placeholder="文章标题" />
                </Form.Item>
                <Form.Item label="作者" name="author" className="mb-3">
                  <Input placeholder="作者 (多人用逗号隔开)" />
                </Form.Item>
                <Form.Item
                  label="出版方/来源"
                  name="publisher"
                  className="mb-3"
                >
                  <Input placeholder="例如：微信公众号、知乎、纽约时报" />
                </Form.Item>
                <Form.Item label="日期" name="date" className="mb-3">
                  <Input placeholder="格式：YYYY-MM-DD 或 YYYY-MM" />
                </Form.Item>
                <Form.Item
                  label="章节"
                  name="chapter"
                  rules={[{ required: true, message: "请选择章节" }]}
                  className="mb-3"
                >
                  <Select
                    placeholder="选择文章所属章节"
                    suffixIcon={<DownOutlined />}
                    options={TRIBUTE_CHAPTERS.map((chapter) => ({
                      label: chapter,
                      value: chapter,
                    }))}
                  />
                </Form.Item>
                <Form.Item label="标签" name="tag" className="mb-3">
                  <Input placeholder="标签 (多个用逗号隔开)" />
                </Form.Item>
              </div>

              <KeywordSuggestions
                summary={previewData?.summary}
                keywords={previewData?.keywords}
                loading={linkLoading || extractHtmlMutation.isPending}
                onSelectKeyword={handleSelectKeyword}
                onSelectAllKeywords={handleSelectAllKeywords}
              />

              <Form.Item label="备注/摘要" name="remarks" className="mb-3">
                <TextArea placeholder="关于文章的简要备注或摘要内容" rows={4} />
              </Form.Item>

              <Form.Item className="mt-6">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={createArchiveMutation.isPending}
                  block
                  size="large"
                >
                  归档文章
                </Button>
              </Form.Item>
            </Form>
          </div>
          <div className="md:w-1/3 sticky top-20 self-start">
            <LinkPreview
              previewData={previewData}
              loading={linkLoading || extractHtmlMutation.isPending}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default TributePage;
