export interface InnovaResponse<T> {
  data: T;
  message: string;
  isSuccess: boolean;
}

export interface PageResult<T> {
  count: number;
  collections: T[];
}

export interface PagingParameters {
  pageNumber?: number;
  pageSize?: number;
}

export interface SearchParameters {
  pagingParameters: PagingParameters;
  keyword?: string;
  isByPass?: boolean;
  /** Client-side total from last search response. */
  totalCount?: number;
}
