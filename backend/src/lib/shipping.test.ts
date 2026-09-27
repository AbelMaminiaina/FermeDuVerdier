import { describe, it, expect } from 'vitest';
import { computeShippingCost } from './shipping.js';

describe('computeShippingCost', () => {
  it('is always free', () => {
    expect(computeShippingCost()).toBe(0);
  });
});
