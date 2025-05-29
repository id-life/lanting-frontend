"use client";

import React, { useState } from "react";
import { Form, Select, Collapse, InputNumber, Input, Tag, Button } from "antd";
import { DownOutlined, DoubleRightOutlined } from "@ant-design/icons";
import type { FormInstance } from "antd/es/form";
import type { Archives, FilterValues, SearchList } from "@/lib/types";
import { fieldToTranslation } from "@/lib/utils";
import StandardFormRow from "@/components/StandardFormRow";
import { DEFAULT_FILTER_VALUES } from "@/lib/constants";

const { Option } = Select;
const { Panel } = Collapse;
const { Search } = Input;

const generateOptions = (obj: Record<string, number> | undefined) => {
  if (!obj) return [];
  return Object.entries(obj)
    .sort(([, countA], [, countB]) => countB - countA)
    .map(([key, value]) => ({
      value: key,
      label: `${key} (${value})`,
      count: value,
    }));
};

const generateSelect = (
  data: Record<string, number> | undefined,
  name: keyof FilterValues
) => {
  if (!data) return null;
  const options = generateOptions(data);
  if (options.length === 0) return null;

  const translation = fieldToTranslation[name as string] || name;
  return (
    <StandardFormRow title={translation} key={name}>
      <Form.Item name={name} className="w-full">
        <Select
          suffixIcon={<DownOutlined />}
          mode="multiple"
          placeholder={`筛选${translation}`}
          optionLabelProp="value"
          className="w-full"
          allowClear
        >
          {options.map((fieldVal) => (
            <Option
              key={fieldVal.value}
              value={fieldVal.value}
              label={fieldVal.value}
            >
              {fieldVal.label}
            </Option>
          ))}
        </Select>
      </Form.Item>
    </StandardFormRow>
  );
};

const generateSelects = (archives: Archives) => {
  if (!archives || !archives.fieldFreqMap) return [];
  return (["author", "publisher", "date", "tag"] as const)
    .map((key) => {
      if (!archives.fieldFreqMap[key]) return null;
      return generateSelect(archives.fieldFreqMap[key], key);
    })
    .filter(Boolean);
};

interface FilterProps {
  archives: Archives;
  form: FormInstance;
  searchLists: SearchList[];
  onValuesChange: (changedValues: any, values: FilterValues) => void;
}

const Filters: React.FC<FilterProps> = ({
  archives,
  form,
  searchLists,
  onValuesChange,
}) => {
  const [tagLimit, setTagLimit] = useState(50);

  const handleSubmitMoreTags = () => {
    setTagLimit(tagLimit + 20);
  };

  const handleTagClick = (keyword: string) => {
    form.setFieldsValue({ search: keyword, confirmSearch: keyword });
    const currentValues = form.getFieldsValue();
    onValuesChange(
      { search: keyword, confirmSearch: keyword },
      { ...currentValues, search: keyword, confirmSearch: keyword }
    );
  };

  const handleSearch = (value: string) => {
    form.setFieldsValue({ confirmSearch: value });
    const currentValues = form.getFieldsValue();
    onValuesChange(
      { confirmSearch: value },
      { ...currentValues, confirmSearch: value }
    );
  };

  const sortedSearchLists = [...searchLists].sort((a, b) => {
    if (b.count !== a.count) {
      return b.count - a.count;
    }
    return b.updatedAt - a.updatedAt;
  });

  const displayedSearchTags = sortedSearchLists.slice(0, tagLimit);
  const selects = generateSelects(archives);

  return (
    <Collapse ghost defaultActiveKey={["1"]}>
      <Panel
        header={
          <span className="font-bold text-primary">
            兰亭已矣, 梓泽丘墟. 何处世家? 几人游侠?
          </span>
        }
        key="1"
        showArrow={false}
        // forceRender
        // className="[&>.ant-collapse-content>.ant-collapse-content-box]:pt-0"
      >
        <Form
          layout="vertical"
          form={form}
          initialValues={DEFAULT_FILTER_VALUES}
          onValuesChange={onValuesChange}
          className="pt-4 space-y-4"
        >
          {displayedSearchTags.length > 0 && (
            <Form.Item className="filters-tag-container mb-4 ml-[90px] flex items-center">
              {displayedSearchTags.map((hotSpot) => (
                <Tag
                  key={hotSpot.keyword}
                  className="filters-tag-class m-0.5 cursor-pointer rounded"
                  onClick={() => handleTagClick(hotSpot.keyword)}
                >
                  {hotSpot.keyword} ({hotSpot.count})
                </Tag>
              ))}
              {searchLists.length > tagLimit && (
                <Button
                  type="link"
                  onClick={handleSubmitMoreTags}
                  icon={<DoubleRightOutlined />}
                  size="small"
                  className="p-0 h-auto"
                />
              )}
            </Form.Item>
          )}
          <StandardFormRow title="如切如磋" key="search">
            <Form.Item name="search">
              <Search
                placeholder="搜索文章..."
                onSearch={handleSearch}
                enterButton
                allowClear
              />
            </Form.Item>
          </StandardFormRow>
          <StandardFormRow title="如琢如磨" key="likes">
            <div className="filters-likes-row flex space-x-4">
              <Form.Item
                name="likesMin"
                label="大于等于"
                className="[&_label]:font-bold"
              >
                <InputNumber min={0} className="w-20" />
              </Form.Item>
              <Form.Item
                name="likesMax"
                label="小于等于"
                className="[&_label]:font-bold"
              >
                <InputNumber min={0} className="w-20 " />
              </Form.Item>
            </div>
          </StandardFormRow>
          {selects.length > 0 ? selects : null}
        </Form>
      </Panel>
    </Collapse>
  );
};

export default Filters;
