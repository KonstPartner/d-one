import { ActivityIndicator, Modal } from 'react-native';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import type { ReactNode } from 'react';
import {
  fireGestureHandler,
  getByGestureTestId,
} from 'react-native-gesture-handler/jest-utils';

import PhotoViewer from '../PhotoViewer';

const mockTheme = {
  colors: {
    black: '#000000',
    white: '#ffffff',
    whiteAlpha: {
      lg: '#ffffffcc',
    },
  },
  size: {
    xl: 24,
    '2xl': 32,
  },
};

jest.mock('@emotion/react', () => ({
  useTheme: () => mockTheme,
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('@expo/vector-icons', () => {
  const React = jest.requireActual('react');
  const { View: NativeView } = jest.requireActual('react-native');

  return {
    Ionicons: ({ name }: { name: string }) =>
      React.createElement(NativeView, {
        testID: `icon-${name}`,
      }),
  };
});

jest.mock('expo-image', () => {
  const React = jest.requireActual('react');
  const { View: NativeView } = jest.requireActual('react-native');

  return {
    Image: (props: Record<string, unknown>) =>
      React.createElement(NativeView, props),
  };
});

jest.mock('react-native-safe-area-context', () => {
  const React = jest.requireActual('react');
  const { View: NativeView } = jest.requireActual('react-native');

  return {
    SafeAreaView: ({ children }: { children: ReactNode }) =>
      React.createElement(NativeView, null, children),
  };
});

jest.mock('../../styles/PhotoViewer', () => ({
  Root: () => ({}),
  Viewport: {},
  ImageFrame: {},
  UnmeasuredImageFrame: {},
  Image: {},
  StateOverlay: {},
  StateText: () => ({}),
  Controls: () => ({}),
  CloseButton: () => ({}),
  HintArea: () => ({}),
  HintText: () => ({}),
  Pressed: {},
}));

const makeProps = () => ({
  visible: true,
  sourceUri: 'https://example.com/photo.jpg',
  sourceKey: 'https://example.com/photo.jpg',
  sourceIsLocal: false,
  recyclingKey: 'entry-1',
  loading: false,
  fallbackText: null,
  accessibilityLabel: 'Diary photo',
  onLoadStart: jest.fn(),
  onLoad: jest.fn(),
  onError: jest.fn(),
  onClose: jest.fn(),
});

const loadImage = () => {
  fireEvent(screen.getByTestId('photo-viewer-viewport'), 'layout', {
    nativeEvent: {
      layout: {
        x: 0,
        y: 0,
        width: 300,
        height: 200,
      },
    },
  });

  fireEvent(screen.getByTestId('photo-viewer-image'), 'load', {
    source: {
      width: 600,
      height: 400,
    },
  });
};

const finishAnimations = () => {
  act(() => {
    jest.runAllTimers();
  });
};

const getEnabledGesture = async (testId: string) => {
  let gesture = getByGestureTestId(testId);

  await waitFor(() => {
    gesture = getByGestureTestId(testId);

    expect(gesture.config.enabled).toBe(true);
  });

  return gesture;
};

describe('PhotoViewer integration', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('renders configured image and forwards load events', () => {
    const props = makeProps();

    render(<PhotoViewer {...props} />);

    const image = screen.getByTestId('photo-viewer-image');

    expect(image.props).toEqual(
      expect.objectContaining({
        source: {
          uri: props.sourceUri,
          cacheKey: props.sourceKey,
        },
        contentFit: 'contain',
        cachePolicy: 'memory-disk',
        priority: 'high',
        recyclingKey: `${props.recyclingKey}:${props.sourceKey}`,
        transition: 150,
        accessibilityLabel: props.accessibilityLabel,
      })
    );

    fireEvent(image, 'loadStart');

    expect(props.onLoadStart).toHaveBeenCalledTimes(1);

    loadImage();
    finishAnimations();

    expect(props.onLoad).toHaveBeenCalledTimes(1);

    fireEvent(image, 'error');

    expect(props.onError).toHaveBeenCalledTimes(1);
  });

  it('supports pinch, bounded pan and double-tap reset', async () => {
    render(<PhotoViewer {...makeProps()} />);

    loadImage();
    finishAnimations();

    const frame = screen.getByTestId('photo-viewer-image-frame');

    const pinchGesture = await getEnabledGesture('photo-viewer-pinch');

    fireGestureHandler(pinchGesture, [
      {
        scale: 1,
        focalX: 150,
        focalY: 100,
        numberOfPointers: 2,
      },
      {
        scale: 10,
        focalX: 150,
        focalY: 100,
        numberOfPointers: 2,
      },
    ]);

    finishAnimations();

    expect(frame).toHaveAnimatedStyle({
      transform: [{ translateX: 0 }, { translateY: 0 }, { scale: 4 }],
    });

    const doubleTapGesture = await getEnabledGesture('photo-viewer-double-tap');

    fireGestureHandler(doubleTapGesture, [
      {
        x: 150,
        y: 100,
        numberOfPointers: 1,
      },
    ]);

    finishAnimations();

    expect(frame).toHaveAnimatedStyle({
      transform: [{ translateX: 0 }, { translateY: 0 }, { scale: 1 }],
    });

    fireGestureHandler(doubleTapGesture, [
      {
        x: 150,
        y: 100,
        numberOfPointers: 1,
      },
    ]);

    finishAnimations();

    expect(frame).toHaveAnimatedStyle({
      transform: [{ translateX: 0 }, { translateY: 0 }, { scale: 2.5 }],
    });

    const panGesture = await getEnabledGesture('photo-viewer-pan');

    fireGestureHandler(panGesture, [
      {
        translationX: 0,
        translationY: 0,
        numberOfPointers: 1,
      },
      {
        translationX: 500,
        translationY: -500,
        numberOfPointers: 1,
      },
    ]);

    finishAnimations();

    expect(frame).toHaveAnimatedStyle({
      transform: [{ translateX: 225 }, { translateY: -150 }, { scale: 2.5 }],
    });

    fireGestureHandler(doubleTapGesture, [
      {
        x: 150,
        y: 100,
        numberOfPointers: 1,
      },
    ]);

    finishAnimations();

    expect(frame).toHaveAnimatedStyle({
      transform: [{ translateX: 0 }, { translateY: 0 }, { scale: 1 }],
    });
  });

  it('resets zoom when source changes', async () => {
    const props = makeProps();

    const view = render(<PhotoViewer {...props} />);

    loadImage();
    finishAnimations();

    const frame = screen.getByTestId('photo-viewer-image-frame');

    const doubleTapGesture = await getEnabledGesture('photo-viewer-double-tap');

    fireGestureHandler(doubleTapGesture, [
      {
        x: 150,
        y: 100,
        numberOfPointers: 1,
      },
    ]);

    finishAnimations();

    expect(frame).toHaveAnimatedStyle({
      transform: [{ translateX: 0 }, { translateY: 0 }, { scale: 2.5 }],
    });

    view.rerender(
      <PhotoViewer
        {...props}
        sourceUri="https://example.com/second.jpg"
        sourceKey="https://example.com/second.jpg"
        recyclingKey="entry-2"
      />
    );

    expect(frame).toHaveAnimatedStyle({
      transform: [{ translateX: 0 }, { translateY: 0 }, { scale: 1 }],
    });
  });

  it('renders fallback and loading states', () => {
    const props = makeProps();

    const view = render(
      <PhotoViewer
        {...props}
        sourceUri={null}
        fallbackText="Photo unavailable"
        fallbackIcon="cloud-offline-outline"
      />
    );

    expect(screen.queryByTestId('photo-viewer-image')).toBeNull();

    expect(screen.getByText('Photo unavailable')).toBeTruthy();

    expect(screen.getByTestId('icon-cloud-offline-outline')).toBeTruthy();

    view.rerender(<PhotoViewer {...props} loading />);

    expect(screen.UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
  });

  it('closes through button, Android Back and accessibility escape', () => {
    const props = makeProps();

    render(<PhotoViewer {...props} />);

    fireEvent.press(screen.getByLabelText('common.close'));

    expect(props.onClose).toHaveBeenCalledTimes(1);

    act(() => {
      screen.UNSAFE_getByType(Modal).props.onRequestClose();
    });

    expect(props.onClose).toHaveBeenCalledTimes(2);

    fireEvent(screen.getByTestId('photo-viewer-root'), 'accessibilityEscape');

    expect(props.onClose).toHaveBeenCalledTimes(3);
  });
});
