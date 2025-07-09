import React from 'react';
import { GithubOutlined } from '@ant-design/icons';
import Link from 'next/link';

const Footer: React.FC = () => (
  <footer>
    <div className="mx-auto max-w-7xl px-4 py-8 text-center text-sm text-gray-50 sm:px-6 lg:px-8">
      <div className="mb-4 flex items-center justify-center space-x-8">
        <Link
          href="https://github.com/LantingWiki/lanting"
          target="_blank"
          rel="noopener noreferrer"
          className="text-caption hover:text-secondary"
        >
          <GithubOutlined className="text-xl" />
        </Link>
        <Link
          href="https://blog.wangboyang.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-caption hover:text-secondary"
        >
          芦柑笔谈
        </Link>
      </div>
      <p className="text-black/45">© {new Date().getFullYear()} 兰亭文存</p>
    </div>
  </footer>
);

export default Footer;
