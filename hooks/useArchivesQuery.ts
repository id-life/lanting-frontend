import { useQuery } from '@tanstack/react-query';
import { fetchArchives, fetchArchiveById } from '@/apis';
import type { Archives, FieldFreqMap } from '@/lib/types';
import { Archive, FindAllArchivesResponse, FindOneArchiveResponse } from '@/apis/types';

const transformArchivesData = (response: FindAllArchivesResponse): Archives => {
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
    if (archive.authors?.length > 0) {
      archive.authors.forEach((author) => {
        if (author.name) fieldFreqMap.author[author.name] = (fieldFreqMap.author[author.name] || 0) + 1;
      });
    }
    if (archive.publisher?.name)
      fieldFreqMap.publisher[archive.publisher.name] = (fieldFreqMap.publisher[archive.publisher.name] || 0) + 1;
    if (archive.date?.value) {
      const yearMonth = archive.date.value.substring(0, 7);
      fieldFreqMap.date[yearMonth] = (fieldFreqMap.date[yearMonth] || 0) + 1;
    }
    if (archive.tags?.length > 0) {
      archive.tags.forEach((tag) => {
        if (tag.name) fieldFreqMap.tag[tag.name] = (fieldFreqMap.tag[tag.name] || 0) + 1;
      });
    }
  });

  return { archives: archivesMap, fieldFreqMap };
};

export const useFetchArchives = () =>
  useQuery<FindAllArchivesResponse, Error, Archives>({
    queryKey: ['archivesList'],
    queryFn: fetchArchives,
    select: transformArchivesData,
  });

export const useFetchArchiveById = (id: string | number | undefined) =>
  useQuery<FindOneArchiveResponse, any, Archive | undefined>({
    queryKey: ['archive', id],
    queryFn: () => {
      if (!id)
        return Promise.reject({
          message: 'Archive ID is required.',
          status: 400,
        });
      return fetchArchiveById(id);
    },
    select: (response) => (response.data ? response.data : undefined),
    enabled: !!id && !isNaN(Number(id)),
    retry: (failureCount, error) => {
      if (error?.status === 404) {
        return false;
      }
      return failureCount < 2;
    },
  });
