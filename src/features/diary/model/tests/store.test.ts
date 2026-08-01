import { useDiaryListStore } from '../store';

describe('useDiaryListStore', () => {
  beforeEach(() => {
    useDiaryListStore.setState({
      currentPage: 1,
      collapsedDayKeys: new Set(),
    });
  });

  it('uses the first page and expanded days initially', () => {
    const state = useDiaryListStore.getState();

    expect(state.currentPage).toBe(1);
    expect(state.collapsedDayKeys).toEqual(new Set());
  });

  it('collapses and expands one day', () => {
    const initialSet = useDiaryListStore.getState().collapsedDayKeys;

    useDiaryListStore.getState().toggleDay('2026-07-31');

    const collapsedSet = useDiaryListStore.getState().collapsedDayKeys;

    expect(collapsedSet).not.toBe(initialSet);
    expect(collapsedSet).toEqual(new Set(['2026-07-31']));

    useDiaryListStore.getState().toggleDay('2026-07-31');

    expect(useDiaryListStore.getState().collapsedDayKeys).toEqual(new Set());
  });

  it('collapses all supplied days without duplicates', () => {
    useDiaryListStore
      .getState()
      .collapseAllDays(['2026-07-31', '2026-07-30', '2026-07-31']);

    expect(useDiaryListStore.getState().collapsedDayKeys).toEqual(
      new Set(['2026-07-31', '2026-07-30'])
    );
  });

  it('expands all days', () => {
    useDiaryListStore.getState().collapseAllDays(['2026-07-31', '2026-07-30']);

    useDiaryListStore.getState().expandAllDays();

    expect(useDiaryListStore.getState().collapsedDayKeys).toEqual(new Set());
  });

  it('changes page and clears collapsed days', () => {
    useDiaryListStore.getState().collapseAllDays(['2026-07-31']);

    useDiaryListStore.getState().setCurrentPage(2);

    const state = useDiaryListStore.getState();

    expect(state.currentPage).toBe(2);
    expect(state.collapsedDayKeys).toEqual(new Set());
  });

  it.each([0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY])(
    'rejects invalid page %s',
    (page) => {
      useDiaryListStore.setState({
        currentPage: 2,
        collapsedDayKeys: new Set(['2026-07-31']),
      });

      expect(() => {
        useDiaryListStore.getState().setCurrentPage(page);
      }).toThrow('Invalid diary page');

      const state = useDiaryListStore.getState();

      expect(state.currentPage).toBe(2);
      expect(state.collapsedDayKeys).toEqual(new Set(['2026-07-31']));
    }
  );

  it('resets the complete list state', () => {
    useDiaryListStore.setState({
      currentPage: 3,
      collapsedDayKeys: new Set(['2026-07-31']),
    });

    useDiaryListStore.getState().resetListState();

    const state = useDiaryListStore.getState();

    expect(state.currentPage).toBe(1);
    expect(state.collapsedDayKeys).toEqual(new Set());
  });
});
