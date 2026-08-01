import { fireEvent, render, screen } from '@testing-library/react-native';

import DiaryPagination from '../DiaryPagination';

const mockTheme = {
  colors: {
    primary: '#0057ff',
    text: '#111111',
    muted: '#777777',
  },
  size: {
    md: 16,
  },
};

jest.mock('@emotion/react', () => ({
  useTheme: () => mockTheme,
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));

jest.mock('@features/shared/styles/global', () => {
  const emptyStyle = () => ({});

  return {
    IconButton: emptyStyle,
    Row: emptyStyle,
    Text: emptyStyle,
  };
});

const defaultProps = {
  currentPage: 1,
  totalPages: 1,
  loading: false,
  previousPageAccessibilityLabel: 'Previous page',
  nextPageAccessibilityLabel: 'Next page',
  onChangePage: jest.fn(),
};

describe('DiaryPagination', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('is hidden when there is no second page', () => {
    const view = render(<DiaryPagination {...defaultProps} />);

    expect(view.toJSON()).toBeNull();
  });

  it('renders first, previous, current, next and last pages', () => {
    const onChangePage = jest.fn();

    render(
      <DiaryPagination
        {...defaultProps}
        currentPage={6}
        totalPages={122}
        onChangePage={onChangePage}
      />
    );

    expect(screen.getByLabelText('1')).toBeTruthy();
    expect(screen.getByLabelText('5')).toBeTruthy();
    expect(screen.getByLabelText('6')).toBeTruthy();
    expect(screen.getByLabelText('7')).toBeTruthy();
    expect(screen.getByLabelText('122')).toBeTruthy();

    expect(screen.queryByLabelText('2')).toBeNull();
    expect(screen.queryByLabelText('8')).toBeNull();

    expect(screen.getByLabelText('6').props.accessibilityState).toEqual({
      disabled: true,
      selected: true,
    });

    fireEvent.press(screen.getByLabelText('5'));
    fireEvent.press(screen.getByLabelText('Next page'));
    fireEvent.press(screen.getByLabelText('Previous page'));

    expect(onChangePage).toHaveBeenNthCalledWith(1, 5);
    expect(onChangePage).toHaveBeenNthCalledWith(2, 7);
    expect(onChangePage).toHaveBeenNthCalledWith(3, 5);
  });

  it('disables navigation at page boundaries', () => {
    const onChangePage = jest.fn();

    const view = render(
      <DiaryPagination
        {...defaultProps}
        currentPage={1}
        totalPages={3}
        onChangePage={onChangePage}
      />
    );

    const previousButton = screen.getByLabelText('Previous page');

    expect(previousButton.props.accessibilityState).toEqual({
      disabled: true,
    });

    fireEvent.press(previousButton);

    expect(onChangePage).not.toHaveBeenCalled();

    fireEvent.press(screen.getByLabelText('Next page'));

    expect(onChangePage).toHaveBeenCalledWith(2);

    onChangePage.mockClear();

    view.rerender(
      <DiaryPagination
        {...defaultProps}
        currentPage={3}
        totalPages={3}
        onChangePage={onChangePage}
      />
    );

    const nextButton = screen.getByLabelText('Next page');

    expect(nextButton.props.accessibilityState).toEqual({
      disabled: true,
    });

    fireEvent.press(nextButton);

    expect(onChangePage).not.toHaveBeenCalled();
  });

  it('disables every action while loading', () => {
    const onChangePage = jest.fn();

    render(
      <DiaryPagination
        {...defaultProps}
        currentPage={3}
        totalPages={5}
        loading
        onChangePage={onChangePage}
      />
    );

    screen.getAllByRole('button').forEach((button) => {
      expect(button.props.accessibilityState.disabled).toBe(true);

      fireEvent.press(button);
    });

    expect(onChangePage).not.toHaveBeenCalled();
  });
});
