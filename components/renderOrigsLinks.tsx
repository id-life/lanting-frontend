import React from 'react';
import { BookOutlined } from '@ant-design/icons';
import { Archive } from '@/apis/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const CDN_DOMAIN = process.env.NEXT_PUBLIC_CDN_DOMAIN;

export const renderOrigsLinks = (origs: Archive['origs']) => {
  if (!origs || origs.length === 0) {
    return null;
  }

  return origs
    .map((orig) => {
      if (!orig.storageUrl) return null;

      let href: string;
      if (orig.storageType === 'oss') {
        href = `${CDN_DOMAIN}/archives/origs/${orig.storageUrl}`;
      } else if (orig.storageType === 's3') {
        href = `${API_BASE_URL}/archives/content/${orig.storageUrl}`;
      } else {
        return null;
      }

      return (
        <a
          key={orig.id}
          className="text-primary ml-2 text-sm hover:underline"
          href={href}
          rel="noreferrer"
          target="_blank"
          title="原文"
        >
          <BookOutlined />
        </a>
      );
    })
    .filter(Boolean);
};
