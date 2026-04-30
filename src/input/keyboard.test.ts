import { describe, expect, it, vi } from 'vitest';

import {
  attachKeyboardInput,
  getKeyboardInputEvent,
  handleKeyboardInput,
} from './keyboard';
import type { Direction } from '../game/types';

type MockKeyEvent = {
  key: string;
  preventDefault: ReturnType<typeof vi.fn>;
};

class MockKeyboardTarget {
  listener: ((event: KeyboardEvent) => void) | null = null;

  addEventListener(
    eventName: string,
    listener: (event: KeyboardEvent) => void,
  ): void {
    if (eventName === 'keydown') {
      this.listener = listener;
    }
  }

  removeEventListener(
    eventName: string,
    listener: (event: KeyboardEvent) => void,
  ): void {
    if (eventName === 'keydown' && this.listener === listener) {
      this.listener = null;
    }
  }

  dispatch(event: MockKeyEvent): void {
    this.listener?.(event as unknown as KeyboardEvent);
  }
}

function createBindings(currentDirection: Direction) {
  let direction = currentDirection;

  return {
    getCurrentDirection: () => direction,
    onDirectionChange: vi.fn((nextDirection: Direction) => {
      direction = nextDirection;
    }),
    onControl: vi.fn(),
  };
}

describe('getKeyboardInputEvent', () => {
  it('maps arrow keys and WASD to directions', () => {
    expect(getKeyboardInputEvent('ArrowUp')).toEqual({
      type: 'direction',
      direction: 'up',
    });
    expect(getKeyboardInputEvent('a')).toEqual({
      type: 'direction',
      direction: 'left',
    });
    expect(getKeyboardInputEvent('D')).toEqual({
      type: 'direction',
      direction: 'right',
    });
  });

  it('maps control keys to pause and restart events', () => {
    expect(getKeyboardInputEvent(' ')).toEqual({
      type: 'control',
      control: 'toggle-pause',
    });
    expect(getKeyboardInputEvent('Enter')).toEqual({
      type: 'control',
      control: 'restart',
    });
  });

  it('returns null for unsupported keys', () => {
    expect(getKeyboardInputEvent('Escape')).toBeNull();
  });
});

describe('handleKeyboardInput', () => {
  it('applies non-reversing direction changes', () => {
    const bindings = createBindings('right');
    const event: MockKeyEvent = {
      key: 'ArrowUp',
      preventDefault: vi.fn(),
    };

    expect(handleKeyboardInput(event, bindings)).toBe(true);
    expect(event.preventDefault).toHaveBeenCalledOnce();
    expect(bindings.onDirectionChange).toHaveBeenCalledWith('up');
  });

  it('rejects reversing direction changes', () => {
    const bindings = createBindings('right');
    const event: MockKeyEvent = {
      key: 'ArrowLeft',
      preventDefault: vi.fn(),
    };

    expect(handleKeyboardInput(event, bindings)).toBe(true);
    expect(event.preventDefault).toHaveBeenCalledOnce();
    expect(bindings.onDirectionChange).not.toHaveBeenCalled();
  });

  it('dispatches control events', () => {
    const bindings = createBindings('right');
    const event: MockKeyEvent = {
      key: 'Enter',
      preventDefault: vi.fn(),
    };

    expect(handleKeyboardInput(event, bindings)).toBe(true);
    expect(bindings.onControl).toHaveBeenCalledWith('restart');
  });

  it('ignores unsupported keys', () => {
    const bindings = createBindings('right');
    const event: MockKeyEvent = {
      key: 'Escape',
      preventDefault: vi.fn(),
    };

    expect(handleKeyboardInput(event, bindings)).toBe(false);
    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(bindings.onDirectionChange).not.toHaveBeenCalled();
    expect(bindings.onControl).not.toHaveBeenCalled();
  });
});

describe('attachKeyboardInput', () => {
  it('attaches and detaches the keydown listener', () => {
    const target = new MockKeyboardTarget();
    const bindings = createBindings('up');

    const detach = attachKeyboardInput(target, bindings);

    target.dispatch({
      key: 'd',
      preventDefault: vi.fn(),
    });

    expect(bindings.onDirectionChange).toHaveBeenCalledWith('right');

    detach();

    target.dispatch({
      key: 'a',
      preventDefault: vi.fn(),
    });

    expect(bindings.onDirectionChange).toHaveBeenCalledTimes(1);
  });
});
