import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useCountdown } from "@/modules/auth/features/verify_email/hooks/use_countdown";

describe("useCountdown", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("arranca parado y solo cuenta con el numero que le dan", () => {
    const { result } = renderHook(() => useCountdown());

    expect(result.current.seconds).toBe(0);
    expect(result.current.isRunning).toBe(false);

    act(() => {
      result.current.start(45);
    });

    expect(result.current.seconds).toBe(45);
    expect(result.current.isRunning).toBe(true);
  });

  it("baja un segundo por segundo y se detiene en cero", () => {
    const { result } = renderHook(() => useCountdown());

    act(() => {
      result.current.start(3);
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.seconds).toBe(2);

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.seconds).toBe(0);
    expect(result.current.isRunning).toBe(false);

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(result.current.seconds).toBe(0);
  });

  it("reinicia la cuenta con el valor nuevo", () => {
    const { result } = renderHook(() => useCountdown());

    act(() => {
      result.current.start(10);
    });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    act(() => {
      result.current.start(30);
    });

    expect(result.current.seconds).toBe(30);
  });
});
