import React from 'react';
import { render, screen } from '@testing-library/react-native';
import ErrorView from '@/components/ErrorView';

describe('ErrorView', () => {
  it('renders error heading and message', () => {
    const error = new Error('Something went wrong');
    render(<ErrorView error={error} />);

    expect(screen.getByText('Error')).toBeOnTheScreen();
    expect(screen.getByText('Something went wrong')).toBeOnTheScreen();
  });
});
