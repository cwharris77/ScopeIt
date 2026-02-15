import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskCard } from '@/components/TaskCard';
import { mockTask, mockTag } from '../../../helpers/fixtures';

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const defaultHandlers = {
  onStart: vi.fn(),
  onPause: vi.fn(),
  onComplete: vi.fn(),
  onDelete: vi.fn(),
};

describe('TaskCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders task name, priority, and estimate', () => {
    const task = mockTask({ name: 'My Task', priority: 5, estimated_minutes: 30 });
    render(<TaskCard task={task} {...defaultHandlers} />);

    expect(screen.getByText('My Task')).toBeInTheDocument();
    expect(screen.getByText('medium')).toBeInTheDocument();
    expect(screen.getByText(/Est: 30m/)).toBeInTheDocument();
  });

  describe('pending task', () => {
    it('shows Start button, no Pause', () => {
      const task = mockTask({ status: 'pending' });
      render(<TaskCard task={task} {...defaultHandlers} />);

      expect(screen.getByTitle('Start')).toBeInTheDocument();
      expect(screen.queryByTitle('Pause')).not.toBeInTheDocument();
    });
  });

  describe('running task', () => {
    it('shows Pause button and Running indicator, no Start', () => {
      const task = mockTask({
        status: 'running',
        started_at: new Date().toISOString(),
      });
      render(<TaskCard task={task} {...defaultHandlers} />);

      expect(screen.getByTitle('Pause')).toBeInTheDocument();
      expect(screen.queryByTitle('Start')).not.toBeInTheDocument();
      expect(screen.getByText('Running')).toBeInTheDocument();
    });
  });

  describe('completed task', () => {
    it('shows only Delete button', () => {
      const task = mockTask({ status: 'completed' });
      render(<TaskCard task={task} {...defaultHandlers} />);

      expect(screen.getByTitle('Delete')).toBeInTheDocument();
      expect(screen.queryByTitle('Start')).not.toBeInTheDocument();
      expect(screen.queryByTitle('Pause')).not.toBeInTheDocument();
      expect(screen.queryByTitle('Complete')).not.toBeInTheDocument();
    });

    it('applies line-through to task name', () => {
      const task = mockTask({ status: 'completed', name: 'Done Task' });
      render(<TaskCard task={task} {...defaultHandlers} />);

      const nameEl = screen.getByText('Done Task');
      expect(nameEl.className).toContain('line-through');
    });
  });

  describe('tags', () => {
    it('displays up to 3 tags', () => {
      const tags = [
        mockTag({ name: 'Tag1' }),
        mockTag({ name: 'Tag2' }),
        mockTag({ name: 'Tag3' }),
      ];
      const task = mockTask();
      render(<TaskCard task={task} tags={tags} {...defaultHandlers} />);

      expect(screen.getByText('Tag1')).toBeInTheDocument();
      expect(screen.getByText('Tag2')).toBeInTheDocument();
      expect(screen.getByText('Tag3')).toBeInTheDocument();
    });

    it('shows "+N" for overflow tags', () => {
      const tags = [
        mockTag({ name: 'T1' }),
        mockTag({ name: 'T2' }),
        mockTag({ name: 'T3' }),
        mockTag({ name: 'T4' }),
        mockTag({ name: 'T5' }),
      ];
      const task = mockTask();
      render(<TaskCard task={task} tags={tags} {...defaultHandlers} />);

      expect(screen.getByText('+2')).toBeInTheDocument();
      expect(screen.queryByText('T4')).not.toBeInTheDocument();
    });
  });

  describe('button callbacks', () => {
    it('calls onStart with task ID', async () => {
      const user = userEvent.setup();
      const task = mockTask({ id: 'task-abc', status: 'pending' });
      render(<TaskCard task={task} {...defaultHandlers} />);

      await user.click(screen.getByTitle('Start'));
      expect(defaultHandlers.onStart).toHaveBeenCalledWith('task-abc');
    });

    it('calls onPause with task ID', async () => {
      const user = userEvent.setup();
      const task = mockTask({
        id: 'task-abc',
        status: 'running',
        started_at: new Date().toISOString(),
      });
      render(<TaskCard task={task} {...defaultHandlers} />);

      await user.click(screen.getByTitle('Pause'));
      expect(defaultHandlers.onPause).toHaveBeenCalledWith('task-abc');
    });

    it('calls onDelete with task ID', async () => {
      const user = userEvent.setup();
      const task = mockTask({ id: 'task-abc', status: 'pending' });
      render(<TaskCard task={task} {...defaultHandlers} />);

      await user.click(screen.getByTitle('Delete'));
      expect(defaultHandlers.onDelete).toHaveBeenCalledWith('task-abc');
    });

    it('calls onComplete with task ID', async () => {
      const user = userEvent.setup();
      const task = mockTask({ id: 'task-abc', status: 'pending' });
      render(<TaskCard task={task} {...defaultHandlers} />);

      await user.click(screen.getByTitle('Complete'));
      expect(defaultHandlers.onComplete).toHaveBeenCalledWith('task-abc');
    });
  });
});
