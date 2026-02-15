import {
  FLOATING_TAB_BAR_HEIGHT,
  FLOATING_TAB_BAR_BOTTOM,
  FLOATING_TAB_BAR_TOTAL_HEIGHT,
  PAGE_BOTTOM_PADDING,
  PAGE_TOP_PADDING,
} from '@/constants/layout';

describe('layout constants', () => {
  it('FLOATING_TAB_BAR_HEIGHT is 75', () => {
    expect(FLOATING_TAB_BAR_HEIGHT).toBe(75);
  });

  it('FLOATING_TAB_BAR_BOTTOM is 40', () => {
    expect(FLOATING_TAB_BAR_BOTTOM).toBe(40);
  });

  it('FLOATING_TAB_BAR_TOTAL_HEIGHT equals HEIGHT + BOTTOM', () => {
    expect(FLOATING_TAB_BAR_TOTAL_HEIGHT).toBe(FLOATING_TAB_BAR_HEIGHT + FLOATING_TAB_BAR_BOTTOM);
    expect(FLOATING_TAB_BAR_TOTAL_HEIGHT).toBe(115);
  });

  it('PAGE_BOTTOM_PADDING equals TOTAL_HEIGHT + 16', () => {
    expect(PAGE_BOTTOM_PADDING).toBe(FLOATING_TAB_BAR_TOTAL_HEIGHT + 16);
    expect(PAGE_BOTTOM_PADDING).toBe(131);
  });

  it('PAGE_TOP_PADDING is 16', () => {
    expect(PAGE_TOP_PADDING).toBe(16);
  });
});
