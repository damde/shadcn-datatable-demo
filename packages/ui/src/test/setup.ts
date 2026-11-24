import "@testing-library/jest-dom/vitest"
import { expect } from "vitest"
import * as axeMatchers from "vitest-axe/matchers"
import type { AxeMatchers } from "vitest-axe/matchers"

expect.extend(axeMatchers)

/* eslint-disable @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unused-vars */
declare module "vitest" {
  interface Assertion<R, T> extends AxeMatchers {}
  interface AsymmetricMatchersContaining extends AxeMatchers {}
}
/* eslint-enable @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unused-vars */

/**
 * Polyfill ResizeObserver for jsdom so virtualization and layout-aware
 * primitives (@tanstack/react-virtual, @base-ui/react) work in unit tests.
 */
if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class ResizeObserver {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  }
}

/**
 * Polyfill Element.prototype.scrollIntoView for jsdom so keyboard navigation
 * and focus management in Base UI primitives do not throw.
 */
if (typeof Element !== "undefined" && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = function scrollIntoView(): void {}
}

/**
 * Polyfill window.matchMedia for jsdom so responsive hooks and media-query
 * listeners work cleanly in tests.
 */
if (typeof window !== "undefined" && typeof window.matchMedia !== "function") {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: (query: string): MediaQueryList => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  })
}
