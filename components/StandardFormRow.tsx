import React from "react";
import classNames from "classnames";

interface StandardFormRowProps {
  title?: string;
  last?: boolean;
  block?: boolean;
  grid?: boolean;
  style?: React.CSSProperties;
  children: React.ReactNode;
  className?: string;
}

const StandardFormRow: React.FC<StandardFormRowProps> = ({
  title,
  children,
  last,
  block,
  grid,
  className, // 接收 className prop
  ...rest
}) => {
  const cls = classNames(
    "standard-form-row", // 基础类，对应 globals.css 中的样式
    {
      ["standard-form-row-block"]: block,
      ["standard-form-row-last"]: last,
      ["standard-form-row-grid"]: grid,
    },
    className // 合并传入的 className
  );

  return (
    <div className={cls} {...rest}>
      {title && (
        <div className="label">
          <span>{title}</span>
        </div>
      )}
      <div className="content">{children}</div> {/* 对应 .content */}
    </div>
  );
};

export default StandardFormRow;
