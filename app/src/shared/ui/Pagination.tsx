import { IconButton } from './IconButton';
import * as s from './styles/Pagination';

type PaginationProps = {
  currentPage: number;
  totalPages: number;

  loading?: boolean;

  previousPageAccessibilityLabel: string;

  nextPageAccessibilityLabel: string;

  onChangePage: (page: number) => void;
};

const getVisiblePages = (currentPage: number, totalPages: number): number[] => {
  const pages = [1, currentPage - 1, currentPage, currentPage + 1, totalPages];

  return pages.filter(
    (page, index) =>
      page >= 1 && page <= totalPages && pages.indexOf(page) === index
  );
};

export const Pagination = ({
  currentPage,
  totalPages,

  loading = false,

  previousPageAccessibilityLabel,
  nextPageAccessibilityLabel,

  onChangePage,
}: PaginationProps) => {
  if (totalPages <= 1) {
    return null;
  }

  const pages = getVisiblePages(currentPage, totalPages);

  const previousDisabled = loading || currentPage <= 1;

  const nextDisabled = loading || currentPage >= totalPages;

  return (
    <s.Scroll
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.contentStyle}
    >
      <IconButton
        icon="chevron-back"
        accessibilityLabel={previousPageAccessibilityLabel}
        disabled={previousDisabled}
        tone="secondary"
        variant="outline"
        size="md"
        onPress={() => {
          onChangePage(currentPage - 1);
        }}
      />

      {pages.map((page) => {
        const isCurrent = page === currentPage;

        const disabled = loading || isCurrent;

        return (
          <s.PageButton
            key={page}
            accessibilityLabel={String(page)}
            accessibilityState={{
              selected: isCurrent,
            }}
            disabled={disabled}
            tone={isCurrent ? 'primary' : 'secondary'}
            variant="solid"
            size="md"
            onPress={() => {
              onChangePage(page);
            }}
          >
            <s.PageText $current={isCurrent}>{page}</s.PageText>
          </s.PageButton>
        );
      })}

      <IconButton
        icon="chevron-forward"
        accessibilityLabel={nextPageAccessibilityLabel}
        disabled={nextDisabled}
        tone="secondary"
        variant="outline"
        size="md"
        onPress={() => {
          onChangePage(currentPage + 1);
        }}
      />
    </s.Scroll>
  );
};
