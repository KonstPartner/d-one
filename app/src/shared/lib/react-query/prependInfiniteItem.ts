import { InfiniteData } from '@tanstack/react-query';

type InfiniteListPage<TItem> = {
  member: TItem[];
  totalItems: number;
};

export const prependInfiniteItem = <
  TItem,
  TPage extends InfiniteListPage<TItem>,
>(
  oldData: InfiniteData<TPage> | undefined,
  item: TItem
): InfiniteData<TPage> | undefined => {
  if (!oldData?.pages?.length) {
    return oldData;
  }

  return {
    ...oldData,
    pages: oldData.pages.map((page, pageIndex) => ({
      ...page,
      member: pageIndex === 0 ? [item, ...page.member] : page.member,
      totalItems: page.totalItems + 1,
    })),
  };
};
