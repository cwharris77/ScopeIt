import {
  analyzeTaskPerformance,
  type AIAnalysis,
} from "@shared/services/geminiService";
import { describe, expect, it, vi } from "vitest";
import { mockSupabaseClient } from "../../../helpers/mocks";

describe("analyzeTaskPerformance", () => {
  it("returns AIAnalysis data on success", async () => {
    const expected: AIAnalysis = {
      summary: "Good performance",
      insights: ["Insight 1"],
      recommendations: ["Rec 1"],
    };

    const client = mockSupabaseClient();
    client.functions.invoke.mockResolvedValue({ data: expected, error: null });

    const result = await analyzeTaskPerformance(client);
    expect(result).toEqual(expected);
    expect(client.functions.invoke).toHaveBeenCalledWith("analyze-tasks");
  });

  it("returns null on edge function error", async () => {
    const client = mockSupabaseClient();
    client.functions.invoke.mockResolvedValue({
      data: null,
      error: { message: "Internal error", status: 500 },
    });

    const result = await analyzeTaskPerformance(client);
    expect(result).toBeNull();
  });

  it("returns null on network error", async () => {
    const client = mockSupabaseClient();
    client.functions.invoke.mockRejectedValue(new Error("Network failure"));

    const result = await analyzeTaskPerformance(client);
    expect(result).toBeNull();
  });

  it("returns null on timeout", async () => {
    vi.useFakeTimers();

    const client = mockSupabaseClient();
    client.functions.invoke.mockImplementation(
      () => new Promise(() => {}), // never resolves
    );

    const promise = analyzeTaskPerformance(client, 100);
    vi.advanceTimersByTime(150);

    const result = await promise;
    expect(result).toBeNull();

    vi.useRealTimers();
  });
});
