import React from 'react';

interface StandardFormRowProps {
  title?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

const StandardFormRow: React.FC<StandardFormRowProps> = ({ title, children, ...rest }) => {
  return (
    <div className="flex w-full items-start" {...rest}>
      {title && (
        <div className="mr-6 flex min-w-[64px] shrink-0 basis-auto items-center text-left">
          <span className="font-bold">{title}：</span>
        </div>
      )}
      <div className="flex-1 basis-0">{children}</div>
    </div>
  );
};

export default StandardFormRow;
