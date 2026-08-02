import { fireEvent, render, screen } from '@testing-library/react-native';
import type { ReactElement, ReactNode } from 'react';

import Diary from '@pages/Diary';

import type { DiaryEntry } from '../../model';

const mockUseAuthData = jest.fn();

const mockTheme = {
  colors: {
    text: '#111111',
    muted: '#777777',
    success: '#008000',
    warning: '#ff9900',
    white: '#ffffff',
  },
  size: {
    md: 16,
    lg: 20,
    xl: 24,
  },
};

type ChildrenProps = {
  children: ReactNode;
};

type LocalDiaryContentProps = {
  renderEntry: (entry: DiaryEntry, isVisible: boolean) => ReactElement;
};

type PhotoViewerProps = {
  visible: boolean;
  sourceUri: string | null;
  onClose: () => void;
};

jest.mock('@emotion/react', () => ({
  useTheme: () => mockTheme,
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      language: 'en',
      resolvedLanguage: 'en',
    },
  }),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));

jest.mock('@expo/vector-icons/Ionicons', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('expo-image', () => {
  const React = jest.requireActual('react');
  const { View: NativeView } = jest.requireActual('react-native');

  return {
    Image: (props: Record<string, unknown>) =>
      React.createElement(NativeView, {
        ...props,
        testID: 'diary-entry-image',
      }),
  };
});

jest.mock('@features/auth/api', () => ({
  useAuthData: () => mockUseAuthData(),
}));

jest.mock('@features/auth/model', () => ({
  UserRole: {
    User: 'user',
    Follower: 'follower',
  },
}));

jest.mock('@features/network/model', () => ({
  useNetwork: () => ({
    isOnline: true,
    isOffline: false,
  }),
}));

jest.mock('@features/shared/model', () => ({
  PlatformOS: {
    WEB: false,
  },
  dateKit: {
    relativeDateTimeLabel: () => 'date',
  },
}));

jest.mock('@features/shared/ui', () => {
  const React = jest.requireActual('react');
  const {
    Pressable: NativePressable,
    Text: NativeText,
    View: NativeView,
  } = jest.requireActual('react-native');

  return {
    showNotification: jest.fn(),

    PhotoViewer: ({ visible, sourceUri, onClose }: PhotoViewerProps) =>
      React.createElement(
        NativeView,
        null,
        React.createElement(
          NativeText,
          {
            testID: 'viewer-state',
          },
          `${String(visible)}:${sourceUri ?? 'none'}`
        ),
        React.createElement(
          NativePressable,
          {
            accessibilityRole: 'button',
            accessibilityLabel: 'close-viewer',
            onPress: onClose,
          },
          React.createElement(NativeText, null, 'close')
        )
      ),
  };
});

jest.mock('@entities/layout/ui', () => {
  const React = jest.requireActual('react');

  return {
    PageWrapper: ({ children }: ChildrenProps) =>
      React.createElement(React.Fragment, null, children),
  };
});

jest.mock('@entities/shared/ui', () => {
  const React = jest.requireActual('react');
  const { Text: NativeText } = jest.requireActual('react-native');

  return {
    Loader: ({ children }: ChildrenProps) =>
      React.createElement(React.Fragment, null, children),

    LoadingView: ({
      loading,
      children,
    }: ChildrenProps & {
      loading: boolean;
    }) =>
      loading
        ? React.createElement(NativeText, null, 'loading')
        : React.createElement(React.Fragment, null, children),
  };
});

jest.mock('@features/diary/ui/DiaryTextModal', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@features/diary/ui', () => {
  const DiaryEntryCard = jest.requireActual(
    '@features/diary/ui/DiaryEntryCard'
  ).default;

  const DiaryPhotoViewer = jest.requireActual(
    '@features/diary/ui/DiaryPhotoViewer'
  ).default;

  return {
    DiaryEntryCard,
    DiaryPhotoViewer,

    LocalDiaryContent: ({ renderEntry }: LocalDiaryContentProps) => {
      const entry: DiaryEntry = {
        id: 'entry-1',
        userId: 'user-1',
        glucose: null,
        mealRelation: null,
        shortInsulin: null,
        longInsulin: null,
        carbsGram: null,
        comment: '',
        aiAnalysis: '',
        localPhotoUri: null,
        photoPath: 'users/user-1/entry-1.jpg',
        photoUrl: 'https://example.com/entry-1.jpg',
        eventAt: new Date('2026-08-01T12:00:00.000Z'),
        syncStatus: 'synced',
      };

      return renderEntry(entry, true);
    },
  };
});

jest.mock('@features/diary/styles/Diary', () => ({
  UnsupportedContent: () => ({}),
  CenteredText: {},
}));

jest.mock('@features/diary/styles/DiaryEntryCard', () => ({
  Card: () => ({}),
  Header: () => ({}),
  MealRelation: () => ({}),
  Metrics: () => ({}),
  Metric: () => ({}),
  Status: () => ({}),
  Pressed: {},
}));

jest.mock('@features/diary/styles/DiaryEntryPhoto', () => ({
  Frame: () => ({}),
  Image: {},
  CenteredOverlay: () => ({}),
  FallbackText: () => ({}),
  Indicator: () => ({}),
  Pressed: {},
}));

jest.mock('@features/shared/styles/global', () => {
  const emptyStyle = () => ({});

  return {
    Body: emptyStyle,
    Caption: emptyStyle,
    Divider: emptyStyle,
    Heading: emptyStyle,
    Subheading: emptyStyle,
    Text: emptyStyle,
    FlexItem: {},
  };
});

describe('Diary photo viewer integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseAuthData.mockReturnValue({
      authData: {
        role: 'user',
      },
      isAuthLoading: false,
    });
  });

  it('passes visibility, opens cloud photo and closes viewer', () => {
    render(<Diary />);

    expect(screen.getByTestId('diary-entry-image').props.source).toBe(
      'https://example.com/entry-1.jpg'
    );

    expect(screen.getByTestId('viewer-state').props.children).toBe(
      'false:none'
    );

    fireEvent.press(
      screen.getByLabelText('diary.entry.photo.openAccessibilityLabel'),
      {
        stopPropagation: jest.fn(),
      }
    );

    expect(screen.getByTestId('viewer-state').props.children).toBe(
      'true:https://example.com/entry-1.jpg'
    );

    fireEvent.press(screen.getByLabelText('close-viewer'));

    expect(screen.getByTestId('viewer-state').props.children).toBe(
      'false:none'
    );
  });
});
