# PLUFFY: HIGH KITCHEN - Game Architecture

## Overview

This is a Sweet Bonanza-style 6×5 scatter-pay slot game with tumble/cascade mechanics.

## Core Architecture

```
src/game/
├── config/
│   └── GameConfig.ts      # All game parameters (paytable, weights, etc.)
├── engine/
│   ├── RNGEngine.ts       # Random symbol generation
│   ├── WinEngine.ts       # Win detection & payout calculation
│   ├── CascadeEngine.ts   # Tumble/cascade mechanics
│   └── GameEngine.ts      # Main game loop controller
├── utils/
│   └── CurrencyUtils.ts   # Currency formatting
└── index.ts               # Main exports
```

## Game Flow

### Base Spin Flow
```
1. User clicks SPIN
2. GameEngine.spin() called
   ├── Deduct bet from balance
   ├── Generate new grid (RNGEngine.generateGrid)
   ├── Calculate wins (WinEngine.calculateWins)
   ├── If wins exist:
   │   ├── Apply cascade (CascadeEngine.applyCascade)
   │   ├── Recalculate wins
   │   └── Repeat until no wins
   ├── Check scatter trigger (4+ = bonus)
   └── Update balance with total win
3. UI animates based on cascade sequence
```

### Free Spins Flow
```
1. Bonus triggered (4+ scatters OR buy feature)
2. GameEngine.startBonus(spins) called
3. For each free spin:
   ├── Same cascade logic as base
   ├── Multiplier candies appear (~8% chance)
   ├── Collect all multipliers during cascades
   ├── Apply multiplier sum to final spin win
   └── Check for retrigger (3+ scatters = +5 spins)
4. GameEngine.endBonus() when spins = 0
```

## Key Configuration Files

### Paytable (`GameConfig.ts`)
```typescript
PAYTABLE = {
  CHEF: { lowCount: 10x, midCount: 25x, highCount: 50x },
  // ... etc
}
```

### Symbol Weights (`GameConfig.ts`)
```typescript
SYMBOL_WEIGHTS = {
  base: { CHEF: 0.05, BROWNIE: 0.08, ... },
  bonus: { CHEF: 0.05, MULTIPLIER: 0.08, ... }
}
```

### Volatility Profiles (`GameConfig.ts`)
- **LOW**: 40% hit frequency, casual play
- **MID**: 33% hit frequency, balanced (default)
- **DEGEN**: 25% hit frequency, high risk/reward

## RTP Components

| Component | LOW | MID | DEGEN |
|-----------|-----|-----|-------|
| Base hits | 75% | 60% | 45% |
| Cascades | 10% | 15% | 20% |
| Bonus | 15% | 25% | 35% |

## Tuning Guide

### To increase hit frequency:
- Increase symbol weights for low-value symbols
- Lower the win threshold (currently 8+ symbols)

### To increase bonus frequency:
- Increase SCATTER weight in SYMBOL_WEIGHTS.base
- Lower scatter trigger count (currently 4+)

### To increase volatility:
- Decrease hit frequency
- Increase top multipliers in paytable
- Increase high multiplier candy weights

## Animation Timings

All timings in `ANIMATION_CONFIG`:
- Spin drop: 450ms
- Win highlight: 500ms
- Symbol pop: 350ms
- Cascade fall: 400ms

## Max Win Caps

- Per spin: 5000x bet
- Per bonus: 10000x bet
- Max cascades: 50 (safety limit)

