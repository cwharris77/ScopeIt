import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Dropdown } from '@/components/Dropdown';

const options = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'duration', label: 'Longest Duration' },
] as const;

describe('Dropdown', () => {
  const onChange = jest.fn();

  beforeEach(() => {
    onChange.mockClear();
  });

  it('displays selected option label in trigger', () => {
    render(<Dropdown value="newest" options={[...options]} onChange={onChange} />);
    expect(screen.getByText('Newest First')).toBeOnTheScreen();
  });

  it('opens modal showing all options on press', () => {
    render(<Dropdown value="newest" options={[...options]} onChange={onChange} />);

    fireEvent.press(screen.getByText('Newest First'));

    expect(screen.getByText('Oldest First')).toBeOnTheScreen();
    expect(screen.getByText('Longest Duration')).toBeOnTheScreen();
  });

  it('calls onChange with selected value', () => {
    render(<Dropdown value="newest" options={[...options]} onChange={onChange} />);

    fireEvent.press(screen.getByText('Newest First'));
    fireEvent.press(screen.getByText('Oldest First'));

    expect(onChange).toHaveBeenCalledWith('oldest');
  });
});
