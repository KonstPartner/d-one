import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, useWindowDimensions } from 'react-native';
import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Image as SvgImage, Rect } from 'react-native-svg';

import * as ss from '@shared/styles';

import * as s from './styles';
import type { PhotoRedactorSource, usePhotoRedactor } from './usePhotoRedactor';

type PhotoRedactorController = ReturnType<typeof usePhotoRedactor>;

type PhotoRedactorContentProps = {
  source: PhotoRedactorSource | null;

  isSaving: boolean;

  redactor: PhotoRedactorController;

  onCancel: () => void;

  onConfirm: () => void | Promise<void>;
};

const MASK_COLOR = '#000000';

export const PhotoRedactorContent = ({
  source,
  isSaving,
  redactor,
  onCancel,
  onConfirm,
}: PhotoRedactorContentProps) => {
  const theme = useTheme();

  const { t } = useTranslation();

  const insets = useSafeAreaInsets();

  const { width, height } = useWindowDimensions();

  const isLandscape = width > height;

  const [infoVisible, setInfoVisible] = useState(false);

  const {
    svgRef,

    masks,
    drawingMask,

    canvasSize,
    canvasStyle,

    imageReady,

    canUndo,
    canExport,

    panHandlers,

    handleViewportLayout,
    handleImageLoad,

    undo,
  } = redactor;

  const undoDisabled = !canUndo || isSaving;

  const confirmDisabled = !canExport || isSaving;

  const verticalLandscapeInset = Math.max(insets.top, insets.bottom);

  useEffect(() => {
    setInfoVisible(false);
  }, [isLandscape, source?.uri]);

  const handleDismissInfo = useCallback((): void => {
    setInfoVisible(false);
  }, []);

  const handleInfoPress = useCallback((): void => {
    setInfoVisible((currentValue) => !currentValue);
  }, []);

  const handleCancel = useCallback((): void => {
    setInfoVisible(false);

    onCancel();
  }, [onCancel]);

  const handleUndo = useCallback((): void => {
    setInfoVisible(false);

    undo();
  }, [undo]);

  const handleConfirm = useCallback((): void => {
    setInfoVisible(false);

    void onConfirm();
  }, [onConfirm]);

  const portraitButtonStyle = [ss.CenterContent, ss.Rounded(theme, 'full')];

  const landscapeButtonStyle = ss.CenterContent;

  const infoBubbleStyle = ss.Rounded(theme, 'lg');

  const infoTextStyle = [
    ss.Text(theme, 'xs', 'medium', 'inverse', 'sm'),
    {
      color: theme.colors.white,
    },
  ];

  const renderCloseButton = (landscape: boolean): ReactNode => {
    const ButtonComponent = landscape
      ? s.LandscapeActionButton
      : s.ActionButton;

    return (
      <ButtonComponent
        $disabled={isSaving}
        disabled={isSaving}
        accessibilityRole="button"
        accessibilityLabel={t('common.cancel')}
        hitSlop={theme.spacing.sm}
        onPress={handleCancel}
        style={landscape ? landscapeButtonStyle : portraitButtonStyle}
      >
        <Ionicons
          name="close"
          size={theme.size.xl}
          color={theme.colors.white}
        />
      </ButtonComponent>
    );
  };

  const renderInfoButton = (landscape: boolean): ReactNode => {
    const ButtonComponent = landscape
      ? s.LandscapeActionButton
      : s.ActionButton;

    return (
      <ButtonComponent
        accessibilityRole="button"
        accessibilityLabel={t('common.photoRedactor.hint')}
        accessibilityState={{
          expanded: infoVisible,
        }}
        hitSlop={theme.spacing.sm}
        onPress={handleInfoPress}
        style={landscape ? landscapeButtonStyle : portraitButtonStyle}
      >
        <Ionicons
          name="information-circle-outline"
          size={theme.size.xl}
          color={theme.colors.white}
        />
      </ButtonComponent>
    );
  };

  const renderUndoButton = (landscape: boolean): ReactNode => {
    const ButtonComponent = landscape
      ? s.LandscapeActionButton
      : s.ActionButton;

    return (
      <ButtonComponent
        $disabled={undoDisabled}
        disabled={undoDisabled}
        accessibilityRole="button"
        accessibilityLabel={t('common.photoRedactor.undo')}
        hitSlop={theme.spacing.sm}
        onPress={handleUndo}
        style={landscape ? landscapeButtonStyle : portraitButtonStyle}
      >
        <Ionicons
          name="arrow-undo"
          size={theme.size.xl}
          color={theme.colors.white}
        />
      </ButtonComponent>
    );
  };

  const renderConfirmButton = (landscape: boolean): ReactNode => {
    const ButtonComponent = landscape
      ? s.LandscapeActionButton
      : s.ActionButton;

    return (
      <ButtonComponent
        $disabled={confirmDisabled}
        disabled={confirmDisabled}
        accessibilityRole="button"
        accessibilityLabel={t('common.photoRedactor.confirm')}
        hitSlop={theme.spacing.sm}
        onPress={handleConfirm}
        style={landscape ? landscapeButtonStyle : portraitButtonStyle}
      >
        <Ionicons
          name="checkmark"
          size={theme.size.xl}
          color={theme.colors.white}
        />
      </ButtonComponent>
    );
  };

  const renderCanvas = (): ReactNode => {
    if (source === null || canvasSize === null) {
      return null;
    }

    return (
      <s.Canvas style={canvasStyle}>
        <Svg
          ref={svgRef}
          width={canvasSize.width}
          height={canvasSize.height}
          viewBox={`0 0 ${source.width} ${source.height}`}
          pointerEvents="none"
        >
          <SvgImage
            href={source.uri}
            x={0}
            y={0}
            width={source.width}
            height={source.height}
            preserveAspectRatio="none"
            onLoad={handleImageLoad}
          />

          {masks.map((mask) => (
            <Rect
              key={mask.id}
              x={mask.x}
              y={mask.y}
              width={mask.width}
              height={mask.height}
              fill={MASK_COLOR}
            />
          ))}

          {drawingMask !== null && (
            <Rect
              x={drawingMask.x}
              y={drawingMask.y}
              width={drawingMask.width}
              height={drawingMask.height}
              fill={MASK_COLOR}
            />
          )}
        </Svg>

        <s.DrawingSurface
          pointerEvents={isSaving ? 'none' : 'auto'}
          {...panHandlers}
        />

        {(!imageReady || isSaving) && (
          <s.StateOverlay pointerEvents="none" style={ss.CenterContent}>
            <ActivityIndicator size="large" color={theme.colors.white} />
          </s.StateOverlay>
        )}
      </s.Canvas>
    );
  };

  const renderInfo = (landscape: boolean): ReactNode => {
    if (!infoVisible) {
      return null;
    }

    const BubbleComponent = landscape
      ? s.LandscapeInfoBubble
      : s.PortraitInfoBubble;

    return (
      <BubbleComponent pointerEvents="none" style={infoBubbleStyle}>
        <s.InfoText style={infoTextStyle}>
          {t('common.photoRedactor.hint')}
        </s.InfoText>
      </BubbleComponent>
    );
  };

  return (
    <s.Root>
      {infoVisible && <s.DismissLayer onPress={handleDismissInfo} />}

      {isLandscape ? (
        <s.LandscapeContent
          style={{
            paddingTop: verticalLandscapeInset,
            paddingRight: insets.right,
            paddingLeft: insets.left,
          }}
        >
          <s.Viewport onLayout={handleViewportLayout}>
            {renderCanvas()}
          </s.Viewport>

          <s.LandscapeControls pointerEvents="box-none">
            {renderCloseButton(true)}

            <s.InfoControl>
              {renderInfoButton(true)}

              {renderInfo(true)}
            </s.InfoControl>

            {renderUndoButton(true)}

            {renderConfirmButton(true)}
          </s.LandscapeControls>
        </s.LandscapeContent>
      ) : (
        <s.SafeArea edges={['top', 'bottom']}>
          <s.PortraitContent>
            <s.PortraitHeader pointerEvents="box-none">
              <s.PortraitActions>{renderCloseButton(false)}</s.PortraitActions>

              <s.PortraitActions>
                <s.InfoControl>
                  {renderInfoButton(false)}

                  {renderInfo(false)}
                </s.InfoControl>

                {renderUndoButton(false)}

                {renderConfirmButton(false)}
              </s.PortraitActions>
            </s.PortraitHeader>

            <s.Viewport
              onLayout={handleViewportLayout}
              style={ss.CenterContent}
            >
              {renderCanvas()}
            </s.Viewport>
          </s.PortraitContent>
        </s.SafeArea>
      )}
    </s.Root>
  );
};
