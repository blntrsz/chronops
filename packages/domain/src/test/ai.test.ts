import { describe, it, expect } from "vitest";
import * as AI from "../ai";

describe("AI", () => {
  it("vector dimension", () => {
    expect(AI.VECTOR_DIMENSION).toBe(1536);
  });
});
