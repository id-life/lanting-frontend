import React from "react";
import { GithubOutlined } from "@ant-design/icons";
import Link from "next/link";

const Footer: React.FC = () => (
  <footer className="bg-gray-50 border-t border-gray-200">
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
      <div className="flex justify-center items-center space-x-6 mb-4">
        <Link
          href="https://www.eff.org/cyberspace-independence"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-primary"
        >
          {/* EFF Link, can be text or icon */}
        </Link>
        <Link
          href="https://github.com/LantingWiki/lanting"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-primary"
        >
          <GithubOutlined className="text-xl" />
        </Link>
        <Link
          href="https://blog.wangboyang.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-primary"
        >
          芦柑笔谈
        </Link>
      </div>
      <p>© {new Date().getFullYear()} 兰亭文存</p>
    </div>
  </footer>
);

export default Footer;
