import { useMemo } from 'react';
import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import {
  DIARY_ENTRY_PRESENCE_VALUES,
  type DiaryEntryPresence,
} from '@entities/diary';
import * as ss from '@shared/styles';
import { Button, IconButton, PortalModal, SegmentedSwitch } from '@shared/ui';

import { useDiaryFiltersModal } from '../model/useDiaryFiltersModal';
import * as s from '../styles/DiaryFiltersModal';

import { DiaryFilterDateSection } from './DiaryFilterDateSection';
import { DiaryFilterMealRelationSection } from './DiaryFilterMealRelationSection';
import { DiaryNumericRangeFilter } from './DiaryNumericRangeFilter';

type DiaryFiltersModalProps = {
  onApply: () => void;
};

const NUMERIC_FILTERS = [
  {
    field: 'glucose',
    labelKey: 'diary.entry.metrics.glucose',
    scaleMaximum: 40,
    step: 0.1,
  },
  {
    field: 'shortInsulin',
    labelKey: 'diary.entry.metrics.shortInsulin',
    scaleMaximum: 30,
    step: 1,
  },
  {
    field: 'longInsulin',
    labelKey: 'diary.entry.metrics.longInsulin',
    scaleMaximum: 60,
    step: 1,
  },
  {
    field: 'carbsGram',
    labelKey: 'diary.entry.metrics.carbohydrates',
    scaleMaximum: 100,
    step: 1,
  },
] as const;

export const DiaryFiltersModal = ({ onApply }: DiaryFiltersModalProps) => {
  const theme = useTheme();

  const { t } = useTranslation();

  const modal = useDiaryFiltersModal({
    onApply,
  });

  const presenceOptions = useMemo(
    () =>
      DIARY_ENTRY_PRESENCE_VALUES.map((value) => ({
        value,

        label: t(`diary.filters.presence.${value}`),
      })),
    [t]
  );

  const renderPresenceSection = (
    label: string,
    value: DiaryEntryPresence,
    onChange: (nextValue: DiaryEntryPresence) => void
  ) => (
    <s.SectionCard style={[ss.Surface(theme, 'card'), ss.Rounded(theme, 'lg')]}>
      <s.SectionTitle>{label}</s.SectionTitle>

      <SegmentedSwitch
        value={value}
        options={presenceOptions}
        onChange={onChange}
      />
    </s.SectionCard>
  );

  return (
    <PortalModal
      visible={modal.visible}
      onClose={modal.handleClose}
      withoutScroll
      withoutCloseBtn
    >
      <s.Root>
        <s.Header>
          <s.Title>{t('diary.filters.title')}</s.Title>

          <IconButton
            icon="close"
            accessibilityLabel={t('diary.filters.closeAccessibilityLabel')}
            tone="secondary"
            variant="ghost"
            size="sm"
            onPress={modal.handleClose}
          />
        </s.Header>

        <s.Scroll
          testID="diary-filters-scroll"
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.scrollContentStyle}
        >
          <DiaryFilterDateSection
            date={modal.draftFilters.date}
            calendarCurrent={modal.calendarCurrent}
            markedDates={modal.markedDates}
            onDayPress={modal.handleDayPress}
            onClearDates={modal.handleClearDates}
            onClearBoundary={modal.handleClearDateBoundary}
            onActiveBoundaryChange={modal.handleActiveBoundaryChange}
          />

          {NUMERIC_FILTERS.map(({ field, labelKey, scaleMaximum, step }) => (
            <DiaryNumericRangeFilter
              key={field}
              field={field}
              label={t(labelKey)}
              range={modal.draftFilters[field]}
              minText={modal.numericText[field].min}
              maxText={modal.numericText[field].max}
              scaleMinimum={0}
              scaleMaximum={scaleMaximum}
              step={step}
              color={theme.colors.metrics[field].text}
              fromLabel={t('diary.filters.range.from')}
              toLabel={t('diary.filters.range.to')}
              nullLabel={t('diary.filters.range.null')}
              resetLabel={t('diary.filters.reset')}
              errorText={t('diary.filters.range.invalid')}
              onTextChange={modal.handleNumericTextChange}
              onRangeChange={modal.handleNumericRangeChange}
              onReset={modal.handleResetNumericRange}
            />
          ))}

          <DiaryFilterMealRelationSection
            value={modal.draftFilters.mealRelations}
            onToggle={modal.handleToggleMealRelation}
          />

          {renderPresenceSection(
            t('diary.filters.photo'),

            modal.draftFilters.photo,

            (value) => {
              modal.handlePresenceChange('photo', value);
            }
          )}

          {renderPresenceSection(
            t('diary.filters.aiAnalysis'),

            modal.draftFilters.aiAnalysis,

            (value) => {
              modal.handlePresenceChange('aiAnalysis', value);
            }
          )}

          {!modal.rangesValid && (
            <s.ApplyError>
              {t('diary.filters.range.fixBeforeApply')}
            </s.ApplyError>
          )}
        </s.Scroll>

        <s.Footer>
          <Button
            accessibilityLabel={t('diary.filters.clear')}
            disabled={!modal.canClear}
            tone="muted"
            style={s.footerButtonStyle}
            onPress={modal.handleClear}
          >
            <s.SecondaryButtonText>
              {t('diary.filters.clear')}
            </s.SecondaryButtonText>
          </Button>

          <Button
            accessibilityLabel={t(
              modal.isApplied ? 'diary.filters.applied' : 'diary.filters.apply'
            )}
            disabled={!modal.canApply}
            tone={modal.isApplied ? 'muted' : 'primary'}
            style={s.footerButtonStyle}
            onPress={modal.handleApply}
          >
            <s.ApplyButtonContent>
              {modal.isApplied && (
                <Ionicons
                  name="checkmark"
                  size={theme.size.base}
                  color={theme.colors.muted}
                />
              )}

              <s.ApplyButtonText $applied={modal.isApplied}>
                {t(
                  modal.isApplied
                    ? 'diary.filters.applied'
                    : 'diary.filters.apply'
                )}
              </s.ApplyButtonText>
            </s.ApplyButtonContent>
          </Button>
        </s.Footer>
      </s.Root>
    </PortalModal>
  );
};
