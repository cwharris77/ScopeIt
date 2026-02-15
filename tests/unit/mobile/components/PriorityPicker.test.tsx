import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { PriorityPicker } from '@/components/PriorityPicker';

describe('PriorityPicker', () => {
  const onChange = jest.fn();

  beforeEach(() => {
    onChange.mockClear();
  });

  it('renders Low, Medium, and High labels', () => {
    render(<PriorityPicker value="low" onChange={onChange} />);

    expect(screen.getByText('Low')).toBeOnTheScreen();
    expect(screen.getByText('Medium')).toBeOnTheScreen();
    expect(screen.getByText('High')).toBeOnTheScreen();
  });

  it('calls onChange with "low" when Low is pressed', () => {
    render(<PriorityPicker value="high" onChange={onChange} />);
    fireEvent.press(screen.getByText('Low'));
    expect(onChange).toHaveBeenCalledWith('low');
  });

  it('calls onChange with "medium" when Medium is pressed', () => {
    render(<PriorityPicker value="low" onChange={onChange} />);
    fireEvent.press(screen.getByText('Medium'));
    expect(onChange).toHaveBeenCalledWith('medium');
  });

  it('calls onChange with "high" when High is pressed', () => {
    render(<PriorityPicker value="low" onChange={onChange} />);
    fireEvent.press(screen.getByText('High'));
    expect(onChange).toHaveBeenCalledWith('high');
  });
});
