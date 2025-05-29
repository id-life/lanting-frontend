"use client";

import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Spin } from "antd";
import ChapterCard from "./ChapterCard";
import { CDN_DOMAIN } from "@/lib/utils";

const processMdImgSyntax = (md: string) => {
  return md.replace(/!\[\]\((.+?)\)/g, (match, g1) => {
    if (g1.startsWith("http://") || g1.startsWith("https://")) {
      return match;
    }
    return `![](${CDN_DOMAIN}/archives/${g1})`;
  });
};

const MiscRecipes = () => {
  const [miscRecipesMd, setMiscRecipesMd] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMiscRecipes = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${CDN_DOMAIN}/archives/1000-随园食单.md`);
        if (response.ok) {
          const mdText = await response.text();
          setMiscRecipesMd(processMdImgSyntax(mdText));
        } else {
          console.error("Failed to fetch misc recipes markdown");
          setMiscRecipesMd("加载食单失败。");
        }
      } catch (error) {
        console.error("Error fetching misc recipes:", error);
        setMiscRecipesMd("加载食单时出错。");
      } finally {
        setLoading(false);
      }
    };
    fetchMiscRecipes();
  }, []);

  return (
    <ChapterCard
      title={<h2 className="text-xl font-medium">随园食单</h2>}
      defaultActiveKey="misc-recipes"
    >
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <Spin />
        </div>
      ) : (
        <div className="prose prose-sm max-w-none react-markdown!">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              img: ({ alt, src, title }) => {
                if (!src) return null;
                const resolvedSrc = (src as string).startsWith("http")
                  ? src
                  : `${CDN_DOMAIN}/archives/origs/${src}`;
                return (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt={alt}
                    src={resolvedSrc}
                    title={title}
                    className="max-w-full h-auto my-2"
                  />
                );
              },
            }}
          >
            {miscRecipesMd}
          </ReactMarkdown>
        </div>
      )}
    </ChapterCard>
  );
};

export default MiscRecipes;
