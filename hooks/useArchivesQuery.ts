/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from "@tanstack/react-query";
import { fetchArchives, fetchArchiveById, ArchiveResponse } from "@/apis";
import type { Archives, Archive, FieldFreqMap } from "@/lib/types";

interface ArchivesResponse {
  data: Archive[];
  count: number;
}

const transformArchivesData = (response: ArchivesResponse): Archives => {
  const archivesMap: Record<number, Archive> = {};
  const fieldFreqMap: FieldFreqMap = {
    author: {},
    publisher: {},
    date: {},
    tag: {},
  };

  if (!response?.data || !Array.isArray(response.data)) {
    return { archives: {}, fieldFreqMap };
  }

  response.data.forEach((archive) => {
    archivesMap[archive.id] = archive;
    if (archive.author)
      fieldFreqMap.author[archive.author] =
        (fieldFreqMap.author[archive.author] || 0) + 1;
    if (archive.publisher)
      fieldFreqMap.publisher[archive.publisher] =
        (fieldFreqMap.publisher[archive.publisher] || 0) + 1;
    if (archive.date) {
      const yearMonth = archive.date.substring(0, 7);
      fieldFreqMap.date[yearMonth] = (fieldFreqMap.date[yearMonth] || 0) + 1;
    }
    if (archive.tag?.length > 0) {
      archive.tag.forEach((t) => {
        if (t) fieldFreqMap.tag[t] = (fieldFreqMap.tag[t] || 0) + 1;
      });
    }
  });

  return { archives: archivesMap, fieldFreqMap };
};

export const useFetchArchives = () =>
  useQuery<ArchivesResponse, Error, Archives>({
    queryKey: ["archivesList"],
    queryFn: fetchArchives,
    select: transformArchivesData,
  });

export const useFetchArchiveById = (id: string | number | undefined) =>
  useQuery<ArchiveResponse, any, Archive | undefined>({
    queryKey: ["archive", id],
    queryFn: () => {
      if (!id)
        return Promise.reject({
          message: "Archive ID is required.",
          status: 400,
        });
      return fetchArchiveById(id);
    },
    select: (response) => response.data,
    enabled: !!id && !isNaN(Number(id)),
    retry: (failureCount, error) => {
      if (error?.status === 404) {
        return false;
      }
      return failureCount < 2;
    },
  });
