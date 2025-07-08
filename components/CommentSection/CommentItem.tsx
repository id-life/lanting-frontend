import React from 'react';
import { Avatar, Tooltip, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import moment from 'moment';
import 'moment/locale/zh-cn';
import { ArchiveComment } from '@/apis/types';

moment.locale('zh-cn');

const { Text, Paragraph } = Typography;

interface CommentItemProps {
  comment: ArchiveComment;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment }) => {
  return (
    <li className="flex border-b border-gray-200 py-4 last:border-b-0">
      <Avatar icon={<UserOutlined />} src={null} className="mt-1 mr-3 flex-shrink-0" />
      <div className="flex-grow">
        <div className="flex items-center justify-between">
          <Text strong className="text-sm">
            {comment.nickname || '匿名用户'}
          </Text>
          <Tooltip title={moment(comment.createdAt).format('YYYY-MM-DD HH:mm:ss')}>
            <Text type="secondary" className="text-xs">
              {moment(comment.createdAt).fromNow()}
            </Text>
          </Tooltip>
        </div>
        <Paragraph className="mt-1 mb-0 text-sm whitespace-pre-wrap text-gray-700">{comment.content}</Paragraph>
      </div>
    </li>
  );
};

export default CommentItem;
