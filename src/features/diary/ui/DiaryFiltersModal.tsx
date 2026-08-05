import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  PanResponder,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Calendar, type DateData } from 'react-native-calendars';
import { ScrollView } from 'react-native-gesture-handler';

import Button from '@entities/shared/ui/Button';
import * as globalStyles from '@features/shared/styles/global';
import PortalModal from '@features/shared/ui/PortalModal';

import useDiaryFilters from '../model/hooks/useDiaryFilters';
import type {
  DiaryFilterDateBoundary,
  DiaryFilterNumericField,
  DiaryFilterNumericRange,
  DiaryFilterPresence,
  MealRelation,
} from '../model/types';
import { DIARY_FILTER_PRESENCE_VALUES, MEAL_RELATIONS } from '../model/types';
import * as styles from '../styles/DiaryFiltersModal';

type NumericBoundary = 'min' | 'max';

type NumericRangeBlockProps = {
  field: DiaryFilterNumericField;
  label: string;
  range: DiaryFilterNumericRange;
  minText: string;
  maxText: string;
  scaleMinimum: number;
  scaleMaximum: number;
  step: number;
  color: string;
  errorText: string;
  fromLabel: string;
  toLabel: string;
  nullLabel: string;
  resetLabel: string;
  onTextChange: (
    field: DiaryFilterNumericField,
    boundary: NumericBoundary,
    text: string
  ) => void;
  onRangeChange: (
    field: DiaryFilterNumericField,
    boundary: NumericBoundary,
    value: number | null
  ) => void;
  onReset: (field: DiaryFilterNumericField) => void;
};

const clamp = (value: number, minimum: number, maximum: number): number =>
  Math.min(Math.max(value, minimum), maximum);

const roundToStep = (value: number, step: number): number => {
  const decimalPlaces = step < 1 ? 1 : 0;

  return Number((Math.round(value / step) * step).toFixed(decimalPlaces));
};

const NUMERIC_SCALE_START_POSITION = 14;
const NUMERIC_SCALE_END_POSITION = 86;
const LEFT_NULL_SNAP_POSITION = NUMERIC_SCALE_START_POSITION / 2;
const RIGHT_NULL_SNAP_POSITION = (NUMERIC_SCALE_END_POSITION + 100) / 2;
const SLIDER_SYNC_ANIMATION_MS = 140;

const numericValueToPosition = (
  value: number,
  scaleMinimum: number,
  scaleMaximum: number
): number =>
  NUMERIC_SCALE_START_POSITION +
  ((clamp(value, scaleMinimum, scaleMaximum) - scaleMinimum) /
    (scaleMaximum - scaleMinimum)) *
    (NUMERIC_SCALE_END_POSITION - NUMERIC_SCALE_START_POSITION);

const boundaryValueToPosition = (
  boundary: NumericBoundary,
  value: number | null,
  scaleMinimum: number,
  scaleMaximum: number
): number => {
  if (value === null) {
    return boundary === 'min' ? 0 : 100;
  }

  return numericValueToPosition(value, scaleMinimum, scaleMaximum);
};

const positionToBoundaryValue = (
  boundary: NumericBoundary,
  position: number,
  scaleMinimum: number,
  scaleMaximum: number,
  step: number
): number | null => {
  if (boundary === 'min' && position < NUMERIC_SCALE_START_POSITION) {
    return null;
  }

  if (boundary === 'max' && position > NUMERIC_SCALE_END_POSITION) {
    return null;
  }

  const numericPosition = clamp(
    position,
    NUMERIC_SCALE_START_POSITION,
    NUMERIC_SCALE_END_POSITION
  );
  const value =
    scaleMinimum +
    ((numericPosition - NUMERIC_SCALE_START_POSITION) /
      (NUMERIC_SCALE_END_POSITION - NUMERIC_SCALE_START_POSITION)) *
      (scaleMaximum - scaleMinimum);

  return roundToStep(value, step);
};

const snapBoundaryPosition = (
  boundary: NumericBoundary,
  requestedPosition: number,
  otherPosition: number
): number => {
  if (boundary === 'min') {
    const position = clamp(
      requestedPosition,
      0,
      Math.min(NUMERIC_SCALE_END_POSITION, otherPosition)
    );

    if (position <= LEFT_NULL_SNAP_POSITION) {
      return 0;
    }

    return Math.max(position, NUMERIC_SCALE_START_POSITION);
  }

  const position = clamp(
    requestedPosition,
    Math.max(NUMERIC_SCALE_START_POSITION, otherPosition),
    100
  );

  if (position >= RIGHT_NULL_SNAP_POSITION) {
    return 100;
  }

  return Math.min(position, NUMERIC_SCALE_END_POSITION);
};

const NumericRangeBlock = ({
  field,
  label,
  range,
  minText,
  maxText,
  scaleMinimum,
  scaleMaximum,
  step,
  color,
  errorText,
  fromLabel,
  toLabel,
  nullLabel,
  resetLabel,
  onTextChange,
  onRangeChange,
  onReset,
}: NumericRangeBlockProps) => {
  const theme = useTheme();
  const trackWidthRef = useRef(0);
  const rangeRef = useRef(range);
  const draggingBoundaryRef = useRef<NumericBoundary | null>(null);
  const dragStartPositionRef = useRef(0);
  const initialMinPosition = boundaryValueToPosition(
    'min',
    range.min,
    scaleMinimum,
    scaleMaximum
  );
  const initialMaxPosition = boundaryValueToPosition(
    'max',
    range.max,
    scaleMinimum,
    scaleMaximum
  );
  const thumbPositionsRef = useRef({
    min: initialMinPosition,
    max: initialMaxPosition,
  });
  const minPosition = useRef(new Animated.Value(initialMinPosition)).current;
  const maxPosition = useRef(new Animated.Value(initialMaxPosition)).current;
  const [dragPreview, setDragPreview] = useState<{
    boundary: NumericBoundary;
    value: number | null;
  } | null>(null);

  const positionAnimations = useMemo(
    () => ({ min: minPosition, max: maxPosition }),
    [maxPosition, minPosition]
  );

  useEffect(() => {
    rangeRef.current = range;

    if (draggingBoundaryRef.current !== null) {
      return;
    }

    const nextPositions = {
      min: boundaryValueToPosition(
        'min',
        range.min,
        scaleMinimum,
        scaleMaximum
      ),
      max: boundaryValueToPosition(
        'max',
        range.max,
        scaleMinimum,
        scaleMaximum
      ),
    };

    thumbPositionsRef.current = nextPositions;
    Animated.parallel([
      Animated.timing(minPosition, {
        toValue: nextPositions.min,
        duration: SLIDER_SYNC_ANIMATION_MS,
        useNativeDriver: false,
      }),
      Animated.timing(maxPosition, {
        toValue: nextPositions.max,
        duration: SLIDER_SYNC_ANIMATION_MS,
        useNativeDriver: false,
      }),
    ]).start();
  }, [maxPosition, minPosition, range, scaleMaximum, scaleMinimum]);

  const invalid =
    range.min !== null && range.max !== null && range.min > range.max;
  const canReset =
    range.min !== null ||
    range.max !== null ||
    minText.length > 0 ||
    maxText.length > 0;

  const updateVisualBoundaryPosition = useCallback(
    (boundary: NumericBoundary, requestedPosition: number) => {
      const otherBoundary: NumericBoundary = boundary === 'min' ? 'max' : 'min';
      const position = snapBoundaryPosition(
        boundary,
        requestedPosition,
        thumbPositionsRef.current[otherBoundary]
      );

      thumbPositionsRef.current = {
        ...thumbPositionsRef.current,
        [boundary]: position,
      };
      positionAnimations[boundary].setValue(position);

      return position;
    },
    [positionAnimations]
  );

  const commitBoundaryPosition = useCallback(
    (boundary: NumericBoundary) => {
      const value = positionToBoundaryValue(
        boundary,
        thumbPositionsRef.current[boundary],
        scaleMinimum,
        scaleMaximum,
        step
      );
      const canonicalPosition = boundaryValueToPosition(
        boundary,
        value,
        scaleMinimum,
        scaleMaximum
      );

      thumbPositionsRef.current = {
        ...thumbPositionsRef.current,
        [boundary]: canonicalPosition,
      };
      Animated.timing(positionAnimations[boundary], {
        toValue: canonicalPosition,
        duration: 90,
        useNativeDriver: false,
      }).start();

      if (rangeRef.current[boundary] !== value) {
        rangeRef.current = { ...rangeRef.current, [boundary]: value };
        onRangeChange(field, boundary, value);
      }
    },
    [field, onRangeChange, positionAnimations, scaleMaximum, scaleMinimum, step]
  );

  const createThumbResponder = useCallback(
    (boundary: NumericBoundary) =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          draggingBoundaryRef.current = boundary;
          positionAnimations[boundary].stopAnimation((position) => {
            thumbPositionsRef.current = {
              ...thumbPositionsRef.current,
              [boundary]: position,
            };
            dragStartPositionRef.current = position;
            setDragPreview({
              boundary,
              value: positionToBoundaryValue(
                boundary,
                position,
                scaleMinimum,
                scaleMaximum,
                step
              ),
            });
          });
        },
        onPanResponderMove: (_, gestureState) => {
          if (trackWidthRef.current <= 0) {
            return;
          }

          const position = updateVisualBoundaryPosition(
            boundary,
            dragStartPositionRef.current +
              (gestureState.dx / trackWidthRef.current) * 100
          );

          const value = positionToBoundaryValue(
            boundary,
            position,
            scaleMinimum,
            scaleMaximum,
            step
          );

          setDragPreview((currentPreview) =>
            currentPreview?.boundary === boundary &&
            currentPreview.value === value
              ? currentPreview
              : { boundary, value }
          );
        },
        onPanResponderRelease: () => {
          commitBoundaryPosition(boundary);
          draggingBoundaryRef.current = null;
          setDragPreview(null);
        },
        onPanResponderTerminate: () => {
          commitBoundaryPosition(boundary);
          draggingBoundaryRef.current = null;
          setDragPreview(null);
        },
        onPanResponderTerminationRequest: () => false,
      }),
    [
      commitBoundaryPosition,
      positionAnimations,
      scaleMaximum,
      scaleMinimum,
      step,
      updateVisualBoundaryPosition,
    ]
  );

  const minResponder = useMemo(
    () => createThumbResponder('min'),
    [createThumbResponder]
  );
  const maxResponder = useMemo(
    () => createThumbResponder('max'),
    [createThumbResponder]
  );

  const handleAccessibilityAction = (
    boundary: NumericBoundary,
    actionName?: string
  ) => {
    const currentValue = rangeRef.current[boundary];
    const currentPosition = boundaryValueToPosition(
      boundary,
      currentValue,
      scaleMinimum,
      scaleMaximum
    );
    const numericSteps = (scaleMaximum - scaleMinimum) / step;
    const numericPositionStep =
      (NUMERIC_SCALE_END_POSITION - NUMERIC_SCALE_START_POSITION) /
      numericSteps;

    let nextPosition =
      currentPosition +
      (actionName === 'decrement' ? -numericPositionStep : numericPositionStep);

    if (boundary === 'min') {
      if (currentValue === null && actionName === 'increment') {
        nextPosition = NUMERIC_SCALE_START_POSITION;
      } else if (currentValue === scaleMinimum && actionName === 'decrement') {
        nextPosition = 0;
      }
    } else if (currentValue === null && actionName === 'decrement') {
      nextPosition = NUMERIC_SCALE_END_POSITION;
    } else if (currentValue === scaleMaximum && actionName === 'increment') {
      nextPosition = 100;
    }

    updateVisualBoundaryPosition(boundary, nextPosition);
    commitBoundaryPosition(boundary);
  };

  const animatedMinLeft = minPosition.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });
  const animatedMaxLeft = maxPosition.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });
  const animatedFillLeft = minPosition.interpolate({
    inputRange: [NUMERIC_SCALE_START_POSITION, NUMERIC_SCALE_END_POSITION],
    outputRange: [
      `${NUMERIC_SCALE_START_POSITION}%`,
      `${NUMERIC_SCALE_END_POSITION}%`,
    ],
    extrapolate: 'clamp',
  });
  const animatedFillRight = maxPosition.interpolate({
    inputRange: [NUMERIC_SCALE_START_POSITION, NUMERIC_SCALE_END_POSITION],
    outputRange: [
      `${100 - NUMERIC_SCALE_START_POSITION}%`,
      `${100 - NUMERIC_SCALE_END_POSITION}%`,
    ],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.SectionCard(theme)}>
      <View style={styles.SectionHeader(theme)}>
        <Text style={styles.SectionTitle(theme)}>{label}</Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${resetLabel}: ${label}`}
          accessibilityState={{ disabled: !canReset }}
          disabled={!canReset}
          onPress={() => onReset(field)}
          style={styles.TextAction(theme, !canReset)}
        >
          <Text style={styles.TextActionLabel(theme, !canReset)}>
            {resetLabel}
          </Text>
        </Pressable>
      </View>

      <View
        testID={`diary-filter-${field}-slider`}
        onLayout={(event) => {
          const width = event.nativeEvent.layout.width;

          trackWidthRef.current = width;
        }}
        style={styles.RangeTrack(theme)}
      >
        <View style={styles.RangeRail(theme, color)} />
        <View style={styles.RangeNullSlot(theme, 'min', color)} />
        <View style={styles.RangeNullSlot(theme, 'max', color)} />
        <Animated.View
          style={[
            styles.RangeFill(theme, color),
            { left: animatedFillLeft, right: animatedFillRight },
          ]}
        />

        <Animated.View
          accessibilityRole="adjustable"
          accessibilityLabel={`${label}: ${fromLabel}`}
          accessibilityValue={{
            ...(range.min === null
              ? { text: nullLabel }
              : {
                  min: scaleMinimum,
                  max: scaleMaximum,
                  now: clamp(range.min, scaleMinimum, scaleMaximum),
                }),
          }}
          accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
          onAccessibilityAction={(event) =>
            handleAccessibilityAction('min', event.nativeEvent.actionName)
          }
          style={[styles.RangeThumb(theme, color), { left: animatedMinLeft }]}
          {...minResponder.panHandlers}
        />

        <Animated.View
          accessibilityRole="adjustable"
          accessibilityLabel={`${label}: ${toLabel}`}
          accessibilityValue={{
            ...(range.max === null
              ? { text: nullLabel }
              : {
                  min: scaleMinimum,
                  max: scaleMaximum,
                  now: clamp(range.max, scaleMinimum, scaleMaximum),
                }),
          }}
          accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
          onAccessibilityAction={(event) =>
            handleAccessibilityAction('max', event.nativeEvent.actionName)
          }
          style={[styles.RangeThumb(theme, color), { left: animatedMaxLeft }]}
          {...maxResponder.panHandlers}
        />

        {dragPreview !== null &&
          dragPreview.value !== null &&
          dragPreview.value !== 0 && (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.RangeValueBubble(theme, color),
                {
                  left:
                    dragPreview.boundary === 'min'
                      ? animatedMinLeft
                      : animatedMaxLeft,
                },
              ]}
            >
              <Text style={styles.RangeValueBubbleText(theme)}>
                {dragPreview.value}
              </Text>
            </Animated.View>
          )}
      </View>

      <View style={styles.RangeScale(theme)}>
        <Text style={styles.RangeScaleText(theme, 0)}>{'−∞'}</Text>
        <Text
          style={styles.RangeScaleText(theme, NUMERIC_SCALE_START_POSITION)}
        >
          {scaleMinimum}
        </Text>
        <Text style={styles.RangeScaleText(theme, NUMERIC_SCALE_END_POSITION)}>
          {scaleMaximum}
        </Text>
        <Text style={styles.RangeScaleText(theme, 100)}>{'∞'}</Text>
      </View>

      <View style={styles.RangeInputs(theme)}>
        <View style={styles.RangeInputColumn(theme)}>
          <Text style={styles.FieldLabel(theme)}>{fromLabel}</Text>
          <TextInput
            accessibilityLabel={`${label}: ${fromLabel}`}
            keyboardType="decimal-pad"
            inputMode="decimal"
            value={minText}
            placeholder={String(scaleMinimum)}
            placeholderTextColor={theme.colors.muted}
            onChangeText={(text) => onTextChange(field, 'min', text)}
            style={styles.RangeInput(theme, invalid)}
          />
        </View>

        <View style={styles.RangeInputColumn(theme)}>
          <Text style={styles.FieldLabel(theme)}>{toLabel}</Text>
          <TextInput
            accessibilityLabel={`${label}: ${toLabel}`}
            keyboardType="decimal-pad"
            inputMode="decimal"
            value={maxText}
            placeholder={String(scaleMaximum)}
            placeholderTextColor={theme.colors.muted}
            onChangeText={(text) => onTextChange(field, 'max', text)}
            style={styles.RangeInput(theme, invalid)}
          />
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${resetLabel}: ${label}`}
          accessibilityState={{ disabled: !canReset }}
          disabled={!canReset}
          onPress={() => onReset(field)}
          style={styles.RangeResetButton(theme, !canReset)}
        >
          <Ionicons
            name="refresh"
            size={theme.size.md}
            color={canReset ? theme.colors.text : theme.colors.muted}
          />
        </Pressable>
      </View>

      {invalid && <Text style={styles.ErrorText(theme)}>{errorText}</Text>}
    </View>
  );
};

type PresenceSwitchProps = {
  label: string;
  value: DiaryFilterPresence;
  labels: Record<DiaryFilterPresence, string>;
  onChange: (value: DiaryFilterPresence) => void;
};

const PresenceSwitch = ({
  label,
  value,
  labels,
  onChange,
}: PresenceSwitchProps) => {
  const theme = useTheme();

  return (
    <View style={styles.SectionCard(theme)}>
      <Text style={styles.SectionTitleWithGap(theme)}>{label}</Text>

      <View style={styles.PresenceSwitch(theme)}>
        {DIARY_FILTER_PRESENCE_VALUES.map((option) => {
          const selected = option === value;

          return (
            <Pressable
              key={option}
              accessibilityRole="radio"
              accessibilityLabel={`${label}: ${labels[option]}`}
              accessibilityState={{ checked: selected }}
              onPress={() => onChange(option)}
              style={styles.PresenceOption(theme, selected)}
            >
              <Text style={styles.PresenceOptionText(theme, selected)}>
                {labels[option]}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const DiaryFiltersModal = () => {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const [mealRelationsOpened, setMealRelationsOpened] = useState(false);

  const {
    visible,
    draftFilters,
    numericText,
    markedDates,
    calendarCurrent,
    rangesValid,
    canClear,
    canApply,
    isApplied,
    handleClose,
    handleApply,
    handleClear,
    handleDayPress,
    handleClearDates,
    handleClearDateBoundary,
    handleActiveBoundaryChange,
    handleNumericTextChange,
    handleNumericRangeChange,
    handleResetNumericRange,
    handleToggleMealRelation,
    handlePresenceChange,
  } = useDiaryFilters();

  useEffect(() => {
    if (!visible) {
      setMealRelationsOpened(false);
    }
  }, [visible]);

  const formatDate = (date: string | null): string => {
    if (date === null) {
      return t('diary.filters.notSet');
    }

    return new Intl.DateTimeFormat(i18n.resolvedLanguage ?? i18n.language, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(`${date}T12:00:00`));
  };

  const selectedMealRelationsLabel =
    draftFilters.mealRelations.length === 0
      ? t('diary.filters.mealRelation.placeholder')
      : draftFilters.mealRelations.length === 1
        ? t(`diary.entry.mealRelation.${draftFilters.mealRelations[0]}`)
        : t('diary.filters.mealRelation.selected', {
            count: draftFilters.mealRelations.length,
          });

  const presenceLabels: Record<DiaryFilterPresence, string> = {
    ignore: t('diary.filters.presence.ignore'),
    has: t('diary.filters.presence.has'),
    doesNotHave: t('diary.filters.presence.doesNotHave'),
  };

  const calendarTheme = {
    calendarBackground: theme.colors.card,
    backgroundColor: theme.colors.card,
    dayTextColor: theme.colors.text,
    monthTextColor: theme.colors.text,
    textSectionTitleColor: theme.colors.muted,
    selectedDayBackgroundColor: theme.colors.primary,
    selectedDayTextColor: theme.colors.white,
    todayTextColor: theme.colors.primary,
    arrowColor: theme.colors.primary,
    textDisabledColor: theme.colors.muted,
  };

  const renderDateBoundary = (
    boundary: DiaryFilterDateBoundary,
    label: string,
    value: string | null
  ) => {
    const active = draftFilters.date.activeBoundary === boundary;

    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ selected: active }}
        onPress={() => handleActiveBoundaryChange(boundary)}
        style={styles.DateBoundary(theme, active)}
      >
        <View style={styles.DateBoundaryContent(theme)}>
          <Text style={styles.DateBoundaryLabel(theme)}>{label}</Text>
          <Text style={styles.DateBoundaryValue(theme)}>
            {formatDate(value)}
          </Text>
        </View>

        {value !== null && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('diary.filters.date.clearBoundary', {
              boundary: label,
            })}
            onPress={() => handleClearDateBoundary(boundary)}
            hitSlop={8}
            style={styles.ClearBoundaryButton(theme)}
          >
            <Ionicons
              name="close-circle"
              size={theme.size.md}
              color={theme.colors.muted}
            />
          </Pressable>
        )}
      </Pressable>
    );
  };

  const numericBlocks: Array<{
    field: DiaryFilterNumericField;
    label: string;
    scaleMaximum: number;
    step: number;
    color: string;
  }> = [
    {
      field: 'glucose',
      label: t('diary.entry.metrics.glucose'),
      scaleMaximum: 40,
      step: 0.1,
      color: '#ff6b67',
    },
    {
      field: 'shortInsulin',
      label: t('diary.entry.metrics.shortInsulin'),
      scaleMaximum: 30,
      step: 1,
      color: '#4b96ff',
    },
    {
      field: 'longInsulin',
      label: t('diary.entry.metrics.longInsulin'),
      scaleMaximum: 60,
      step: 1,
      color: '#9b6cff',
    },
    {
      field: 'carbsGram',
      label: t('diary.entry.metrics.carbohydrates'),
      scaleMaximum: 100,
      step: 1,
      color: '#70d667',
    },
  ];

  const dateResetDisabled =
    draftFilters.date.from === null && draftFilters.date.to === null;

  return (
    <PortalModal
      visible={visible}
      onClose={handleClose}
      withoutScroll
      withoutCloseBtn
    >
      <View style={styles.Root}>
        <View style={styles.Header(theme)}>
          <Text style={styles.Title(theme)}>{t('diary.filters.title')}</Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('diary.filters.closeAccessibilityLabel')}
            onPress={handleClose}
            style={globalStyles.IconButton(theme, 'ghost', 'sm')}
          >
            <Ionicons
              name="close"
              size={theme.size.md}
              color={theme.colors.text}
            />
          </Pressable>
        </View>

        <ScrollView
          testID="diary-filters-scroll"
          style={styles.Scroll}
          contentContainerStyle={styles.Content(theme)}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.SectionCard(theme)}>
            <View style={styles.SectionHeader(theme)}>
              <Text style={styles.SectionTitle(theme)}>
                {t('diary.filters.date.title')}
              </Text>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('diary.filters.date.reset')}
                accessibilityState={{ disabled: dateResetDisabled }}
                disabled={dateResetDisabled}
                onPress={handleClearDates}
                style={styles.TextAction(theme, dateResetDisabled)}
              >
                <Text style={styles.TextActionLabel(theme, dateResetDisabled)}>
                  {t('diary.filters.reset')}
                </Text>
              </Pressable>
            </View>

            <View style={styles.DateBoundaries(theme)}>
              {renderDateBoundary(
                'from',
                t('diary.filters.date.from'),
                draftFilters.date.from
              )}
              {renderDateBoundary(
                'to',
                t('diary.filters.date.to'),
                draftFilters.date.to
              )}
            </View>

            <Calendar
              markingType="period"
              enableSwipeMonths
              firstDay={1}
              current={calendarCurrent}
              markedDates={markedDates}
              onDayPress={(day: DateData) => handleDayPress(day)}
              theme={calendarTheme}
            />
          </View>

          {numericBlocks.map(({ field, label, scaleMaximum, step, color }) => (
            <NumericRangeBlock
              key={field}
              field={field}
              label={label}
              range={draftFilters[field]}
              minText={numericText[field].min}
              maxText={numericText[field].max}
              scaleMinimum={0}
              scaleMaximum={scaleMaximum}
              step={step}
              color={color}
              errorText={t('diary.filters.range.invalid')}
              fromLabel={t('diary.filters.range.from')}
              toLabel={t('diary.filters.range.to')}
              nullLabel={t('diary.filters.range.null')}
              resetLabel={t('diary.filters.reset')}
              onTextChange={handleNumericTextChange}
              onRangeChange={handleNumericRangeChange}
              onReset={handleResetNumericRange}
            />
          ))}

          <View style={styles.SectionCard(theme)}>
            <Text style={styles.SectionTitleWithGap(theme)}>
              {t('diary.filters.mealRelation.title')}
            </Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t(
                'diary.filters.mealRelation.accessibilityLabel'
              )}
              accessibilityState={{ expanded: mealRelationsOpened }}
              onPress={() => setMealRelationsOpened((opened) => !opened)}
              style={styles.DropdownField(theme, mealRelationsOpened)}
            >
              <Text style={styles.DropdownFieldText(theme)} numberOfLines={1}>
                {selectedMealRelationsLabel}
              </Text>
              <Ionicons
                name={mealRelationsOpened ? 'chevron-up' : 'chevron-down'}
                size={theme.size.md}
                color={theme.colors.muted}
              />
            </Pressable>

            {mealRelationsOpened && (
              <View style={styles.CheckList(theme)}>
                {MEAL_RELATIONS.map((mealRelation: MealRelation) => {
                  const selected =
                    draftFilters.mealRelations.includes(mealRelation);

                  return (
                    <Pressable
                      key={mealRelation}
                      accessibilityRole="checkbox"
                      accessibilityLabel={t(
                        `diary.entry.mealRelation.${mealRelation}`
                      )}
                      accessibilityState={{ checked: selected }}
                      onPress={() => handleToggleMealRelation(mealRelation)}
                      style={styles.CheckRow(theme)}
                    >
                      <View style={styles.Checkbox(theme, selected)}>
                        {selected && (
                          <Ionicons
                            name="checkmark"
                            size={theme.size.base}
                            color={theme.colors.white}
                          />
                        )}
                      </View>
                      <Text style={styles.CheckLabel(theme)}>
                        {t(`diary.entry.mealRelation.${mealRelation}`)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>

          <PresenceSwitch
            label={t('diary.filters.photo')}
            value={draftFilters.photo}
            labels={presenceLabels}
            onChange={(value) => handlePresenceChange('photo', value)}
          />

          <PresenceSwitch
            label={t('diary.filters.aiAnalysis')}
            value={draftFilters.aiAnalysis}
            labels={presenceLabels}
            onChange={(value) => handlePresenceChange('aiAnalysis', value)}
          />

          {!rangesValid && (
            <Text style={styles.ApplyError(theme)}>
              {t('diary.filters.range.fixBeforeApply')}
            </Text>
          )}
        </ScrollView>

        <View style={styles.Footer(theme)}>
          <Button
            accessibilityRole="button"
            accessibilityLabel={t('diary.filters.clear')}
            accessibilityState={{ disabled: !canClear }}
            disabled={!canClear}
            onPress={handleClear}
            style={[
              styles.FooterAction(!canClear),
              globalStyles.Button(theme, 'secondary', !canClear),
            ]}
          >
            <Text
              style={globalStyles.ButtonText(theme, 'secondary', !canClear)}
            >
              {t('diary.filters.clear')}
            </Text>
          </Button>

          <Button
            accessibilityRole="button"
            accessibilityLabel={t(
              isApplied ? 'diary.filters.applied' : 'diary.filters.apply'
            )}
            accessibilityState={{ disabled: !canApply }}
            disabled={!canApply}
            onPress={handleApply}
            style={[
              styles.FooterAction(!canApply),
              globalStyles.Button(
                theme,
                isApplied ? 'secondary' : 'primary',
                !canApply
              ),
            ]}
          >
            <View style={styles.ApplyButtonContent(theme)}>
              {isApplied && (
                <Ionicons
                  name="checkmark"
                  size={theme.size.base}
                  color={theme.colors.muted}
                />
              )}
              <Text
                style={globalStyles.ButtonText(
                  theme,
                  isApplied ? 'secondary' : 'primary',
                  !canApply
                )}
              >
                {t(isApplied ? 'diary.filters.applied' : 'diary.filters.apply')}
              </Text>
            </View>
          </Button>
        </View>
      </View>
    </PortalModal>
  );
};

export default DiaryFiltersModal;
