import { render, screen } from '@testing-library/react';
import { StatsCards } from '@/components/StatsCards';

describe('StatsCards', () => {
  it('renders 3 cards with correct values', () => {
    render(<StatsCards completedCount={42} totalTime="5h 30m" accuracy={87} />);

    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('5h 30m')).toBeInTheDocument();
    expect(screen.getByText('87%')).toBeInTheDocument();
  });

  it('renders correct labels', () => {
    render(<StatsCards completedCount={0} totalTime="0s" accuracy={0} />);

    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('Total Time')).toBeInTheDocument();
    expect(screen.getByText('Accuracy')).toBeInTheDocument();
  });
});
