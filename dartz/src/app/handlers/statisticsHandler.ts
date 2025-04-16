import { Throw } from "../utils/types";

const calculateAverage = (throws: Throw[]): number => {
  let sum = 0;
  throws.forEach((throws) => {
    sum +=
      throws.score1 * throws.multiplier1 +
      throws.score2 * throws.multiplier2 +
      throws.score3 * throws.multiplier3;
  });
  let dartCount = throws.length;

  return +(sum / dartCount).toFixed(2);
};

const calculate100Plus = (throws: Throw[]): number => {
  let count = 0;
  throws.forEach((throws) => {
    let sum =
      throws.score1 * throws.multiplier1 +
      throws.score2 * throws.multiplier2 +
      throws.score3 * throws.multiplier3;
    if (sum > 100) count++;
  });

  return count;
};

const calculateHighestScore = (throws: Throw[]): number => {
  let score = 0;
  throws.forEach((throws) => {
    let sum =
      throws.score1 * throws.multiplier1 +
      throws.score2 * throws.multiplier2 +
      throws.score3 * throws.multiplier3;
    if (sum > score) score = sum;
  });
  return score;
};

const calculateLastScore = (throws: Throw[]): number => {
  let last = throws[throws.length - 1];
  if (!last) return 0;
  let sum =
    last.score1 * last.multiplier1 +
    last.score2 * last.multiplier2 +
    last.score3 * last.multiplier3;

  return sum;
};

export {
  calculateAverage,
  calculate100Plus,
  calculateHighestScore,
  calculateLastScore,
};
