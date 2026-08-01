import { Pressable, ScrollView, Text } from 'react-native';
import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';

import * as globalStyles from '@features/shared/styles/global';

type DiaryPaginationProps = {
  currentPage: number;
  totalPages: number;
  loading: boolean;
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

const DiaryPagination = ({
  currentPage,
  totalPages,
  loading,
  previousPageAccessibilityLabel,
  nextPageAccessibilityLabel,
  onChangePage,
}: DiaryPaginationProps) => {
  const theme = useTheme();

  if (totalPages <= 1) {
    return null;
  }

  const pages = getVisiblePages(currentPage, totalPages);
  const previousDisabled = loading || currentPage <= 1;
  const nextDisabled = loading || currentPage >= totalPages;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[
        globalStyles.Row(theme, 'center', 'center', 'sm'),
        { flexGrow: 1 },
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={previousPageAccessibilityLabel}
        accessibilityState={{ disabled: previousDisabled }}
        disabled={previousDisabled}
        onPress={() => onChangePage(currentPage - 1)}
        style={globalStyles.IconButton(
          theme,
          'secondary',
          'md',
          previousDisabled
        )}
      >
        <Ionicons
          name="chevron-back"
          size={theme.size.md}
          color={previousDisabled ? theme.colors.muted : theme.colors.text}
        />
      </Pressable>

      {pages.map((page) => {
        const isCurrent = page === currentPage;
        const disabled = loading || isCurrent;

        return (
          <Pressable
            key={page}
            accessibilityRole="button"
            accessibilityLabel={String(page)}
            accessibilityState={{
              disabled,
              selected: isCurrent,
            }}
            disabled={disabled}
            onPress={() => onChangePage(page)}
            style={globalStyles.IconButton(
              theme,
              isCurrent ? 'primary' : 'secondary',
              'md',
              loading
            )}
          >
            <Text
              style={globalStyles.Text(
                theme,
                'base',
                'bold',
                isCurrent ? 'inverse' : 'default'
              )}
            >
              {page}
            </Text>
          </Pressable>
        );
      })}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={nextPageAccessibilityLabel}
        accessibilityState={{ disabled: nextDisabled }}
        disabled={nextDisabled}
        onPress={() => onChangePage(currentPage + 1)}
        style={globalStyles.IconButton(theme, 'secondary', 'md', nextDisabled)}
      >
        <Ionicons
          name="chevron-forward"
          size={theme.size.md}
          color={nextDisabled ? theme.colors.muted : theme.colors.text}
        />
      </Pressable>
    </ScrollView>
  );
};

export default DiaryPagination;
