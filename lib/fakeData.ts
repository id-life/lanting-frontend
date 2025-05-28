import type { Archives } from "@/lib/types";
import localArchivesData from "@/data/archive.json"; // 确保路径正确

const archivesData = Object.values(localArchivesData.archives).map(
  (archive) => {
    if (typeof archive.id === "string") {
      return {
        ...archive,
        id: parseInt(archive.id, 10),
      };
    }
    return archive;
  }
);

export const fakeArchivesData: Archives = {
  archives: archivesData,
  fieldFreqMap: { ...localArchivesData.fieldFreqMap, date: {} },
} as Archives;
