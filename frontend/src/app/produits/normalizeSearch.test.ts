import { describe, it, expect } from 'vitest';
import { normalizeSearch } from './ProductsClient';

describe('normalizeSearch', () => {
  it('« oeufs » correspond à « Œufs »', () => {
    expect(normalizeSearch('Œufs Bio - Boîte de 6')).toContain(normalizeSearch('oeufs'));
  });

  it('ignore accents et majuscules', () => {
    expect(normalizeSearch("Œufs d'Été")).toBe("oeufs d'ete");
    expect(normalizeSearch('PINTADE')).toBe('pintade');
  });
});
