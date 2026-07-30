/**
 * Checkout ("finishing") suggestions for point-countdown modes like 501.
 *
 * A leg is finished by reducing the score to exactly zero with the final dart
 * landing in a double (or the bullseye, which counts as double 25). This module
 * derives routes instead of looking them up in a table, so every suggestion is
 * guaranteed to add up to the score and to end on a double.
 *
 * Route preference, in order:
 *   1. fewest darts,
 *   2. leave the most favourable double,
 *   3. prefer "clean" setup darts (singles, trebles, outer bull) over doubles,
 *   4. score as much as possible with the earliest dart.
 */

/** Highest score that can be finished from with three darts (T20 T20 Bull). */
export const MAX_CHECKOUT = 170;

export type CheckoutMultiplier = 1 | 2 | 3;

export interface CheckoutDart {
  /** Board segment: 1-20, or 25 for the bull. */
  segment: number;
  multiplier: CheckoutMultiplier;
}

/** Points scored by a single dart. */
export const dartValue = (dart: CheckoutDart): number =>
  dart.segment * dart.multiplier;

const single = (segment: number): CheckoutDart => ({ segment, multiplier: 1 });
const double = (segment: number): CheckoutDart => ({ segment, multiplier: 2 });
const treble = (segment: number): CheckoutDart => ({ segment, multiplier: 3 });

/**
 * Doubles ordered by how happy a player is to be left on them. Even doubles
 * that split down nicely come first; the bullseye is a last resort and is only
 * reached for scores that cannot finish any other way (170, 167, 164, 161).
 */
const FINISH_PREFERENCE = [20, 16, 12, 10, 8, 18, 14, 6, 4, 2, 19, 17, 15, 13, 11, 9, 7, 5, 3, 1, 25];

const FINISH_DARTS: CheckoutDart[] = FINISH_PREFERENCE.map(double);

/** The highest a single dart can score (T20). */
const MAX_DART = 60;

/**
 * The double that scores exactly `value`, or null when no double does.
 */
function finishDart(value: number): CheckoutDart | null {
  if (value === 50) return double(25);
  if (value % 2 !== 0) return null;
  const segment = value / 2;
  return segment >= 1 && segment <= 20 ? double(segment) : null;
}

/**
 * The dart a player would actually throw to score `value` on the way to a
 * finish. Singles are preferred over trebles of the same value (3 is easier
 * than T1) and doubles are only used as setup darts when nothing else scores
 * that value, since landing in a double mid-turn is an awkward thing to aim for.
 */
function setupDart(value: number, allowDouble: boolean): CheckoutDart | null {
  if (value >= 1 && value <= 20) return single(value);
  if (value === 25) return single(25);
  if (value % 3 === 0 && value / 3 <= 20) return treble(value / 3);
  return allowDouble ? finishDart(value) : null;
}

/** Score reached with a single double. */
function oneDartRoute(score: number): CheckoutDart[] | null {
  const finish = finishDart(score);
  return finish ? [finish] : null;
}

/** One setup dart followed by a double. */
function twoDartRoute(score: number, allowDouble: boolean): CheckoutDart[] | null {
  for (const finish of FINISH_DARTS) {
    const rest = score - dartValue(finish);
    if (rest < 1 || rest > MAX_DART) continue;

    const setup = setupDart(rest, allowDouble);
    if (setup) return [setup, finish];
  }
  return null;
}

/** Two setup darts followed by a double, scoring as high as possible first. */
function threeDartRoute(score: number, allowDouble: boolean): CheckoutDart[] | null {
  for (const finish of FINISH_DARTS) {
    const rest = score - dartValue(finish);
    if (rest < 2 || rest > MAX_DART * 2) continue;

    for (let value = Math.min(MAX_DART, rest - 1); value >= 1; value--) {
      const first = setupDart(value, allowDouble);
      if (!first) continue;

      const remainder = rest - value;
      if (remainder > MAX_DART) break; // every smaller first dart leaves even more

      const second = setupDart(remainder, allowDouble);
      if (second) return [first, second, finish];
    }
  }
  return null;
}

/**
 * Best route from `score` using at most `dartsRemaining` darts, or null when
 * the score cannot be finished (busts, scores above 170, and the handful of
 * three-dart-impossible scores such as 169 or 159).
 */
export function getCheckout(score: number, dartsRemaining = 3): CheckoutDart[] | null {
  if (!Number.isInteger(score) || score < 2 || score > MAX_CHECKOUT) return null;

  const darts = Math.min(3, dartsRemaining);
  if (darts < 1) return null;

  const oneDart = oneDartRoute(score);
  if (oneDart) return oneDart;

  if (darts >= 2) {
    const clean = twoDartRoute(score, false);
    if (clean) return clean;
    const any = twoDartRoute(score, true);
    if (any) return any;
  }

  if (darts >= 3) {
    const clean = threeDartRoute(score, false);
    if (clean) return clean;
    const any = threeDartRoute(score, true);
    if (any) return any;
  }

  return null;
}

/** Darts-notation label for a single dart: "T20", "D16", "Bull", "25", "18". */
export function formatCheckoutDart(dart: CheckoutDart): string {
  if (dart.segment === 25) return dart.multiplier === 2 ? "Bull" : "25";
  if (dart.multiplier === 3) return `T${dart.segment}`;
  if (dart.multiplier === 2) return `D${dart.segment}`;
  return `${dart.segment}`;
}

/** Darts-notation label for a whole route: "T20 T20 Bull". */
export const formatCheckout = (route: CheckoutDart[]): string =>
  route.map(formatCheckoutDart).join(" ");

/**
 * Formatted checkout suggestion, or an empty string when there is no finish.
 * Convenience wrapper for rendering the hint under a player's score.
 */
export function getCheckoutPath(score: number, dartsRemaining = 3): string {
  const route = getCheckout(score, dartsRemaining);
  return route ? formatCheckout(route) : "";
}

export default getCheckoutPath;
