import React from "react";

interface StandardFormRowProps {
  title?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

const StandardFormRow: React.FC<StandardFormRowProps> = ({
  title,
  children,
  ...rest
}) => {
  return (
    <div className="flex items-start w-full" {...rest}>
      {title && (
        <div className="min-w-[64px] mr-6 text-left flex items-center shrink-0 basis-auto">
          <span className="font-bold">{title}：</span>
        </div>
      )}
      <div className="flex-1 basis-0">{children}</div>
    </div>
  );
};

export default StandardFormRow;
