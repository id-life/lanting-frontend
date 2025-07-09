import Link from 'next/link';
import { Result, Button } from 'antd';

export default function NotFound() {
  return (
    <Result
      status="404"
      title="404 - 文章未找到"
      subTitle="抱歉，您访问的文章不存在或已被删除。"
      extra={
        <Link href="/">
          <Button type="primary">返回首页</Button>
        </Link>
      }
      className="pt-12"
    />
  );
}
