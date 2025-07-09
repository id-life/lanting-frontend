'use client';

import React, { useState } from 'react';
import { Form, Select, Collapse, InputNumber, Input, Tag } from 'antd';
import { DownOutlined, DoubleRightOutlined } from '@ant-design/icons';
import type { FormInstance } from 'antd/es/form';
import type { Archives, FilterValues } from '@/lib/types';
import { fieldToTranslation } from '@/lib/utils';
import StandardFormRow from '@/components/StandardFormRow';
import { DEFAULT_FILTER_VALUES } from '@/lib/constants';
import { SearchKeyword } from '@/apis/types';
import { useAddSearchKeyword } from '@/hooks/useSearchKeywordsQuery';

const { Option } = Select;
const { Panel } = Collapse;
const { Search } = Input;

const generateOptions = (obj: Record<string, number> | undefined) => {
  if (!obj) return [];
  return Object.entries(obj)
    .sort(([, countA], [, countB]) => countB - countA)
    .map(([key, value]) => ({
      value: key,
      label: `${key}: ${value}`,
      count: value,
    }));
};

const generateSelect = (data: Record<string, number> | undefined, name: keyof FilterValues) => {
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
          optionLabelProp="label"
          className="w-full"
          allowClear
        >
          <Option key="all" value="all" label="全选">
            全选
          </Option>
          {options.map((fieldVal) => (
            <Option key={fieldVal.value} value={fieldVal.value} label={fieldVal.value}>
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
  return (['author', 'publisher', 'date', 'tag'] as const)
    .map((key) => {
      if (!archives.fieldFreqMap[key]) return null;
      return generateSelect(archives.fieldFreqMap[key], key);
    })
    .filter(Boolean);
};

const generateTags = (tagLimit: number, searchKeywords: SearchKeyword[], form: any, onValuesChange: any) => {
  const onClickChange = (form: any, event: any, onValuesChange: any) => {
    const keyword = event.target.innerText;
    // 同时更新 search 和 confirmSearch 字段，让搜索框显示正确的值
    form.setFieldsValue({ search: keyword, confirmSearch: keyword });
    const currentValues = form.getFieldsValue();
    onValuesChange({ search: keyword, confirmSearch: keyword }, { ...currentValues, search: keyword, confirmSearch: keyword });
  };

  const resultSearchLists = [];
  searchKeywords.sort((a, b) => {
    if (b.searchCount !== a.searchCount) {
      return b.searchCount - a.searchCount;
    }
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  for (let i = 0; i < tagLimit; i++) {
    if (searchKeywords[i]) {
      resultSearchLists.push(searchKeywords[i]);
    }
  }
  return resultSearchLists.map((hotSpot) => (
    <Tag key={hotSpot.id} className="cursor-pointer rounded-sm" onClick={(event) => onClickChange(form, event, onValuesChange)}>
      {hotSpot.keyword}
    </Tag>
  ));
};

interface FilterProps {
  archives: Archives;
  form: FormInstance;
  searchKeywords: SearchKeyword[];
  onValuesChange: (changedValues: any, values: FilterValues) => void;
}

const Filters: React.FC<FilterProps> = ({ archives, form, searchKeywords, onValuesChange }) => {
  const { mutate: addSearchKeyword } = useAddSearchKeyword();

  const handleSearch = (value: string) => {
    form.setFieldsValue({ confirmSearch: value });
    const currentValues = form.getFieldsValue();
    onValuesChange({ confirmSearch: value }, { ...currentValues, confirmSearch: value });
    addSearchKeyword(value);
  };

  const selects = generateSelects(archives);

  const [tagLimit, addTagLimit] = useState(50);
  const handleSubmit = () => {
    addTagLimit(tagLimit + 20);
  };

  return (
    <Collapse ghost defaultActiveKey={[]}>
      <Panel
        header={<span className="text-primary pt-2 font-bold">兰亭已矣, 梓泽丘墟. 何处世家? 几人游侠?</span>}
        key="1"
        showArrow={false}
      >
        <Form
          layout="vertical"
          form={form}
          initialValues={DEFAULT_FILTER_VALUES}
          onValuesChange={onValuesChange}
          className="space-y-4 pt-4"
        >
          <Form.Item className="mb-4 ml-[5.625rem] flex items-center">
            {generateTags(tagLimit, searchKeywords, form, onValuesChange)}
            <Tag icon={<DoubleRightOutlined style={{ marginRight: 0 }} />} onClick={handleSubmit} className="cursor-pointer" />
          </Form.Item>
          <StandardFormRow title="如切如磋" key="search">
            <Form.Item name="search">
              <Search placeholder="如切如磋" onSearch={handleSearch} enterButton allowClear />
            </Form.Item>
          </StandardFormRow>
          <StandardFormRow title="如琢如磨" key="likes">
            <div className="filters-likes-row flex space-x-4">
              <Form.Item name="likesMin" label="大于等于" className="[&_label]:font-bold">
                <InputNumber min={0} className="w-20" />
              </Form.Item>
              <Form.Item name="likesMax" label="小于等于" className="[&_label]:font-bold">
                <InputNumber min={0} className="w-20" />
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
