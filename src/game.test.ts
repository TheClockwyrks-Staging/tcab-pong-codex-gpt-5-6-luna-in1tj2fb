import type { InitApi, UpdateApi } from "@clockwyrks/simple-2d";
import { describe, expect, it } from "vitest";
import { CUES, FIELD_CX, FIELD_CY, HOLD_TIME } from "./constants";
import type { CaromDebugApi, CaromState } from "./game";
import { game } from "./game";

const initApi = (): InitApi<never> => ({
  input: { register: () => undefined, layout: () => null },
  audio: { define: () => undefined, load: async () => undefined },
  assets: {
    loadImage: async () => {
      throw new Error("unused");
    },
    loadAudio: async () => {
      throw new Error("unused");
    },
    load: async () => new Blob(),
    resolve: (path) => path,
  },
  diagnostics: { register: () => undefined },
  events: { on: () => () => undefined } as never,
  viewport: () => ({
    width: 1280,
    height: 720,
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    devicePixelRatio: 1,
  }),
});

const updateApi = (
  pressed: readonly string[] = [],
  values: Record<string, number> = {},
): UpdateApi => ({
  input: {
    value: (name) => values[name] ?? 0,
    pressed: (name) => pressed.includes(name),
    pointer: () => ({ x: 0, y: 0, down: false, device: "mouse", buttons: [] }),
    pointerPressed: () => false,
    pointerReleased: () => false,
    pointerSamples: () => [],
    pointerContacts: () => [],
    wheel: () => ({ x: 0, y: 0 }),
  },
  audio: {
    play: () => undefined,
    loop: () => undefined,
    stop: () => undefined,
    looping: () => false,
    setMuted: () => undefined,
    muted: () => false,
  },
  frame: () => ({ count: 0, timeMs: 0, lastDeltaMs: 0 }),
  viewport: () => ({
    width: 1280,
    height: 720,
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    devicePixelRatio: 1,
  }),
});

describe("Carom state and simulation", () => {
  it("opens with a complete title state and debug snapshot", () => {
    const [state, debug] = game.initialize(
      initApi() as unknown as InitApi<CaromState>,
    ) as [CaromState, CaromDebugApi];
    const snapshot = debug.snapshot(state);
    expect(snapshot.screen).toBe("title");
    expect(snapshot.ball?.x).toBe(FIELD_CX);
    expect(snapshot.ball?.y).toBe(FIELD_CY);
    expect(snapshot.ball?.holdTimer).toBe(HOLD_TIME);
    expect(snapshot.version).toBe(1);
  });

  it("serves after the hold and advances the paddle using delta time", () => {
    const [initial, debug] = game.initialize(
      initApi() as unknown as InitApi<CaromState>,
    ) as [CaromState, CaromDebugApi];
    const state = debug.setScreen(
      debug.setPaddleDriven(initial, "left", true),
      "countdown",
    );
    const driven = debug.setPaddleVy(state, "left", 200);
    const next = game.update(driven, updateApi(), HOLD_TIME + 0.01);
    expect(next.screen).toBe("playing");
    expect(next.ball?.held).toBe(false);
    expect(next.paddles.left.cy).toBeGreaterThan(FIELD_CY);
  });

  it("supports world poses without mutating the previous value", () => {
    const [state, debug] = game.initialize(
      initApi() as unknown as InitApi<CaromState>,
    ) as [CaromState, CaromDebugApi];
    const cleared = debug.clearWorld(state);
    expect(cleared.ball).toBeNull();
    expect(cleared.obstacles).toHaveLength(0);
    expect(state.ball).not.toBeNull();
    expect(CUES.score).toBe("score");
  });
});
