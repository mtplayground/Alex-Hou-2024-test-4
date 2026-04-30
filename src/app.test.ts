import { describe, expect, it } from 'vitest';

import { getAppMarkup } from './app';

describe('getAppMarkup', () => {
  it('returns the starter snake game markup', () => {
    expect(getAppMarkup()).toContain('Snake Game');
    expect(getAppMarkup()).toContain('TypeScript + Vite bootstrap is ready.');
  });
});
