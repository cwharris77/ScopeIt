import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterBar } from '@/components/FilterBar';
import { mockTag } from '../../../helpers/fixtures';
import { SORT_OPTIONS } from '@shared/constants/tasks';

const defaultProps = () => ({
  tags: [
    mockTag({ id: 'tag-1', name: 'Bug' }),
    mockTag({ id: 'tag-2', name: 'Feature' }),
  ],
  selectedTagIds: new Set<string>(),
  onTagToggle: vi.fn(),
  onClearFilters: vi.fn(),
  sortOption: 'newest' as const,
  onSortChange: vi.fn(),
});

describe('FilterBar', () => {
  it('renders "All" button and all tag buttons', () => {
    render(<FilterBar {...defaultProps()} />);

    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Bug')).toBeInTheDocument();
    expect(screen.getByText('Feature')).toBeInTheDocument();
  });

  it('calls onTagToggle when a tag is clicked', async () => {
    const user = userEvent.setup();
    const props = defaultProps();
    render(<FilterBar {...props} />);

    await user.click(screen.getByText('Bug'));
    expect(props.onTagToggle).toHaveBeenCalledWith('tag-1');
  });

  it('calls onClearFilters when "All" is clicked', async () => {
    const user = userEvent.setup();
    const props = defaultProps();
    props.selectedTagIds = new Set(['tag-1']);
    render(<FilterBar {...props} />);

    await user.click(screen.getByText('All'));
    expect(props.onClearFilters).toHaveBeenCalled();
  });

  it('renders sort dropdown with all options', () => {
    render(<FilterBar {...defaultProps()} />);

    for (const opt of SORT_OPTIONS) {
      expect(screen.getByText(opt.label)).toBeInTheDocument();
    }
  });

  it('calls onSortChange when sort option changes', async () => {
    const user = userEvent.setup();
    const props = defaultProps();
    render(<FilterBar {...props} />);

    await user.selectOptions(screen.getByRole('combobox'), 'oldest');
    expect(props.onSortChange).toHaveBeenCalledWith('oldest');
  });
});
