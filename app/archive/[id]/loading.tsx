// import React from "react";
// import { Spin } from "antd";
// import { PageContainer } from "@ant-design/pro-components";

// export default function Loading() {
//   return (
//     <PageContainer title="兰亭文存">
//       <div className="flex justify-center items-center py-20">
//         <Spin size="large" tip="正在加载文章详情..." />
//       </div>
//     </PageContainer>
//   );
// }
"use client";

import { PageLoading } from "@ant-design/pro-components";
import React from "react";

export default function Loading() {
  return <PageLoading />;
}
