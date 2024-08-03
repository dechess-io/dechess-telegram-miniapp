export enum Classification {
  BRILLIANT = 'brilliant',
  GREAT = 'great',
  BEST = 'best',
  EXCELLENT = 'excellent',
  GOOD = 'good',
  INACCURACY = 'inaccuracy',
  MISTAKE = 'mistake',
  BLUNDER = 'blunder',
  BOOK = 'book',
  FORCED = 'forced',
}

export const classificationValues = {
  blunder: 0,
  mistake: 0.2,
  inaccuracy: 0.4,
  good: 0.65,
  excellent: 0.9,
  best: 1,
  great: 1,
  brilliant: 1,
  book: 1,
  forced: 1,
}

// Classification types with no special rules
export const centipawnClassifications = [
  Classification.BEST,
  Classification.EXCELLENT,
  Classification.GOOD,
  Classification.INACCURACY,
  Classification.MISTAKE,
  Classification.BLUNDER,
]

export function getEvaluationLossThreadHold(classif: Classification, prevEval: number) {
  prevEval = Math.abs(prevEval)

  let threshold = 0

  switch (classif) {
  }
}
