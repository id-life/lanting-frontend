// lib/services/keywordExtractor.ts

// 预定义的关键词库，按类别分类
const predefinedKeywords = {
  // 技术类
  tech: [
    "人工智能",
    "AI",
    "机器学习",
    "深度学习",
    "区块链",
    "云计算",
    "大数据",
    "物联网",
    "IoT",
    "5G",
    "编程",
    "算法",
    "API",
    "前端",
    "后端",
    "全栈",
    "数据库",
    "SQL",
    "NoSQL",
    "Linux",
    "Windows",
    "macOS",
    "iOS",
    "Android",
    "开源",
    "GitHub",
    "代码",
    "软件开发",
    "硬件",
    "网络安全",
    "加密",
    "虚拟现实",
    "VR",
    "增强现实",
    "AR",
    "量子计算",
    "边缘计算",
  ],
  // 商业类
  business: [
    "创业",
    "投资",
    "融资",
    "股票",
    "市场",
    "营销",
    "策略",
    "管理",
    "领导力",
    "团队",
    "创新",
    "商业模式",
    "盈利",
    "收入",
    "成本",
    "客户",
    "用户",
    "产品",
    "服务",
    "品牌",
    "竞争",
    "合作",
    "B2B",
    "B2C",
    "C2C",
    "电子商务",
    "零售",
    "批发",
    "供应链",
    "创业公司",
    "独角兽",
    "风险投资",
    "VC",
    "天使投资",
    "IPO",
  ],
  // 文化类
  culture: [
    "历史",
    "文学",
    "艺术",
    "音乐",
    "电影",
    "戏剧",
    "哲学",
    "宗教",
    "社会",
    "文化",
    "传统",
    "民族",
    "语言",
    "教育",
    "学术",
    "研究",
    "传媒",
    "新闻",
    "出版",
    "博客",
    "自媒体",
    "短视频",
    "直播",
    "潮流",
    "时尚",
    "设计",
    "创意",
    "游戏",
    "动漫",
    "二次元",
  ],
  // 生活类
  lifestyle: [
    "健康",
    "医疗",
    "养生",
    "饮食",
    "运动",
    "旅行",
    "家居",
    "装修",
    "汽车",
    "交通",
    "环保",
    "可持续",
    "心理",
    "情感",
    "人际关系",
    "职场",
    "工作",
    "学习",
    "效率",
    "时间管理",
    "财务",
    "理财",
    "消费",
    "购物",
    "美食",
    "美容",
    "时尚",
    "穿搭",
  ],
};

// 常见的停用词
const stopWords = new Set([
  "的",
  "了",
  "和",
  "是",
  "就",
  "都",
  "而",
  "及",
  "与",
  "这",
  "那",
  "你",
  "我",
  "他",
  "她",
  "它",
  "们",
  "有",
  "在",
  "中",
  "为",
  "以",
  "于",
  "对",
  "从",
  "但",
  "并",
  "等",
  "被",
  "the",
  "a",
  "an",
  "of",
  "to",
  "and",
  "in",
  "that",
  "it",
  "with",
  "for",
  "as",
  "be",
  "on",
  "by",
  "at",
  "this",
  "was",
  "is",
  "are",
  "from",
  "or",
  "not",
  "也",
  "还",
  "个",
  "已",
  "把",
  "着",
  "说",
  "会",
  "可",
  "到",
  "要",
  "我们",
  "他们",
  "你们",
  "一些",
  "一个",
  "一种",
  "这个",
  "那个",
  "其",
  "其他",
  "之",
  "与否",
  "以及",
  "或者",
  "就是",
  "如果",
  "那么",
  "所以",
  "但是",
  "因为",
  "通过",
  "由于",
  "关于",
  "对于",
  "为了",
  "of",
  "in",
  "on",
  "at",
  "by",
  "for",
  "with",
  "about",
  "as",
  "into",
  "like",
  "through",
  "after",
  "over",
  "between",
  "out",
  "against",
  "during",
  "without",
  "before",
  "under",
  "around",
  "among",
]);

/**
 * 从摘要文本中提取可能的关键词
 * @param summary 摘要文本
 * @returns 提取的关键词数组
 */
export const extractKeywordsFromSummary = (
  summary?: string | null
): string[] => {
  if (!summary || summary.trim().length < 10) return []; // 摘要过短不处理

  const text = summary
    .toLowerCase()
    .replace(/[.,!?()\[\]{}<>:;"'“”‘’\n\r\t]/g, " "); // 移除标点和换行

  const words = text
    .split(/\s+/)
    .filter(
      (word) => word.length > 1 && !stopWords.has(word) && !/^\d+$/.test(word)
    );

  const wordFrequency: Record<string, number> = {};
  words.forEach((word) => {
    // 简单处理英文复数 (不完美，但能覆盖一些情况)
    let singularWord = word;
    if (word.endsWith("s") && word.length > 2) {
      singularWord = word.slice(0, -1);
    }
    if (singularWord.length > 1 && !stopWords.has(singularWord)) {
      wordFrequency[singularWord] = (wordFrequency[singularWord] || 0) + 1;
    } else if (word.length > 1) {
      // 如果去复数后变成停用词，则用原词
      wordFrequency[word] = (wordFrequency[word] || 0) + 1;
    }
  });

  // 按词频排序并取前 N 个，且词频至少为 2
  const sortedKeywords = Object.entries(wordFrequency)
    .filter(([, count]) => count >= 1) // 至少出现1次
    .sort(([, countA], [, countB]) => countB - countA)
    .slice(0, 15) // 最多取15个
    .map(([word]) => word);

  return sortedKeywords;
};

/**
 * 从摘要中匹配预定义的关键词
 * @param summary 摘要文本
 * @returns 匹配到的预定义关键词
 */
export const matchPredefinedKeywords = (summary?: string | null): string[] => {
  if (!summary) return [];
  const text = summary.toLowerCase();
  const matches = new Set<string>(); // 使用 Set 避免重复

  Object.values(predefinedKeywords)
    .flat()
    .forEach((keyword) => {
      if (text.includes(keyword.toLowerCase())) {
        matches.add(keyword);
      }
    });
  return Array.from(matches);
};

export const generateKeywordSuggestions = (
  summary?: string | null
): {
  predefined: string[];
  extracted: string[];
} => {
  if (!summary) {
    return { predefined: [], extracted: [] };
  }

  const predefinedMatches = matchPredefinedKeywords(summary);
  const extractedKeywords = extractKeywordsFromSummary(summary);

  const uniqueExtracted = extractedKeywords.filter(
    (keyword) =>
      !predefinedMatches.some(
        (pm) => pm.toLowerCase() === keyword.toLowerCase()
      )
  );

  return {
    predefined: predefinedMatches.slice(0, 10), // 最多显示10个预定义
    extracted: uniqueExtracted.slice(0, 10), // 最多显示10个提取
  };
};
