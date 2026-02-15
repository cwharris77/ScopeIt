import { TaskCard } from "@/components/TaskCard";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import { mockTag, mockTask } from "../../../helpers/fixtures";

// Mock expo-router
jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

// Mock supabase (needed by @/lib/supabase import chain)
jest.mock("@/lib/supabase", () => ({
  supabase: {},
}));

describe("TaskCard", () => {
  const defaultHandlers = {
    onStart: jest.fn(),
    onPause: jest.fn(),
    onComplete: jest.fn(),
    onDelete: jest.fn(),
  };

  beforeEach(() => {
    jest.useFakeTimers();
    Object.values(defaultHandlers).forEach((fn) => fn.mockClear());
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders task name", () => {
    const task = mockTask({ name: "Build feature" });
    render(<TaskCard task={task} {...defaultHandlers} />);

    expect(screen.getByText("Build feature")).toBeOnTheScreen();
  });

  describe("pending status", () => {
    it("shows Start and Finish buttons, no Pause", () => {
      const task = mockTask({ status: "pending" });
      render(<TaskCard task={task} {...defaultHandlers} />);

      expect(screen.getByText("Start")).toBeOnTheScreen();
      expect(screen.getByText("Finish")).toBeOnTheScreen();
      expect(screen.queryByText("Pause")).toBeNull();
    });
  });

  describe("running status", () => {
    it("shows Pause and Finish, LIVE badge, no Start", () => {
      const task = mockTask({
        status: "running",
        started_at: new Date().toISOString(),
      });
      render(<TaskCard task={task} {...defaultHandlers} />);

      expect(screen.getByText("Pause")).toBeOnTheScreen();
      expect(screen.getByText("Finish")).toBeOnTheScreen();
      expect(screen.getByText("LIVE")).toBeOnTheScreen();
      expect(screen.queryByText("Start")).toBeNull();
    });
  });

  describe("completed status", () => {
    it("shows line-through style and variance text, no action buttons", () => {
      const task = mockTask({
        status: "completed",
        estimated_minutes: 30,
        actual_seconds: 1500, // 25 min — under estimate
      });
      render(<TaskCard task={task} {...defaultHandlers} />);

      // No action buttons
      expect(screen.queryByText("Start")).toBeNull();
      expect(screen.queryByText("Pause")).toBeNull();
      expect(screen.queryByText("Finish")).toBeNull();

      // Title has line-through
      const title = screen.getByText("Test Task");
      expect(title.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ textDecorationLine: "line-through" }),
        ]),
      );

      // Variance text shown
      expect(screen.getByText(/Efficient.*Ahead by/)).toBeOnTheScreen();
    });

    it('shows "Over by" for tasks that went over estimate', () => {
      const task = mockTask({
        status: "completed",
        estimated_minutes: 10,
        actual_seconds: 900, // 15 min — over by 5 min
      });
      render(<TaskCard task={task} {...defaultHandlers} />);

      expect(screen.getByText(/Over by/)).toBeOnTheScreen();
    });
  });

  describe("tags", () => {
    it("shows up to 3 tags", () => {
      const tags = [
        mockTag({ name: "Tag1" }),
        mockTag({ name: "Tag2" }),
        mockTag({ name: "Tag3" }),
      ];
      const task = mockTask({ status: "pending" });
      render(<TaskCard task={task} tags={tags} {...defaultHandlers} />);

      expect(screen.getByText("Tag1")).toBeOnTheScreen();
      expect(screen.getByText("Tag2")).toBeOnTheScreen();
      expect(screen.getByText("Tag3")).toBeOnTheScreen();
    });

    it("shows +N overflow for more than 3 tags", () => {
      const tags = [
        mockTag({ name: "A" }),
        mockTag({ name: "B" }),
        mockTag({ name: "C" }),
        mockTag({ name: "D" }),
        mockTag({ name: "E" }),
      ];
      const task = mockTask({ status: "pending" });
      render(<TaskCard task={task} tags={tags} {...defaultHandlers} />);

      expect(screen.getByText("+2")).toBeOnTheScreen();
    });
  });

  describe("action handlers", () => {
    it("delete button calls onDelete with task.id", () => {
      const task = mockTask();
      render(<TaskCard task={task} {...defaultHandlers} />);

      fireEvent.press(screen.getByLabelText("Delete task"));
      expect(defaultHandlers.onDelete).toHaveBeenCalledWith(task.id);
    });

    it("Start button calls onStart with task.id", () => {
      const task = mockTask({ status: "pending" });
      render(<TaskCard task={task} {...defaultHandlers} />);

      fireEvent.press(screen.getByText("Start"));
      expect(defaultHandlers.onStart).toHaveBeenCalledWith(task.id);
    });

    it("Pause button calls onPause with task.id", () => {
      const task = mockTask({
        status: "running",
        started_at: new Date().toISOString(),
      });
      render(<TaskCard task={task} {...defaultHandlers} />);

      fireEvent.press(screen.getByText("Pause"));
      expect(defaultHandlers.onPause).toHaveBeenCalledWith(task.id);
    });

    it("Finish button calls onComplete with task.id", () => {
      const task = mockTask({ status: "pending" });
      render(<TaskCard task={task} {...defaultHandlers} />);

      fireEvent.press(screen.getByText("Finish"));
      expect(defaultHandlers.onComplete).toHaveBeenCalledWith(task.id);
    });
  });

  describe("edit navigation", () => {
    it("edit button navigates via router.push with task params", () => {
      const mockPush = jest.fn();
      (useRouter as jest.Mock).mockReturnValue({
        push: mockPush,
        back: jest.fn(),
        replace: jest.fn(),
      });

      const task = mockTask({ name: "My Task", priority: 5 });
      render(<TaskCard task={task} {...defaultHandlers} />);

      fireEvent.press(screen.getByLabelText("Edit task"));

      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining(`/edit-task?id=${task.id}`),
      );
    });
  });
});
