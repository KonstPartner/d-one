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
}: CloudDiaryPaginationProps) => (
  <s.Root>
    <s.Action
      accessibilityLabel={previousLabel}
      tone="secondary"
      variant="outline"
      size="md"
      disabled={loading || !hasPreviousPage}
      onPress={() => {
        void onPrevious();
      }}
    >
      <s.ActionText>{previousLabel}</s.ActionText>
    </s.Action>

    <s.Action
      accessibilityLabel={nextLabel}
      tone="secondary"
      variant="outline"
      size="md"
      disabled={loading || !hasNextPage}
      onPress={() => {
        void onNext();
      }}
    >
      <s.ActionText>{nextLabel}</s.ActionText>
    </s.Action>
  </s.Root>
);
