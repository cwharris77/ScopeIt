import { mockInvoke, mockSupabase } from "../../../mocks/supabaseMock";

jest.mock("@/lib/supabase", () => ({
  supabase: mockSupabase,
}));

import { AIAnalysis, analyzeTaskPerformance } from "@/services/geminiService";

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("analyzeTaskPerformance", () => {
  it("returns AIAnalysis on success", async () => {
    const mockData: AIAnalysis = {
      summary: "Great work!",
      insights: ["You finish tasks fast"],
      recommendations: ["Try harder tasks"],
    };
    mockInvoke.mockResolvedValue({ data: mockData, error: null });

    const result = await analyzeTaskPerformance();

    expect(mockInvoke).toHaveBeenCalledWith("analyze-tasks");
    expect(result).toEqual(mockData);
  });

  it("returns null and logs on edge function error", async () => {
    mockInvoke.mockResolvedValue({
      data: null,
      error: new Error("Function failed"),
    });

    const result = await analyzeTaskPerformance();

    expect(result).toBeNull();
    expect(console.error).toHaveBeenCalledWith(
      "Edge function error:",
      expect.any(Error),
    );
  });

  it("logs detail field when present in error data", async () => {
    mockInvoke.mockResolvedValue({
      data: { detail: "Rate limit exceeded" },
      error: new Error("429"),
    });

    const result = await analyzeTaskPerformance();

    expect(result).toBeNull();
    expect(console.error).toHaveBeenCalledWith(
      "Edge function detail:",
      "Rate limit exceeded",
    );
  });

  it("returns null on network exception", async () => {
    mockInvoke.mockRejectedValue(new Error("Network error"));

    const result = await analyzeTaskPerformance();

    expect(result).toBeNull();
    expect(console.error).toHaveBeenCalledWith(
      "Gemini Analysis Error:",
      expect.any(Error),
    );
  });
});
