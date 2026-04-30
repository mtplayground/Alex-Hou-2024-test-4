import { describe, expect, it } from 'vitest';

import { getAppMarkup } from './app';
import { readGameplayConfig } from './config/env';

describe('getAppMarkup', () => {
  it('returns the starter snake game markup', () => {
    const markup = getAppMarkup(readGameplayConfig({}));

    expect(markup).toContain('Snake Game');
    expect(markup).toContain('TypeScript + Vite bootstrap is ready.');
    expect(markup).toContain('Grid size: 20');
  });
});
