import { useCallback, useEffect, useMemo, useState } from 'react';
import { BackHandler, Pressable, Text, View } from 'react-native';
import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { PageWrapper } from '@entities/layout/ui';
import { ConfirmModal, Loader, LoadingView } from '@entities/shared/ui';
import { useAuthData } from '@features/auth/api';
import { UserRole } from '@features/auth/model';
import { useDeleteDiaryEntries, useDiaryPage } from '@features/diary/api';
import type { DiaryEntry } from '@features/diary/model';
import { useDiaryListStore } from '@features/diary/model';
import useDiaryEntryFormController from '@features/diary/model/hooks/useDiaryEntryFormController';
import * as styles from '@features/diary/styles/Diary';
import {
  DiaryEntryCard,
  DiaryEntryForm,
  DiaryPhotoViewer,
  LocalDiaryContent,
} from '@features/diary/ui';
import { useHeaderMenu } from '@features/header/model';
import { PlatformOS } from '@features/shared/model';
import * as globalStyles from '@features/shared/styles/global';
import { showNotification } from '@features/shared/ui';

const haveSameIds = (
  currentIds: ReadonlySet<string>,
  nextIds: ReadonlySet<string>
): boolean => {
  if (currentIds.size !== nextIds.size) {
    return false;
  }

  for (const id of currentIds) {
    if (!nextIds.has(id)) {
      return false;
    }
  }

  return true;
};

const LocalDiaryOwnerContent = () => {
  const theme = useTheme();
  const { t } = useTranslation();

  const currentPage = useDiaryListStore((state) => state.currentPage);
  const expandAllDays = useDiaryListStore((state) => state.expandAllDays);

  const pageQuery = useDiaryPage(currentPage);
  const deleteEntries = useDeleteDiaryEntries();

  const [openedPhotoEntry, setOpenedPhotoEntry] = useState<DiaryEntry | null>(
    null
  );
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(
    () => new Set()
  );
  const [deleteConfirmationVisible, setDeleteConfirmationVisible] =
    useState(false);

  const {
    formState,
    handleOpenCreateForm,
    handleOpenEditForm,
    handleCloseForm,
    handleEntrySaved,
  } = useDiaryEntryFormController();

  const availableEntries = useMemo(
    () =>
      (pageQuery.data?.items ?? []).filter(
        (entry) => entry.syncStatus !== 'pendingDelete'
      ),
    [pageQuery.data?.items]
  );

  const availableEntryIds = useMemo(
    () => new Set(availableEntries.map((entry) => entry.id)),
    [availableEntries]
  );

  const allAvailableSelected =
    availableEntryIds.size > 0 &&
    Array.from(availableEntryIds).every((id) => selectedIds.has(id));

  const selectAllChecked =
    selectedIds.size === 0 ? false : allAvailableSelected ? true : 'mixed';

  const handleOpenPhoto = useCallback((entry: DiaryEntry) => {
    setOpenedPhotoEntry(entry);
  }, []);

  const handleClosePhoto = useCallback(() => {
    setOpenedPhotoEntry(null);
  }, []);

  const handleExitSelection = useCallback(() => {
    setDeleteConfirmationVisible(false);
    setSelectedIds(new Set());
    setSelectionMode(false);
  }, []);

  const handleEnterSelection = useCallback(() => {
    setOpenedPhotoEntry(null);
    setSelectedIds(new Set());
    expandAllDays();
    setSelectionMode(true);
  }, [expandAllDays]);

  const headerMenuItems = useMemo(
    () =>
      selectionMode
        ? []
        : [
            {
              key: 'diary-select-entries',
              labelKey: 'diary.menu.selectEntries',
              onPress: handleEnterSelection,
              disabled: availableEntryIds.size === 0,
            },
          ],
    [availableEntryIds.size, handleEnterSelection, selectionMode]
  );

  useHeaderMenu(headerMenuItems, [headerMenuItems]);

  useEffect(() => {
    if (!selectionMode) {
      return;
    }

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        handleExitSelection();

        return true;
      }
    );

    return () => subscription.remove();
  }, [handleExitSelection, selectionMode]);

  useEffect(() => {
    if (!selectionMode) {
      return;
    }

    setSelectedIds((currentIds) => {
      const nextIds = new Set(
        Array.from(currentIds).filter((id) => availableEntryIds.has(id))
      );

      return haveSameIds(currentIds, nextIds) ? currentIds : nextIds;
    });
  }, [availableEntryIds, selectionMode]);

  const handleToggleSelection = useCallback((entry: DiaryEntry) => {
    if (entry.syncStatus === 'pendingDelete') {
      return;
    }

    setSelectedIds((currentIds) => {
      const nextIds = new Set(currentIds);

      if (nextIds.has(entry.id)) {
        nextIds.delete(entry.id);
      } else {
        nextIds.add(entry.id);
      }

      return nextIds;
    });
  }, []);

  const handleToggleSelectAll = useCallback(() => {
    setSelectedIds(
      allAvailableSelected ? new Set() : new Set(availableEntryIds)
    );
  }, [allAvailableSelected, availableEntryIds]);

  const handleConfirmDelete = useCallback(async () => {
    if (selectedIds.size === 0 || deleteEntries.isPending) {
      return;
    }

    try {
      await deleteEntries.mutateAsync(Array.from(selectedIds));

      handleExitSelection();
    } catch (error) {
      console.error('Failed to mark diary entries for deletion', error);

      setDeleteConfirmationVisible(false);
      showNotification('error', t('diary.selection.deleteFailed'));
    }
  }, [deleteEntries, handleExitSelection, selectedIds, t]);

  const renderLocalEntry = useCallback(
    (entry: DiaryEntry, isVisible: boolean) => {
      if (!selectionMode) {
        return (
          <DiaryEntryCard
            entry={entry}
            isVisible={isVisible}
            onPress={handleOpenEditForm}
            onOpenPhoto={handleOpenPhoto}
          />
        );
      }

      const unavailable = entry.syncStatus === 'pendingDelete';
      const selected = selectedIds.has(entry.id);

      return (
        <Pressable
          disabled={unavailable}
          accessibilityRole="checkbox"
          accessibilityLabel={t('diary.selection.entryAccessibilityLabel')}
          accessibilityState={{
            checked: selected,
            disabled: unavailable,
          }}
          onPress={() => handleToggleSelection(entry)}
          style={styles.SelectableEntry(theme, selected, unavailable)}
        >
          <View style={styles.SelectionIndicatorSlot}>
            {!unavailable && (
              <View style={styles.SelectionIndicator(theme, selected)}>
                {selected && (
                  <Ionicons
                    name="checkmark"
                    size={theme.size.md}
                    color={theme.colors.white}
                  />
                )}
              </View>
            )}
          </View>

          <View
            pointerEvents="none"
            style={styles.SelectionCard(theme, selected)}
          >
            <DiaryEntryCard entry={entry} isVisible={isVisible} />
          </View>
        </Pressable>
      );
    },
    [
      handleOpenEditForm,
      handleOpenPhoto,
      handleToggleSelection,
      selectedIds,
      selectionMode,
      t,
      theme,
    ]
  );

  return (
    <View style={styles.OwnerContent}>
      {selectionMode ? (
        <View style={styles.SelectionToolbar(theme)}>
          <Pressable
            disabled={availableEntryIds.size === 0}
            accessibilityRole="checkbox"
            accessibilityLabel={t(
              allAvailableSelected
                ? 'diary.selection.clearAll'
                : 'diary.selection.selectAll'
            )}
            accessibilityState={{
              checked: selectAllChecked,
              disabled: availableEntryIds.size === 0,
            }}
            onPress={handleToggleSelectAll}
            style={styles.SelectionAction(
              theme,
              'primary',
              availableEntryIds.size === 0
            )}
          >
            <Ionicons
              name={
                allAvailableSelected
                  ? 'checkbox'
                  : selectedIds.size > 0
                    ? 'remove-circle'
                    : 'square-outline'
              }
              size={theme.size.base}
              color={theme.colors.white}
            />

            <Text style={styles.SelectionActionText(theme, 'primary')}>
              {t(
                allAvailableSelected
                  ? 'diary.selection.clearAll'
                  : 'diary.selection.selectAll'
              )}
            </Text>
          </Pressable>

          <Text style={styles.SelectionCount(theme)}>
            {t('diary.selection.selected', {
              count: selectedIds.size,
            })}
          </Text>

          <Pressable
            disabled={selectedIds.size === 0 || deleteEntries.isPending}
            accessibilityRole="button"
            accessibilityLabel={t('diary.selection.delete')}
            onPress={() => setDeleteConfirmationVisible(true)}
            style={styles.SelectionAction(
              theme,
              'danger',
              selectedIds.size === 0 || deleteEntries.isPending
            )}
          >
            <Text style={styles.SelectionActionText(theme, 'danger')}>
              {t('diary.selection.delete')}
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('diary.selection.close')}
            onPress={handleExitSelection}
            style={styles.CloseSelectionButton(theme)}
          >
            <Ionicons
              name="close"
              size={theme.size.md}
              color={theme.colors.text}
            />
          </Pressable>
        </View>
      ) : (
        <View style={styles.Toolbar(theme)}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('diary.form.openCreateAccessibilityLabel')}
            onPress={handleOpenCreateForm}
            style={styles.CreateButton(theme)}
          >
            <Ionicons
              name="add"
              size={theme.size.lg}
              color={theme.colors.white}
            />
          </Pressable>
        </View>
      )}

      <LocalDiaryContent
        selectionMode={selectionMode}
        renderEntry={renderLocalEntry}
      />

      <DiaryPhotoViewer entry={openedPhotoEntry} onClose={handleClosePhoto} />

      <DiaryEntryForm
        visible={formState.visible}
        mode={formState.mode}
        entry={formState.entry}
        onClose={handleCloseForm}
        onSaved={handleEntrySaved}
      />

      {deleteConfirmationVisible && (
        <ConfirmModal
          title={t('diary.selection.deleteConfirmTitle')}
          description={t('diary.selection.deleteConfirmDescription', {
            count: selectedIds.size,
          })}
          buttonText={t('diary.selection.delete')}
          buttonStyle={globalStyles.Button(
            theme,
            'danger',
            deleteEntries.isPending
          )}
          modalVisible
          setModalVisible={setDeleteConfirmationVisible}
          handleConfirmation={() => {
            void handleConfirmDelete();
          }}
        />
      )}
    </View>
  );
};

const Diary = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { authData, isAuthLoading } = useAuthData();

  const isOwner = authData?.role === UserRole.User;
  const isOwnerWeb = PlatformOS.WEB && isOwner;

  return (
    <PageWrapper>
      <LoadingView loading={isAuthLoading}>
        <Loader errorType="none">
          {isOwnerWeb ? (
            <View style={styles.UnsupportedContent(theme)}>
              <Text style={[globalStyles.Heading(theme), styles.CenteredText]}>
                {t('diary.unsupportedPlatform.title')}
              </Text>

              <Text style={[globalStyles.Body(theme), styles.CenteredText]}>
                {t('diary.unsupportedPlatform.description')}
              </Text>
            </View>
          ) : isOwner ? (
            <LocalDiaryOwnerContent />
          ) : (
            <View>
              <Text style={globalStyles.Body(theme)}>Diary</Text>
            </View>
          )}
        </Loader>
      </LoadingView>
    </PageWrapper>
  );
};

export default Diary;
