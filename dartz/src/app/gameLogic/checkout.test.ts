import { describe, expect, it } from "vitest";
import {
  CheckoutDart,
  MAX_CHECKOUT,
  dartValue,
  formatCheckout,
  getCheckout,
  getCheckoutPath,
} from "./checkout";

/** Scores that cannot be finished with three darts. */
const IMPOSSIBLE = [159, 162, 163, 165, 166, 168, 169];

const allScores = () =>
  Array.from({ length: MAX_CHECKOUT - 1 }, (_, i) => i + 2); // 2..170

const isLegalDart = (dart: CheckoutDart) =>
  dart.segment === 25
    ? dart.multiplier === 1 || dart.multiplier === 2
    : dart.segment >= 1 && dart.segment <= 20 && dart.multiplier >= 1 && dart.multiplier <= 3;

const isDouble = (dart: CheckoutDart) => dart.multiplier === 2;

describe("getCheckout", () => {
  it("returns routes that actually finish the leg", () => {
    for (const score of allScores()) {
      for (const darts of [1, 2, 3]) {
        const route = getCheckout(score, darts);
        if (!route) continue;

        const label = `${score} in ${darts} dart(s) -> ${formatCheckout(route)}`;
        expect(route.length, label).toBeLessThanOrEqual(darts);
        expect(route.every(isLegalDart), label).toBe(true);
        expect(route.reduce((sum, d) => sum + dartValue(d), 0), label).toBe(score);
        expect(isDouble(route[route.length - 1]), label).toBe(true);
      }
    }
  });

  it("finds a route for every finishable score", () => {
    const unfinishable = allScores().filter((score) => getCheckout(score, 3) === null);
    expect(unfinishable).toEqual(IMPOSSIBLE);
  });

  it("returns null for scores that cannot be checked out", () => {
    for (const score of [-1, 0, 1, 171, 180, 501]) {
      expect(getCheckout(score, 3)).toBeNull();
    }
    expect(getCheckout(40.5, 3)).toBeNull();
    expect(getCheckout(Number.NaN, 3)).toBeNull();
  });

  it("suggests the canonical big finishes", () => {
    expect(getCheckoutPath(170)).toBe("T20 T20 Bull");
    expect(getCheckoutPath(167)).toBe("T20 T19 Bull");
    expect(getCheckoutPath(164)).toBe("T20 T18 Bull");
    expect(getCheckoutPath(161)).toBe("T20 T17 Bull");
    expect(getCheckoutPath(160)).toBe("T20 T20 D20");
    expect(getCheckoutPath(141)).toBe("T20 T19 D12");
    expect(getCheckoutPath(132)).toBe("T20 T16 D12");
    expect(getCheckoutPath(118)).toBe("T20 18 D20");
  });

  it("suggests the canonical two- and one-dart finishes", () => {
    expect(getCheckoutPath(110)).toBe("T20 Bull");
    expect(getCheckoutPath(100)).toBe("T20 D20");
    expect(getCheckoutPath(98)).toBe("T20 D19");
    expect(getCheckoutPath(96)).toBe("T20 D18");
    expect(getCheckoutPath(60)).toBe("20 D20");
    expect(getCheckoutPath(50)).toBe("Bull");
    expect(getCheckoutPath(40)).toBe("D20");
    expect(getCheckoutPath(32)).toBe("D16");
    expect(getCheckoutPath(2)).toBe("D1");
  });

  it("only finishes on the bullseye when nothing else works", () => {
    const bullFinishes = allScores().filter((score) => {
      const route = getCheckout(score, 3);
      const last = route?.[route.length - 1];
      return last?.segment === 25;
    });
    expect(bullFinishes).toEqual([50, 101, 104, 107, 110, 161, 164, 167, 170]);
  });

  it("prefers the fewest darts", () => {
    // 40 is a one-dart finish even though 8 + D16 would also work.
    expect(getCheckout(40, 3)).toHaveLength(1);
    // 100 is a two-dart finish even with three darts in hand.
    expect(getCheckout(100, 3)).toHaveLength(2);
  });

  it("respects the darts left in the turn", () => {
    expect(getCheckoutPath(40, 1)).toBe("D20");
    expect(getCheckoutPath(41, 1)).toBe("");
    expect(getCheckoutPath(100, 1)).toBe("");
    expect(getCheckoutPath(100, 2)).toBe("T20 D20");
    expect(getCheckoutPath(141, 2)).toBe("");
    expect(getCheckoutPath(141, 3)).toBe("T20 T19 D12");
  });

  it("returns nothing when no darts are left", () => {
    expect(getCheckout(40, 0)).toBeNull();
    expect(getCheckout(40, -1)).toBeNull();
  });

  it("never proposes more than three darts", () => {
    for (const score of allScores()) {
      expect(getCheckout(score, 99)?.length ?? 0).toBeLessThanOrEqual(3);
    }
  });

  /**
   * The previous hard-coded lookup table returned combinations that did not add
   * up — following the suggestion for 60 ("Triple 20, Double 20" = 100) busted
   * the turn. These are the scores it got wrong.
   */
  it("fixes the scores the old lookup table got wrong", () => {
    const previouslyBroken = [
      118, 117, 116, 115, 114, 113, 111, 109, 108, 105, 104, 103, 102, 101, 99,
      60, 59, 58, 57, 55, 54, 53, 52, 51, 50, 49, 48, 47, 46, 45, 44, 43, 42, 41,
    ];

    for (const score of previouslyBroken) {
      const route = getCheckout(score, 3);
      expect(route, `no route for ${score}`).not.toBeNull();
      expect(route!.reduce((sum, d) => sum + dartValue(d), 0)).toBe(score);
      expect(isDouble(route![route!.length - 1])).toBe(true);
    }
  });
});

describe("formatCheckout", () => {
  it("uses darts notation", () => {
    expect(formatCheckout([{ segment: 20, multiplier: 3 }])).toBe("T20");
    expect(formatCheckout([{ segment: 16, multiplier: 2 }])).toBe("D16");
    expect(formatCheckout([{ segment: 7, multiplier: 1 }])).toBe("7");
    expect(formatCheckout([{ segment: 25, multiplier: 1 }])).toBe("25");
    expect(formatCheckout([{ segment: 25, multiplier: 2 }])).toBe("Bull");
  });
});
