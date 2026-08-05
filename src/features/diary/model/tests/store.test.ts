import { useDiaryListStore } from '../store';
import { areDiaryFiltersEqual, createDefaultDiaryFilters } from '../types';

describe('useDiaryListStore', () => {
  beforeEach(() => {
    useDiaryListStore.getState().resetListState();
  });

  it('uses the first page, expanded days and empty filters initially', () => {
    const state = useDiaryListStore.getState();
    const defaultFilters = createDefaultDiaryFilters();

    expect(state.currentPage).toBe(1);
    expect(state.collapsedDayKeys).toEqual(new Set());
    expect(state.filterModalVisible).toBe(false);
    expect(state.draftFilters).toEqual(defaultFilters);
    expect(state.appliedFilters).toEqual(defaultFilters);
    expect(state.draftFilters).not.toBe(state.appliedFilters);
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

  it('opens with an applied snapshot and discards unapplied changes on close', () => {
    useDiaryListStore.getState().openFilterModal();
    useDiaryListStore.getState().setFilterPresence('photo', 'has');
    useDiaryListStore.getState().toggleFilterMealRelation('beforeMeal');

    expect(useDiaryListStore.getState().draftFilters.photo).toBe('has');
    expect(useDiaryListStore.getState().appliedFilters.photo).toBe('ignore');

    useDiaryListStore.getState().closeFilterModal();

    const state = useDiaryListStore.getState();

    expect(state.filterModalVisible).toBe(false);
    expect(state.draftFilters).toEqual(state.appliedFilters);
    expect(state.draftFilters).not.toBe(state.appliedFilters);
  });

  it('switches to the end boundary and normalizes reversed dates', () => {
    useDiaryListStore.getState().setFilterDate('from', '2026-08-05');

    expect(useDiaryListStore.getState().draftFilters.date).toEqual({
      from: '2026-08-05',
      to: null,
      activeBoundary: 'to',
    });

    useDiaryListStore.getState().setFilterDate('to', '2026-08-01');

    expect(useDiaryListStore.getState().draftFilters.date).toEqual({
      from: '2026-08-01',
      to: '2026-08-05',
      activeBoundary: 'to',
    });
  });

  it('normalizes meal relations and removes a toggled value', () => {
    useDiaryListStore.getState().toggleFilterMealRelation('night');
    useDiaryListStore.getState().toggleFilterMealRelation('beforeMeal');

    expect(useDiaryListStore.getState().draftFilters.mealRelations).toEqual([
      'beforeMeal',
      'night',
    ]);

    useDiaryListStore.getState().toggleFilterMealRelation('beforeMeal');

    expect(useDiaryListStore.getState().draftFilters.mealRelations).toEqual([
      'night',
    ]);
  });

  it('clears only the draft until the cleared state is applied', () => {
    useDiaryListStore.getState().setFilterPresence('aiAnalysis', 'has');
    useDiaryListStore.getState().applyFilterDraft();
    useDiaryListStore.getState().setFilterPresence('photo', 'has');

    useDiaryListStore.getState().clearFilterDraft();

    let state = useDiaryListStore.getState();

    expect(state.draftFilters).toEqual(createDefaultDiaryFilters());
    expect(state.appliedFilters.aiAnalysis).toBe('has');

    useDiaryListStore.getState().applyFilterDraft();

    state = useDiaryListStore.getState();

    expect(state.appliedFilters).toEqual(createDefaultDiaryFilters());
  });

  it('applies a normalized snapshot, resets pagination and keeps the modal open', () => {
    useDiaryListStore.getState().openFilterModal();
    useDiaryListStore.getState().setCurrentPage(3);
    useDiaryListStore.getState().collapseAllDays(['2026-08-05']);
    useDiaryListStore
      .getState()
      .setFilterNumericRange('glucose', { min: 5.2, max: 8.4 });
    useDiaryListStore.getState().toggleFilterMealRelation('afterMeal');
    useDiaryListStore.getState().toggleFilterMealRelation('beforeMeal');
    useDiaryListStore.getState().setFilterPresence('photo', 'has');

    useDiaryListStore.getState().applyFilterDraft();

    const state = useDiaryListStore.getState();

    expect(state.currentPage).toBe(1);
    expect(state.collapsedDayKeys).toEqual(new Set());
    expect(state.filterModalVisible).toBe(true);
    expect(state.appliedFilters).toEqual({
      ...createDefaultDiaryFilters(),
      glucose: {
        min: 5.2,
        max: 8.4,
      },
      mealRelations: ['beforeMeal', 'afterMeal'],
      photo: 'has',
    });
    expect(state.draftFilters).toEqual(state.appliedFilters);
    expect(state.draftFilters).not.toBe(state.appliedFilters);
    expect(areDiaryFiltersEqual(state.draftFilters, state.appliedFilters)).toBe(
      true
    );
  });

  it('rejects an invalid numeric range without changing applied filters', () => {
    useDiaryListStore.getState().setCurrentPage(2);
    useDiaryListStore
      .getState()
      .setFilterNumericRange('shortInsulin', { min: 12, max: 4 });

    const previousAppliedFilters = useDiaryListStore.getState().appliedFilters;

    expect(() => {
      useDiaryListStore.getState().applyFilterDraft();
    }).toThrow('Invalid diary filter range');

    const state = useDiaryListStore.getState();

    expect(state.currentPage).toBe(2);
    expect(state.appliedFilters).toBe(previousAppliedFilters);
  });

  it('resets the complete list and filter state', () => {
    useDiaryListStore.getState().openFilterModal();
    useDiaryListStore.getState().setCurrentPage(3);
    useDiaryListStore.getState().collapseAllDays(['2026-07-31']);
    useDiaryListStore.getState().setFilterPresence('photo', 'has');
    useDiaryListStore.getState().applyFilterDraft();

    useDiaryListStore.getState().resetListState();

    const state = useDiaryListStore.getState();
    const defaultFilters = createDefaultDiaryFilters();

    expect(state.currentPage).toBe(1);
    expect(state.collapsedDayKeys).toEqual(new Set());
    expect(state.filterModalVisible).toBe(false);
    expect(state.draftFilters).toEqual(defaultFilters);
    expect(state.appliedFilters).toEqual(defaultFilters);
  });
});
