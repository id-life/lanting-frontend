import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '编辑文章 - 兰亭文存',
  description: '编辑已归档的文章信息。',
};

export default function EditArchiveLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
