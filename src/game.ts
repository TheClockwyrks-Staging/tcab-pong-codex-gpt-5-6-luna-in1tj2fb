import type { Game, InitApi } from "@clockwyrks/simple-2d";
import type { DeepReadonly } from "ts-essentials";
import * as C from "./constants";

export const BACKGROUND = "#08101d";
export type Screen =
  "title" | "howto" | "countdown" | "playing" | "paused" | "matchover";
export type Mode = "solo" | "versus";
export type Side = "left" | "right";
export interface PaddleState {
  readonly cy: number;
  readonly vy: number;
  readonly driven: boolean;
  readonly drivenVy: number;
}
export interface AiState {
  readonly tracking: boolean;
  readonly movement: boolean;
}
export interface TrailSample {
  readonly x: number;
  readonly y: number;
  readonly t: number;
}
export interface BallState {
  readonly x: number;
  readonly y: number;
  readonly vx: number;
  readonly vy: number;
  readonly spin: number;
  readonly held: boolean;
  readonly holdTimer: number;
  readonly serveSign: 1 | -1;
  readonly trail: readonly TrailSample[];
}
export interface ObstacleState {
  readonly index: number;
  readonly cx: number;
  readonly cy: number;
}
export interface CaromState {
  readonly screen: Screen;
  readonly mode: Mode;
  readonly menuIndex: number;
  readonly titleIndex: number;
  readonly resumeScreen: "countdown" | "playing";
  readonly score: { readonly p1: number; readonly p2: number };
  readonly winner: Side | null;
  readonly paddles: { readonly left: PaddleState; readonly right: PaddleState };
  readonly ai: AiState;
  readonly receiver: Side;
  readonly ball: BallState | null;
  readonly obstacles: readonly ObstacleState[];
  readonly simTime: number;
  readonly muted: boolean;
}
export interface MenuRect {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}
export interface Snapshot {
  readonly version: number;
  readonly screen: Screen;
  readonly mode: Mode;
  readonly menuIndex: number;
  readonly titleIndex: number;
  readonly resumeScreen: "countdown" | "playing";
  readonly score: { readonly p1: number; readonly p2: number };
  readonly winner: Side | null;
  readonly muted: boolean;
  readonly paddles: { left: PaddleState; right: PaddleState };
  readonly ai: AiState;
  readonly receiver: Side;
  readonly ball: (BallState & { readonly speed: number }) | null;
  readonly obstacles: readonly ObstacleState[];
  readonly simTime: number;
}
export interface CaromDebugApi {
  readonly version: number;
  clearWorld(s: DeepReadonly<CaromState>): CaromState;
  spawnBall(s: DeepReadonly<CaromState>): CaromState;
  spawnObstacle(s: DeepReadonly<CaromState>, i: number): CaromState;
  reset(s: DeepReadonly<CaromState>): CaromState;
  reconcile(s: DeepReadonly<CaromState>): CaromState;
  setScreen(s: DeepReadonly<CaromState>, v: Screen): CaromState;
  setMode(s: DeepReadonly<CaromState>, v: Mode): CaromState;
  setMenuIndex(s: DeepReadonly<CaromState>, v: number): CaromState;
  setTitleIndex(s: DeepReadonly<CaromState>, v: number): CaromState;
  setResumeScreen(
    s: DeepReadonly<CaromState>,
    v: "countdown" | "playing",
  ): CaromState;
  setScore(s: DeepReadonly<CaromState>, p1: number, p2: number): CaromState;
  setWinner(s: DeepReadonly<CaromState>, v: Side | null): CaromState;
  setReceiver(s: DeepReadonly<CaromState>, v: Side): CaromState;
  setPaddleCy(s: DeepReadonly<CaromState>, side: Side, v: number): CaromState;
  setPaddleVy(s: DeepReadonly<CaromState>, side: Side, v: number): CaromState;
  setPaddleDriven(
    s: DeepReadonly<CaromState>,
    side: Side,
    v: boolean,
  ): CaromState;
  setBallPosition(
    s: DeepReadonly<CaromState>,
    x: number,
    y: number,
  ): CaromState;
  setBallVelocity(
    s: DeepReadonly<CaromState>,
    vx: number,
    vy: number,
  ): CaromState;
  setBallSpin(s: DeepReadonly<CaromState>, v: number): CaromState;
  setBallHeld(s: DeepReadonly<CaromState>, v: boolean): CaromState;
  setBallHoldTimer(s: DeepReadonly<CaromState>, v: number): CaromState;
  setBallServeSign(s: DeepReadonly<CaromState>, v: 1 | -1): CaromState;
  drawBallServeSign(s: DeepReadonly<CaromState>): CaromState;
  setAiTracking(s: DeepReadonly<CaromState>, v: boolean): CaromState;
  setAiMovement(s: DeepReadonly<CaromState>, v: boolean): CaromState;
  setMuted(s: DeepReadonly<CaromState>, v: boolean): CaromState;
  snapshot(s: DeepReadonly<CaromState>): Snapshot;
  menuItemRect(s: DeepReadonly<CaromState>, i: number): MenuRect | null;
}
const rnd = (): 1 | -1 => (Math.random() < 0.5 ? -1 : 1),
  clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const paddle = (): PaddleState => ({
  cy: C.FIELD_CY,
  vy: 0,
  driven: false,
  drivenVy: 0,
});
const ball = (): BallState => ({
  x: C.FIELD_CX,
  y: C.FIELD_CY,
  vx: 0,
  vy: 0,
  spin: 0,
  held: true,
  holdTimer: C.HOLD_TIME,
  serveSign: rnd(),
  trail: [],
});
const obs = (): ObstacleState[] =>
  C.OBSTACLE_CENTERS.map((p, index) => ({ index, cx: p.x, cy: p.y }));
const fresh = (muted = false): CaromState => ({
  screen: "title",
  mode: "solo",
  menuIndex: 0,
  titleIndex: 0,
  resumeScreen: "playing",
  score: { p1: 0, p2: 0 },
  winner: null,
  paddles: { left: paddle(), right: paddle() },
  ai: { tracking: true, movement: true },
  receiver: "left",
  ball: ball(),
  obstacles: obs(),
  simTime: 0,
  muted,
});
const menu = (s: DeepReadonly<CaromState>): readonly string[] =>
  s.screen === "title"
    ? C.TITLE_ITEMS
    : s.screen === "howto"
      ? ["BACK TO TITLE"]
      : s.screen === "paused"
        ? C.PAUSE_ITEMS
        : C.MATCHOVER_ITEMS;
const rect = (s: DeepReadonly<CaromState>, i: number): MenuRect | null => {
  const n = menu(s).length;
  if (s.screen === "playing" || s.screen === "countdown" || i < 0 || i >= n)
    return null;
  return { x: 438, y: 322 + i * 66, w: 404, h: 48 };
};
const at = (s: DeepReadonly<CaromState>, mode: Mode): CaromState => ({
  ...s,
  screen: "countdown",
  mode,
  menuIndex: 0,
  resumeScreen: "playing",
  score: { p1: 0, p2: 0 },
  winner: null,
  receiver: "left",
  paddles: { left: paddle(), right: paddle() },
  ball: ball(),
  obstacles: obs(),
});
const title = (s: DeepReadonly<CaromState>): CaromState => ({
  ...fresh(s.muted),
  titleIndex: s.titleIndex,
  menuIndex: s.titleIndex,
  simTime: s.simTime,
});
const move = (p: PaddleState, v: number, dt: number): PaddleState => {
  const cy = clamp(p.cy + v * dt, C.PADDLE_MIN_CY, C.PADDLE_MAX_CY);
  return { ...p, cy, vy: dt > 0 && cy !== p.cy ? (cy - p.cy) / dt : 0 };
};
type Hit = "wall" | "paddle" | "obstacle";
const collide = (
  b: BallState,
  r: { x0: number; y0: number; x1: number; y1: number },
  kind: Hit,
): { b: BallState; hit?: Hit } => {
  const d = [
      b.x - (r.x0 - C.BALL_R),
      r.x1 + C.BALL_R - b.x,
      b.y - (r.y0 - C.BALL_R),
      r.y1 + C.BALL_R - b.y,
    ],
    m = Math.min(...d);
  if (m <= 0) return { b };
  const f = d.indexOf(m);
  let x = b.x,
    y = b.y,
    vx = b.vx,
    vy = b.vy;
  if (f === 0) {
    x = r.x0 - C.BALL_R;
    if (vx > 0) vx = -vx;
  } else if (f === 1) {
    x = r.x1 + C.BALL_R;
    if (vx < 0) vx = -vx;
  } else if (f === 2) {
    y = r.y0 - C.BALL_R;
    if (vy > 0) vy = -vy;
  } else {
    y = r.y1 + C.BALL_R;
    if (vy < 0) vy = -vy;
  }
  return {
    b: { ...b, x, y, vx, vy },
    hit: kind === "obstacle" ? "obstacle" : f < 2 ? "paddle" : "wall",
  };
};
const physics = (
  input: BallState,
  paddles: DeepReadonly<CaromState>["paddles"],
  obstacles: readonly ObstacleState[],
  dt: number,
): { b: BallState; hits: Hit[] } => {
  let b = input;
  const hits: Hit[] = [];
  const n = Math.max(
      1,
      Math.ceil((Math.hypot(b.vx, b.vy) * dt) / C.MAX_SUBSTEP),
    ),
    h = dt / n;
  for (let i = 0; i < n; i++) {
    const sp = Math.hypot(b.vx, b.vy);
    let { vx, vy } = b;
    if (sp) {
      const a = (b.spin / sp) * h,
        co = Math.cos(a),
        si = Math.sin(a);
      [vx, vy] = [vx * co - vy * si, vx * si + vy * co];
    }
    b = {
      ...b,
      vx,
      vy,
      spin: b.spin * Math.pow(0.5, h / C.SPIN_HALFLIFE),
      x: b.x + vx * h,
      y: b.y + vy * h,
    };
    if (b.y - C.BALL_R < 0 && b.vy < 0) {
      b = { ...b, y: C.BALL_R, vy: -b.vy };
      hits.push("wall");
    } else if (b.y + C.BALL_R > C.FIELD_H && b.vy > 0) {
      b = { ...b, y: C.FIELD_H - C.BALL_R, vy: -b.vy };
      hits.push("wall");
    }
    const lp = collide(
      b,
      {
        x0: C.P1_X0,
        y0: paddles.left.cy - C.PADDLE_HALF,
        x1: C.P1_X1,
        y1: paddles.left.cy + C.PADDLE_HALF,
      },
      "paddle",
    );
    if (lp.hit === "paddle") {
      const speed = Math.min(
          Math.hypot(b.vx, b.vy) * C.SPEED_MULT,
          C.SPEED_CAP,
        ),
        a =
          clamp((b.y - paddles.left.cy) / C.PADDLE_HALF, -1, 1) *
          C.MAX_BOUNCE_ANGLE;
      b = {
        ...lp.b,
        x: C.P1_X1 + C.BALL_R,
        vx: speed * Math.cos(a),
        vy: speed * Math.sin(a),
        spin: clamp(
          b.spin + paddles.left.vy * C.SPIN_FROM_PADDLE,
          -C.SPIN_CLAMP,
          C.SPIN_CLAMP,
        ),
      };
    } else b = lp.b;
    if (lp.hit) hits.push(lp.hit);
    const rp = collide(
      b,
      {
        x0: C.P2_X0,
        y0: paddles.right.cy - C.PADDLE_HALF,
        x1: C.P2_X1,
        y1: paddles.right.cy + C.PADDLE_HALF,
      },
      "paddle",
    );
    if (rp.hit === "paddle") {
      const speed = Math.min(
          Math.hypot(b.vx, b.vy) * C.SPEED_MULT,
          C.SPEED_CAP,
        ),
        a =
          clamp((b.y - paddles.right.cy) / C.PADDLE_HALF, -1, 1) *
          C.MAX_BOUNCE_ANGLE;
      b = {
        ...rp.b,
        x: C.P2_X0 - C.BALL_R,
        vx: -speed * Math.cos(a),
        vy: speed * Math.sin(a),
        spin: clamp(
          b.spin + paddles.right.vy * C.SPIN_FROM_PADDLE,
          -C.SPIN_CLAMP,
          C.SPIN_CLAMP,
        ),
      };
    } else b = rp.b;
    if (rp.hit) hits.push(rp.hit);
    for (const o of obstacles) {
      const q = collide(
        b,
        {
          x0: o.cx - C.OBSTACLE_HW,
          y0: o.cy - C.OBSTACLE_HH,
          x1: o.cx + C.OBSTACLE_HW,
          y1: o.cy + C.OBSTACLE_HH,
        },
        "obstacle",
      );
      b = q.b;
      if (q.hit) hits.push(q.hit);
    }
  }
  return { b, hits };
};
const debug = (): CaromDebugApi => {
  const ballOf = (s: DeepReadonly<CaromState>): BallState => {
    if (!s.ball) throw Error("Carom: no ball is present");
    return s.ball;
  };
  const pd = (
    s: DeepReadonly<CaromState>,
    side: Side,
    p: PaddleState,
  ): CaromState => ({ ...s, paddles: { ...s.paddles, [side]: p } });
  return {
    version: C.CAROM_DEBUG_VERSION,
    clearWorld: (s) => ({ ...s, ball: null, obstacles: [] }),
    spawnBall: (s) => ({ ...s, ball: ball() }),
    spawnObstacle: (s, i) => {
      if (!Number.isInteger(i) || i < 0 || i > 1)
        throw Error("Carom: invalid obstacle index");
      const p = C.OBSTACLE_CENTERS[i];
      return {
        ...s,
        obstacles: [
          ...s.obstacles.filter((o) => o.index !== i),
          { index: i, cx: p.x, cy: p.y },
        ].sort((a, b) => a.index - b.index),
      };
    },
    reset: (s) => fresh(s.muted),
    reconcile: (s) => ({ ...s }),
    setScreen: (s, v) => ({ ...s, screen: v }),
    setMode: (s, v) => ({ ...s, mode: v }),
    setMenuIndex: (s, v) => ({ ...s, menuIndex: v }),
    setTitleIndex: (s, v) => ({ ...s, titleIndex: v }),
    setResumeScreen: (s, v) => ({ ...s, resumeScreen: v }),
    setScore: (s, p1, p2) => ({ ...s, score: { p1, p2 } }),
    setWinner: (s, v) => ({ ...s, winner: v }),
    setReceiver: (s, v) => ({ ...s, receiver: v }),
    setPaddleCy: (s, side, v) => pd(s, side, { ...s.paddles[side], cy: v }),
    setPaddleVy: (s, side, v) =>
      pd(s, side, { ...s.paddles[side], drivenVy: v }),
    setPaddleDriven: (s, side, v) =>
      pd(s, side, { ...s.paddles[side], driven: v }),
    setBallPosition: (s, x, y) => {
      if (
        x < C.BALL_R ||
        x > C.FIELD_W - C.BALL_R ||
        y < C.BALL_R ||
        y > C.FIELD_H - C.BALL_R
      )
        throw Error("Carom: ball position is outside the field");
      return { ...s, ball: { ...ballOf(s), x, y } };
    },
    setBallVelocity: (s, vx, vy) => ({ ...s, ball: { ...ballOf(s), vx, vy } }),
    setBallSpin: (s, v) => ({ ...s, ball: { ...ballOf(s), spin: v } }),
    setBallHeld: (s, v) => ({ ...s, ball: { ...ballOf(s), held: v } }),
    setBallHoldTimer: (s, v) => ({
      ...s,
      ball: { ...ballOf(s), holdTimer: v },
    }),
    setBallServeSign: (s, v) => ({
      ...s,
      ball: { ...ballOf(s), serveSign: v },
    }),
    drawBallServeSign: (s) => ({
      ...s,
      ball: { ...ballOf(s), serveSign: rnd() },
    }),
    setAiTracking: (s, v) => ({ ...s, ai: { ...s.ai, tracking: v } }),
    setAiMovement: (s, v) => ({ ...s, ai: { ...s.ai, movement: v } }),
    setMuted: (s, v) => ({ ...s, muted: v }),
    snapshot: (s) => ({
      ...s,
      version: C.CAROM_DEBUG_VERSION,
      score: { ...s.score },
      paddles: { left: { ...s.paddles.left }, right: { ...s.paddles.right } },
      ai: { ...s.ai },
      obstacles: s.obstacles.map((o) => ({ ...o })),
      ball: s.ball
        ? { ...s.ball, speed: Math.hypot(s.ball.vx, s.ball.vy) }
        : null,
    }),
    menuItemRect: (s, i) => rect(s, i),
  };
};
export const game: Game<CaromState, CaromDebugApi> = {
  initialize(api: InitApi<CaromState>) {
    for (const a of C.ACTIONS)
      api.input.register(a, { keys: [...C.BINDINGS[a]] });
    api.audio.define(C.CUES.paddleHit, {
      wave: "square",
      freq: 440,
      freqTo: 180,
      durationMs: 70,
      gain: 0.05,
    });
    api.audio.define(C.CUES.wallBounce, {
      wave: "triangle",
      freq: 240,
      freqTo: 120,
      durationMs: 55,
      gain: 0.04,
    });
    api.audio.define(C.CUES.obstacleBounce, {
      freq: 320,
      freqTo: 180,
      durationMs: 60,
      gain: 0.04,
    });
    api.audio.define(C.CUES.score, {
      wave: "sawtooth",
      freq: 160,
      freqTo: 520,
      durationMs: 180,
      gain: 0.05,
    });
    const d = (
      n: string,
      f: (s: DeepReadonly<CaromState>) => string | number,
    ) => api.diagnostics.register(n, f);
    d("screen", (s) => s.screen);
    d("mode", (s) => s.mode);
    d("score", (s) => `${s.score.p1}-${s.score.p2}`);
    d("ball", (s) =>
      s.ball ? `${s.ball.x.toFixed(0)},${s.ball.y.toFixed(0)}` : "none",
    );
    d("velocity", (s) =>
      s.ball ? `${s.ball.vx.toFixed(0)},${s.ball.vy.toFixed(0)}` : "none",
    );
    d("speed", (s) =>
      s.ball ? Math.hypot(s.ball.vx, s.ball.vy).toFixed(0) : 0,
    );
    d("spin", (s) => (s.ball ? s.ball.spin.toFixed(0) : 0));
    d(
      "left paddle",
      (s) =>
        `${s.paddles.left.cy.toFixed(0)} / ${s.paddles.left.vy.toFixed(0)}`,
    );
    d(
      "right paddle",
      (s) =>
        `${s.paddles.right.cy.toFixed(0)} / ${s.paddles.right.vy.toFixed(0)}`,
    );
    return [fresh(), debug()];
  },
  update(state, api, dt) {
    let s: CaromState = {
      ...state,
      simTime: state.simTime + dt,
      muted: api.audio.muted(),
    };
    if (api.input.pressed("mute")) {
      api.audio.setMuted(!api.audio.muted());
      s = { ...s, muted: api.audio.muted() };
    }
    const ax = (u: string, d: string) =>
        api.input.value(d) - api.input.value(u),
      left = state.paddles.left.driven
        ? move(state.paddles.left, state.paddles.left.drivenVy, dt)
        : move(
            state.paddles.left,
            (state.mode === "solo"
              ? ax("p1-up", "p1-down") + ax("p2-up", "p2-down")
              : ax("p1-up", "p1-down")) * C.PADDLE_SPEED,
            dt,
          );
    let right: PaddleState;
    if (state.mode === "solo" && !state.paddles.right.driven) {
      let target = C.AI_HOME_Y,
        dead = C.AI_HOME_DEADZONE;
      if (
        state.screen === "playing" &&
        state.ai.tracking &&
        state.ball &&
        state.ball.vx > 0
      ) {
        target = state.ball.y - state.ball.vy * C.AI_REACT;
        dead = C.AI_DEADZONE;
      }
      const diff = target - state.paddles.right.cy;
      right = move(
        state.paddles.right,
        state.ai.movement && Math.abs(diff) > dead && dt > 0
          ? Math.sign(diff) * Math.min(C.AI_SPEED, Math.abs(diff) / dt)
          : 0,
        dt,
      );
    } else
      right = state.paddles.right.driven
        ? move(state.paddles.right, state.paddles.right.drivenVy, dt)
        : move(
            state.paddles.right,
            ax("p2-up", "p2-down") * C.PADDLE_SPEED,
            dt,
          );
    s = {
      ...s,
      paddles:
        state.screen === "playing" || state.screen === "countdown"
          ? { left, right }
          : {
              left: { ...state.paddles.left, vy: 0 },
              right: { ...state.paddles.right, vy: 0 },
            },
    };
    if (state.screen === "countdown" && state.ball) {
      const t = state.ball.holdTimer - dt;
      if (t <= 0) {
        const dir = state.receiver === "left" ? -1 : 1;
        s = {
          ...s,
          screen: "playing",
          ball: {
            ...state.ball,
            held: false,
            holdTimer: 0,
            vx: dir * C.SERVE_SPEED * Math.cos(C.SERVE_ANGLE),
            vy: state.ball.serveSign * C.SERVE_SPEED * Math.sin(C.SERVE_ANGLE),
            trail: [],
          },
        };
      } else
        s = {
          ...s,
          ball: {
            ...state.ball,
            holdTimer: t,
            x: C.FIELD_CX,
            y: C.FIELD_CY,
            trail: [
              ...state.ball.trail,
              { x: C.FIELD_CX, y: C.FIELD_CY, t: s.simTime },
            ].filter((q) => q.t >= s.simTime - C.TRAIL_TIME),
          },
        };
    }
    if (state.screen === "playing" && state.ball && !state.ball.held) {
      const r = physics(state.ball, s.paddles, s.obstacles, dt);
      for (const h of r.hits)
        api.audio.play(
          h === "paddle"
            ? C.CUES.paddleHit
            : h === "wall"
              ? C.CUES.wallBounce
              : C.CUES.obstacleBounce,
        );
      const b = {
        ...r.b,
        trail: [
          ...state.ball.trail,
          { x: r.b.x, y: r.b.y, t: s.simTime },
        ].filter((q) => q.t >= s.simTime - C.TRAIL_TIME),
      };
      s = { ...s, ball: b };
      if (b.x - C.BALL_R > C.FIELD_W || b.x + C.BALL_R < 0) {
        const p1 = b.x - C.BALL_R > C.FIELD_W,
          score = {
            p1: state.score.p1 + (p1 ? 1 : 0),
            p2: state.score.p2 + (p1 ? 0 : 1),
          },
          win: Side | null =
            score.p1 >= C.WIN_SCORE && score.p1 - score.p2 >= C.WIN_LEAD
              ? "left"
              : score.p2 >= C.WIN_SCORE && score.p2 - score.p1 >= C.WIN_LEAD
                ? "right"
                : null;
        api.audio.play(C.CUES.score);
        s = win
          ? { ...s, score, winner: win, screen: "matchover", menuIndex: 0 }
          : {
              ...s,
              score,
              receiver: p1 ? "right" : "left",
              ball: ball(),
              screen: "countdown",
            };
      }
    }
    const press = (n: string) => api.input.pressed(n);
    if (["title", "howto", "paused", "matchover"].includes(state.screen)) {
      const items = menu(state);
      let i = state.menuIndex;
      if (press("p1-up") || press("p2-up"))
        i = (i + items.length - 1) % items.length;
      else if (press("p1-down") || press("p2-down")) i = (i + 1) % items.length;
      const p = api.input.pointer(),
        hit = items.findIndex((_, j) => {
          const r = rect(state, j);
          return (
            r !== null &&
            p.x >= r.x &&
            p.x <= r.x + r.w &&
            p.y >= r.y &&
            p.y <= r.y + r.h
          );
        });
      if (hit >= 0) i = hit;
      s = { ...s, menuIndex: i };
      if (press("confirm")) {
        s =
          state.screen === "title"
            ? i === 0
              ? at(s, "solo")
              : i === 1
                ? at(s, "versus")
                : { ...s, titleIndex: i, screen: "howto", menuIndex: 0 }
            : state.screen === "howto"
              ? title(s)
              : state.screen === "paused"
                ? i === 0
                  ? { ...s, screen: s.resumeScreen }
                  : i === 1
                    ? at(s, s.mode)
                    : title(s)
                : i === 0
                  ? at(s, s.mode)
                  : title(s);
        if (state.screen === "title") s = { ...s, titleIndex: i };
      }
    }
    if (
      (state.screen === "playing" || state.screen === "countdown") &&
      press("pause")
    )
      s = { ...s, resumeScreen: state.screen, screen: "paused", menuIndex: 0 };
    else if (state.screen === "paused" && (press("pause") || press("back")))
      s = { ...s, screen: state.resumeScreen };
    else if (state.screen === "matchover" && press("back")) s = title(s);
    return s;
  },
  render(state, api) {
    const x = api.ctx;
    x.fillStyle = BACKGROUND;
    x.fillRect(0, 0, C.FIELD_W, C.FIELD_H);
    x.setLineDash([14, 16]);
    x.strokeStyle = "#7690ad66";
    x.lineWidth = 3;
    x.beginPath();
    x.moveTo(C.NET_X, 36);
    x.lineTo(C.NET_X, C.FIELD_H - 36);
    x.stroke();
    x.setLineDash([]);
    for (const o of state.obstacles) {
      x.fillStyle = "#f3b562";
      round(
        x,
        o.cx - C.OBSTACLE_HW,
        o.cy - C.OBSTACLE_HH,
        C.OBSTACLE_W,
        C.OBSTACLE_H,
        10,
      );
    }
    const pad = (p: PaddleState, px: number, col: string) => {
      x.fillStyle = col;
      round(x, px, p.cy - C.PADDLE_HALF, C.PADDLE_W, C.PADDLE_HALF * 2, 8);
    };
    pad(state.paddles.left, C.P1_X0, "#31e1d0");
    pad(state.paddles.right, C.P2_X0, "#ff5d83");
    if (state.ball) {
      if (state.ball.trail.length > 1) {
        x.strokeStyle = "#ffffff30";
        x.lineWidth = 7;
        x.beginPath();
        x.moveTo(state.ball.trail[0].x, state.ball.trail[0].y);
        for (const q of state.ball.trail.slice(1)) x.lineTo(q.x, q.y);
        x.stroke();
      }
      x.fillStyle = "#f7fbff";
      x.beginPath();
      x.arc(state.ball.x, state.ball.y, C.BALL_R, 0, Math.PI * 2);
      x.fill();
    }
    if (state.screen === "title") {
      shade(x, "#08101dea");
      label(x, C.TITLE_TEXT, C.FIELD_CX, 176, 86, "#fff");
      label(x, "A SPIN-DRIVEN PADDLE DUEL", C.FIELD_CX, 224, 18, "#8ca7c7");
      drawMenu(x, state, C.TITLE_ITEMS);
      label(
        x,
        "W/S or ↑/↓  •  ENTER to select  •  M to mute",
        C.FIELD_CX,
        646,
        15,
        "#6e89a8",
      );
    } else if (state.screen === "howto") {
      shade(x, "#08101dea");
      label(x, "HOW TO PLAY", C.FIELD_CX, 120, 46, "#fff");
      label(
        x,
        "Move into the ball to return it. Paddle motion adds SPIN.",
        C.FIELD_CX,
        220,
        21,
        "#d0deef",
      );
      label(
        x,
        "Curve rallies around the gold bank obstacles.",
        C.FIELD_CX,
        258,
        21,
        "#d0deef",
      );
      label(
        x,
        "SOLO: W/S (or arrows)     VERSUS: W/S and ↑/↓",
        C.FIELD_CX,
        320,
        18,
        "#80dfd1",
      );
      drawMenu(x, state, ["BACK TO TITLE"]);
    } else {
      label(x, `${state.score.p1}`, 492, 86, 56, "#31e1d0");
      label(x, `${state.score.p2}`, 788, 86, 56, "#ff5d83");
      label(
        x,
        state.mode === "solo" ? "SOLO // RALLY" : "VERSUS // LOCAL",
        C.FIELD_CX,
        54,
        15,
        "#9bb0c9",
      );
      if (state.screen === "countdown") {
        shade(x, "#08101d66");
        label(x, "READY", C.FIELD_CX, 300, 48, "#fff");
      }
      if (state.screen === "paused") {
        shade(x, "#08101ddd");
        label(x, "PAUSED", C.FIELD_CX, 190, 58, "#fff");
        drawMenu(x, state, C.PAUSE_ITEMS);
      }
      if (state.screen === "matchover") {
        shade(x, "#08101ddd");
        label(
          x,
          state.winner === "left" ? "PLAYER ONE WINS" : "PLAYER TWO WINS",
          C.FIELD_CX,
          185,
          42,
          state.winner === "left" ? "#31e1d0" : "#ff5d83",
        );
        label(
          x,
          `${state.score.p1} — ${state.score.p2}`,
          C.FIELD_CX,
          245,
          32,
          "#fff",
        );
        drawMenu(x, state, C.MATCHOVER_ITEMS);
      }
    }
  },
};
function round(
  x: CanvasRenderingContext2D,
  a: number,
  b: number,
  w: number,
  h: number,
  r: number,
): void {
  x.beginPath();
  x.roundRect(a, b, w, h, r);
  x.fill();
}
function label(
  x: CanvasRenderingContext2D,
  t: string,
  a: number,
  b: number,
  z: number,
  c: string,
): void {
  x.fillStyle = c;
  x.font = `800 ${z}px ui-monospace,monospace`;
  x.textAlign = "center";
  x.textBaseline = "middle";
  x.fillText(t, a, b);
}
function shade(x: CanvasRenderingContext2D, c: string): void {
  x.fillStyle = c;
  x.fillRect(0, 0, C.FIELD_W, C.FIELD_H);
}
function drawMenu(
  x: CanvasRenderingContext2D,
  s: DeepReadonly<CaromState>,
  items: readonly string[],
): void {
  items.forEach((t, i) => {
    const r = rect(s, i) as MenuRect;
    x.fillStyle = i === s.menuIndex ? "#eff7ff" : "#142941";
    round(x, r.x, r.y, r.w, r.h, 12);
    label(
      x,
      t,
      C.FIELD_CX,
      r.y + r.h / 2,
      20,
      i === s.menuIndex ? "#0c1a2c" : "#c5d6ea",
    );
  });
}
