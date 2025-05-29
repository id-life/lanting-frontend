"use client";

import React from "react";
import { Card, Collapse } from "antd";

const { Panel } = Collapse;

export interface ChapterCardProps {
  title: string | React.ReactElement;
  children: React.ReactNode;
  defaultActiveKey?: string | string[];
}

const ChapterCard: React.FC<ChapterCardProps> = ({
  title,
  children,
  defaultActiveKey,
}) => (
  <Card className="chapter-card rounded-none shadow-none" variant="borderless">
    <Collapse ghost defaultActiveKey={defaultActiveKey || []} accordion>
      <Panel
        header={title}
        key={typeof title === "string" ? title : "chapter-panel"}
        showArrow={false}
      >
        {children}
      </Panel>
    </Collapse>
  </Card>
);

export default ChapterCard;
