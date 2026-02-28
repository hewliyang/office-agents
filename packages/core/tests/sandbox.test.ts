import { describe, expect, it } from "vitest";
import { sandboxedEval } from "@office-agents/sdk";

describe("sandboxedEval", () => {
  describe("basic execution", () => {
    it("executes simple code and returns a value", async () => {
      const result = await sandboxedEval("return 1 + 2", {});
      expect(result).toBe(3);
    });

    it("returns undefined when no return statement", async () => {
      const result = await sandboxedEval("const x = 1;", {});
      expect(result).toBeUndefined();
    });

    it("supports async/await", async () => {
      const result = await sandboxedEval(
        "const p = Promise.resolve(42); return await p;",
        {},
      );
      expect(result).toBe(42);
    });
  });

  describe("globals access", () => {
    it("can access injected globals", async () => {
      const result = await sandboxedEval("return myValue * 2", {
        myValue: 21,
      });
      expect(result).toBe(42);
    });

    it("can call injected functions", async () => {
      const fn = (a: number, b: number) => a + b;
      const result = await sandboxedEval("return add(3, 4)", { add: fn });
      expect(result).toBe(7);
    });

    it("has access to console", async () => {
      // Should not throw
      await sandboxedEval("console.log('test')", {});
    });

    it("has access to Math", async () => {
      const result = await sandboxedEval("return Math.max(1, 5, 3)", {});
      expect(result).toBe(5);
    });

    it("has access to Date", async () => {
      const result = await sandboxedEval("return typeof Date.now()", {});
      expect(result).toBe("number");
    });
  });

  describe("Object works correctly", () => {
    it("Object() coercion works", async () => {
      const result = await sandboxedEval(
        "const o = Object('hello'); return typeof o;",
        {},
      );
      expect(result).toBe("object");
    });

    it("new Object() works", async () => {
      const result = await sandboxedEval(
        "const o = new Object(); o.x = 1; return o.x;",
        {},
      );
      expect(result).toBe(1);
    });

    it("Object.keys() works", async () => {
      const result = await sandboxedEval(
        "return Object.keys({ a: 1, b: 2 })",
        {},
      );
      expect(result).toEqual(["a", "b"]);
    });

    it("Object.values() works", async () => {
      const result = await sandboxedEval(
        "return Object.values({ a: 1, b: 2 })",
        {},
      );
      expect(result).toEqual([1, 2]);
    });

    it("Object.entries() works", async () => {
      const result = await sandboxedEval(
        "return Object.entries({ a: 1 })",
        {},
      );
      expect(result).toEqual([["a", 1]]);
    });

    it("Object.assign() works", async () => {
      const result = await sandboxedEval(
        "return Object.assign({}, { a: 1 }, { b: 2 })",
        {},
      );
      expect(result).toEqual({ a: 1, b: 2 });
    });

    it("Object.freeze() works", async () => {
      const result = await sandboxedEval(
        "const o = Object.freeze({ x: 1 }); return Object.isFrozen(o);",
        {},
      );
      expect(result).toBe(true);
    });
  });

  describe("blocked globals", () => {
    it("Function constructor is blocked", async () => {
      await expect(
        sandboxedEval("return Function('return 1')()", {}),
      ).rejects.toThrow();
    });

    it("Reflect is blocked", async () => {
      await expect(
        sandboxedEval("return Reflect.ownKeys({})", {}),
      ).rejects.toThrow();
    });

    it("Proxy is blocked", async () => {
      await expect(
        sandboxedEval("return new Proxy({}, {})", {}),
      ).rejects.toThrow();
    });

    it("Compartment is blocked", async () => {
      await expect(
        sandboxedEval("return new Compartment()", {}),
      ).rejects.toThrow();
    });

    it("harden is blocked", async () => {
      await expect(
        sandboxedEval("harden({})", {}),
      ).rejects.toThrow();
    });

    it("lockdown is blocked", async () => {
      await expect(
        sandboxedEval("lockdown()", {}),
      ).rejects.toThrow();
    });
  });

  describe("SES hardening", () => {
    it("prototype chain is frozen — cannot mutate Object.prototype", async () => {
      await expect(
        sandboxedEval(
          "Object.prototype.polluted = true; return true;",
          {},
        ),
      ).rejects.toThrow();
    });

    it("prototype chain is frozen — cannot mutate Array.prototype", async () => {
      await expect(
        sandboxedEval(
          "Array.prototype.polluted = true; return true;",
          {},
        ),
      ).rejects.toThrow();
    });

    it("cannot escape via __proto__ traversal", async () => {
      await expect(
        sandboxedEval(
          "const root = ({}).__proto__.constructor; root.prototype.pwned = true;",
          {},
        ),
      ).rejects.toThrow();
    });

    it("cannot escape via constructor chain", async () => {
      await expect(
        sandboxedEval(
          `const F = [].map.constructor; F('return this')();`,
          {},
        ),
      ).rejects.toThrow();
    });
  });

  describe("error handling", () => {
    it("propagates runtime errors", async () => {
      await expect(
        sandboxedEval("throw new Error('boom')", {}),
      ).rejects.toThrow("boom");
    });

    it("propagates syntax errors", () => {
      expect(() => sandboxedEval("return {{{", {})).toThrow();
    });
  });
});
