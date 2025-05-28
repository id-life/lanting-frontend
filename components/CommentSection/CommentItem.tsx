// components/CommentSection/CommentItem.tsx
import React from "react";
import { Avatar, Tooltip, Typography } from "antd";
import { UserOutlined } from "@ant-design/icons";
import moment from "moment"; // 需要安装 moment: npm install moment
import "moment/locale/zh-cn"; // 引入中文语言包
import type { CommentData } from "@/lib/types";

moment.locale("zh-cn");

const { Text, Paragraph } = Typography;

interface CommentItemProps {
  comment: CommentData;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment }) => {
  return (
    <li className="flex py-4 border-b border-gray-200 last:border-b-0">
      <Avatar
        icon={<UserOutlined />}
        src={null}
        className="mr-3 mt-1 flex-shrink-0"
      />
      <div className="flex-grow">
        <div className="flex justify-between items-center">
          <Text strong className="text-sm">
            {comment.author || "匿名用户"}
          </Text>
          <Tooltip
            title={moment(comment.timestamp).format("YYYY-MM-DD HH:mm:ss")}
          >
            <Text type="secondary" className="text-xs">
              {moment(comment.timestamp).fromNow()}
            </Text>
          </Tooltip>
        </div>
        <Paragraph className="mt-1 mb-0 text-gray-700 text-sm whitespace-pre-wrap">
          {comment.content}
        </Paragraph>
      </div>
    </li>
  );
};

export default CommentItem;
