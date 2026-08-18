import * as s from '../styles/CloudDiaryPagination';

type CloudDiaryPaginationProps = {
  hasPreviousPage: boolean;
  hasNextPage: boolean;

  loading?: boolean;

  previousLabel: string;
  nextLabel: string;

  onPrevious: () => void | Promise<void>;
  onNext: () => void | Promise<void>;
};

export const CloudDiaryPagination = ({
  hasPreviousPage,
  hasNextPage,

  loading = false,

  previousLabel,
  nextLabel,

  onPrevious,
  onNext,
}: CloudDiaryPaginationProps) => {
  if (!hasPreviousPage && !hasNextPage) {
    return null;
  }

  return (
    <s.Root>
      {hasPreviousPage && (
        <s.Action
          accessibilityLabel={previousLabel}
          tone={loading ? 'card' : 'input'}
          disabled={loading}
          onPress={() => {
            void onPrevious();
          }}
        >
          <s.ActionText>{previousLabel}</s.ActionText>
        </s.Action>
      )}

      {hasNextPage && (
        <s.Action
          accessibilityLabel={nextLabel}
          tone={loading ? 'card' : 'input'}
          disabled={loading}
          onPress={() => {
            void onNext();
          }}
        >
          <s.ActionText>{nextLabel}</s.ActionText>
        </s.Action>
      )}
    </s.Root>
  );
};
