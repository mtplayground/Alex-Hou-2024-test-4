import { resolveDirectionChange } from '../game/movement';

import type { Direction } from '../game/types';

export type KeyboardControlEvent = 'toggle-pause' | 'restart';

export type KeyboardInputEvent =
  | {
      type: 'direction';
      direction: Direction;
    }
  | {
      type: 'control';
      control: KeyboardControlEvent;
    };

type KeyboardEventTarget = Pick<
  Window,
  never
> & {
  addEventListener: (
    type: 'keydown',
    listener: (event: KeyboardEvent) => void,
  ) => void;
  removeEventListener: (
    type: 'keydown',
    listener: (event: KeyboardEvent) => void,
  ) => void;
};

type KeyboardBindings = {
  getCurrentDirection: () => Direction;
  onDirectionChange: (direction: Direction) => void;
  onControl: (control: KeyboardControlEvent) => void;
};

const DIRECTION_KEYS: Record<string, Direction> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  w: 'up',
  W: 'up',
  a: 'left',
  A: 'left',
  s: 'down',
  S: 'down',
  d: 'right',
  D: 'right',
};

export function getKeyboardInputEvent(
  key: string,
): KeyboardInputEvent | null {
  const direction = DIRECTION_KEYS[key];

  if (direction) {
    return {
      type: 'direction',
      direction,
    };
  }

  if (key === ' ' || key === 'Spacebar') {
    return {
      type: 'control',
      control: 'toggle-pause',
    };
  }

  if (key === 'Enter') {
    return {
      type: 'control',
      control: 'restart',
    };
  }

  return null;
}

export function handleKeyboardInput(
  event: Pick<KeyboardEvent, 'key' | 'preventDefault'>,
  bindings: KeyboardBindings,
): boolean {
  const inputEvent = getKeyboardInputEvent(event.key);

  if (!inputEvent) {
    return false;
  }

  event.preventDefault();

  if (inputEvent.type === 'control') {
    bindings.onControl(inputEvent.control);
    return true;
  }

  const nextDirection = resolveDirectionChange(
    bindings.getCurrentDirection(),
    inputEvent.direction,
  );

  if (nextDirection !== bindings.getCurrentDirection()) {
    bindings.onDirectionChange(nextDirection);
  }

  return true;
}

export function attachKeyboardInput(
  target: KeyboardEventTarget,
  bindings: KeyboardBindings,
): () => void {
  const listener = (event: KeyboardEvent): void => {
    handleKeyboardInput(event, bindings);
  };

  target.addEventListener('keydown', listener);

  return () => {
    target.removeEventListener('keydown', listener);
  };
}
