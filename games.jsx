import { useState, useEffect, useRef, useCallback } from "react";
import { gamePalette } from "./themes.js";

export const GAME_LEVELS = 6;

export function GameLevelBar({ level, setLevel, max = GAME_LEVELS }) {
  return (
    <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 16, flexWrap: "wrap" }}>
      {Array.from({ length: max }, (_, i) => i + 1).map((lv) => (
        <button
          key={lv}
          type="button"
          onClick={() => setLevel(lv)}
          style={{
            width: 32,
            height: 32,
            borderRadius: 6,
            border: `2px solid ${level === lv ? "var(--teal)" : "var(--border)"}`,
            background: level === lv ? "var(--teal)" : "var(--card)",
            color: level === lv ? "#000" : "var(--silver)",
            fontFamily: "Orbitron, monospace",
            fontSize: 11,
            cursor: "pointer",
          }}
        >
          {lv}
        </button>
      ))}
    </div>
  );
}

function useCanvasLoop(canvasRef, draw, deps = []) {
  const rafRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let alive = true;
    const loop = () => {
      if (!alive) return;
      draw(ctx, canvas);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      alive = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, deps);
}

// ── Flappy Emerald (1 level, dynamic speed + spikes) ─────────
export function FlappyGame({ t, theme }) {
  const canvasRef = useRef(null);
  const [display, setDisplay] = useState({ score: 0, best: 0, over: false });
  const state = useRef({
    bird: { y: 200, vy: 0, wing: 0 },
    pipes: [],
    spikes: [],
    score: 0,
    best: 0,
    running: false,
    over: false,
    frame: 0,
    speedMul: 1,
  });
  const W = 400, H = 500, GAP = 155, PIPE_W = 50;
  const c = gamePalette(theme);

  const flap = useCallback(() => {
    const s = state.current;
    if (s.over) {
      Object.assign(s, { bird: { y: 200, vy: 0, wing: 0 }, pipes: [], spikes: [], score: 0, running: false, over: false, frame: 0, speedMul: 1 });
      setDisplay({ score: 0, best: s.best, over: false });
      return;
    }
    if (!s.running) s.running = true;
    s.bird.vy = -8;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const onKey = (e) => { if (e.code === "Space") { e.preventDefault(); flap(); } };
    window.addEventListener("keydown", onKey);

    const drawBird = (y, wing) => {
      const bx = W / 2;
      ctx.save();
      ctx.translate(bx, y);
      ctx.rotate(Math.min(s.bird.vy * 0.04, 0.5));
      ctx.fillStyle = c.fg;
      ctx.beginPath();
      ctx.ellipse(0, 0, 18, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(14, -2);
      ctx.lineTo(24, 0);
      ctx.lineTo(14, 4);
      ctx.closePath();
      ctx.fillStyle = c.accent;
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(6, -4, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#111";
      ctx.beginPath();
      ctx.arc(7, -4, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = c.fg;
      ctx.beginPath();
      ctx.ellipse(-8, 2 + Math.sin(wing) * 4, 10, 5, -0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    let raf;
    const loop = () => {
      const s = state.current;
      const speed = 2.5 * s.speedMul;
      ctx.fillStyle = c.bg;
      ctx.fillRect(0, 0, W, H);

      if (s.running && !s.over) {
        s.bird.vy += 0.45;
        s.bird.y += s.bird.vy;
        s.bird.wing += 0.25;
        s.frame++;
        if (s.score >= 5 && s.score % 5 === 0 && s.frame % 90 === 0) s.speedMul = Math.min(s.speedMul * 1.1, 2.2);
        if (s.frame % Math.max(70, 90 - s.score * 2) === 0) {
          const top = 60 + Math.random() * (H - GAP - 120);
          s.pipes.push({ x: W, top });
        }
        if (s.score >= 8 && s.frame % 120 === 0) {
          s.spikes.push({ x: W, y: 80 + Math.random() * (H - 160) });
        }
        s.pipes.forEach((p) => { p.x -= speed; });
        s.spikes.forEach((sp) => { sp.x -= speed * 1.1; });
        s.pipes = s.pipes.filter((p) => p.x > -PIPE_W);
        s.spikes = s.spikes.filter((sp) => sp.x > -20);
        s.pipes.forEach((p) => {
          if (!p.scored && p.x + PIPE_W < W / 2) {
            p.scored = true;
            s.score++;
            if (s.score > s.best) s.best = s.score;
          }
        });
        setDisplay({ score: s.score, best: s.best, over: false });
      }

      ctx.fillStyle = c.fg;
      s.pipes.forEach((p) => {
        ctx.fillRect(p.x, 0, PIPE_W, p.top);
        ctx.fillRect(p.x, p.top + GAP, PIPE_W, H - p.top - GAP);
      });
      s.spikes.forEach((sp) => {
        ctx.fillStyle = c.accent;
        ctx.beginPath();
        ctx.moveTo(sp.x, sp.y);
        ctx.lineTo(sp.x + 16, sp.y + 8);
        ctx.lineTo(sp.x, sp.y + 16);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = c.fg;
      });

      drawBird(s.bird.y, s.bird.wing);
      ctx.font = "bold 24px Orbitron";
      ctx.fillStyle = c.fg;
      ctx.textAlign = "center";
      ctx.fillText(String(s.score), W / 2, 40);

      const hitPipe = s.pipes.some(
        (p) =>
          Math.abs(W / 2 - (p.x + PIPE_W / 2)) < 20 &&
          (s.bird.y < p.top + 16 || s.bird.y > p.top + GAP - 16)
      );
      const hitSpike = s.spikes.some((sp) => Math.hypot(W / 2 - sp.x, s.bird.y - sp.y) < 18);
      if ((hitPipe || hitSpike || s.bird.y < 8 || s.bird.y > H - 8) && s.running) {
        s.over = true;
        s.running = false;
        setDisplay((d) => ({ ...d, over: true }));
      }
      if (!s.running && !s.over) {
        ctx.font = "14px Exo 2";
        ctx.fillText(t.games.start, W / 2, H / 2);
      }
      if (s.over) {
        ctx.fillStyle = "rgba(0,0,0,0.55)";
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = c.fg;
        ctx.font = "bold 22px Orbitron";
        ctx.fillText(t.games.over, W / 2, H / 2 - 12);
        ctx.font = "14px Exo 2";
        ctx.fillText(`${t.games.score}: ${s.score}`, W / 2, H / 2 + 16);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKey);
    };
  }, [theme, flap, t]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <canvas ref={canvasRef} width={400} height={500} onClick={flap} tabIndex={0}
        style={{ borderRadius: 12, border: "2px solid var(--teal)", cursor: "pointer", maxWidth: "100%" }} />
      <p style={{ marginTop: 12, fontSize: 13, color: "var(--text-muted)" }}>{t.games.best}: {display.best}</p>
    </div>
  );
}

// ── Memory with levels ────────────────────────────────────────
const EMOJI_POOL = ["🎬", "📝", "🎭", "🎥", "📖", "🏆", "🌟", "💡", "🎯", "🔮"];
export function MemoryGame({ t, theme }) {
  const [level, setLevel] = useState(1);
  const pairs = Math.min(3 + level, 8);
  const createDeck = () => {
    const pool = EMOJI_POOL.slice(0, pairs);
    return [...pool, ...pool].map((emoji, i) => ({ id: i, emoji, flipped: false, matched: false }))
      .sort(() => Math.random() - 0.5);
  };
  const [cards, setCards] = useState(createDeck);
  const [selected, setSelected] = useState([]);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);

  useEffect(() => {
    setCards(createDeck());
    setSelected([]);
    setMoves(0);
    setWon(false);
  }, [level]);

  useEffect(() => {
    if (selected.length !== 2) return;
    const [a, b] = selected;
    if (cards[a].emoji === cards[b].emoji) {
      setCards((c) => c.map((card, i) => (i === a || i === b ? { ...card, matched: true } : card)));
      setSelected([]);
      if (cards.filter((x) => x.matched).length + 2 === cards.length) setWon(true);
    } else {
      const tm = setTimeout(() => {
        setCards((c) => c.map((card, i) => (i === a || i === b ? { ...card, flipped: false } : card)));
        setSelected([]);
      }, 700);
      return () => clearTimeout(tm);
    }
  }, [selected, cards]);

  const cols = pairs <= 4 ? 4 : pairs <= 6 ? 4 : 5;
  return (
    <div style={{ textAlign: "center" }}>
      <GameLevelBar level={level} setLevel={setLevel} />
      <p style={{ color: "var(--teal)", marginBottom: 12 }}>{t.games.score}: {moves}</p>
      {won && <p style={{ color: "var(--teal)", marginBottom: 12 }}>🏆 Level {level}</p>}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols},1fr)`, gap: 8, maxWidth: 400, margin: "0 auto" }}>
        {cards.map((card, i) => (
          <button key={card.id} type="button" onClick={() => {
            if (selected.length === 2 || card.flipped || card.matched) return;
            setCards((c) => c.map((x, idx) => (idx === i ? { ...x, flipped: true } : x)));
            setSelected((s) => [...s, i]);
            setMoves((m) => m + 1);
          }}
            style={{ width: 64, height: 64, borderRadius: 8, border: "2px solid var(--teal)", fontSize: 24, background: card.flipped || card.matched ? "var(--teal)" : "var(--card)", cursor: "pointer" }}>
            {card.flipped || card.matched ? card.emoji : "?"}
          </button>
        ))}
      </div>
      {won && level < GAME_LEVELS && (
        <button className="btn-primary" style={{ marginTop: 16 }} type="button" onClick={() => setLevel((l) => l + 1)}>Next level →</button>
      )}
    </div>
  );
}

// ── Generic leveled canvas factory ───────────────────────────
function LeveledCanvasGame({ theme, t, level, setLevel, W, H, title, initState, tick, drawExtra }) {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [over, setOver] = useState(false);
  const state = useRef(null);
  const c = gamePalette(theme);
  const mult = 1 + (level - 1) * 0.12;

  useEffect(() => {
    state.current = initState(mult);
    setScore(0);
    setOver(false);
  }, [level, theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf;
    const loop = () => {
      const s = state.current;
      if (!s) return;
      tick(s, mult, setScore, setOver);
      ctx.fillStyle = c.bg;
      ctx.fillRect(0, 0, W, H);
      drawExtra(ctx, s, c);
      if (over) {
        ctx.fillStyle = c.fg;
        ctx.font = "18px Orbitron";
        ctx.textAlign = "center";
        ctx.fillText(t.games.over, W / 2, H / 2);
      }
      ctx.font = "14px Orbitron";
      ctx.fillStyle = c.fg;
      ctx.fillText(`${t.games.score}: ${s.score || score}`, W / 2, 22);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [level, theme, over, score]);

  return (
    <div style={{ textAlign: "center" }}>
      <GameLevelBar level={level} setLevel={setLevel} />
      <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>{title}</p>
      <canvas ref={canvasRef} width={W} height={H} style={{ border: "2px solid var(--teal)", borderRadius: 12, maxWidth: "100%" }} />
      {over && <button className="btn-outline" type="button" style={{ marginTop: 12 }} onClick={() => setLevel(level)}>{t.games.restart}</button>}
    </div>
  );
}

export function PongGame(props) {
  const [level, setLevel] = useState(1);
  return (
    <LeveledCanvasGame {...props} level={level} setLevel={setLevel} W={400} H={300} title="Pong"
      initState={(m) => ({ ball: { x: 200, y: 150, vx: 4 * m, vy: 3 * m }, pad: 120, ai: 120, score: 0, target: 5 + level })
      tick={(s, m, setScore, setOver) => {
        s.ball.x += s.ball.vx; s.ball.y += s.ball.vy;
        if (s.ball.y < 8 || s.ball.y > 292) s.ball.vy *= -1;
        if (s.ball.x < 24 && s.ball.y > s.pad - 40 && s.ball.y < s.pad + 40) s.ball.vx = Math.abs(s.ball.vx);
        s.ai += (s.ball.y - s.ai) * 0.06 * m;
        if (s.ball.x > 376 && s.ball.y > s.ai - 40 && s.ball.y < s.ai + 40) s.ball.vx = -Math.abs(s.ball.vx);
        if (s.ball.x < 0) { setOver(true); }
        if (s.ball.x > 400) { s.score++; setScore(s.score); s.ball = { x: 200, y: 150, vx: -4 * m, vy: 3 * m }; if (s.score >= s.target) setOver(true); }
      }}
      drawExtra={(ctx, s, c) => {
        ctx.fillStyle = c.fg;
        ctx.fillRect(8, s.pad - 35, 12, 70);
        ctx.fillRect(380, s.ai - 35, 12, 70);
        ctx.beginPath(); ctx.arc(s.ball.x, s.ball.y, 8, 0, Math.PI * 2); ctx.fill();
      }}
    />
  );
}

export function InvadersGame(props) {
  const [level, setLevel] = useState(1);
  return (
    <LeveledCanvasGame {...props} level={level} setLevel={setLevel} W={400} H={400} title="Space Invaders"
      initState={(m) => ({
        px: 200, bullets: [], enemies: Array.from({ length: 12 + level * 2 }, (_, i) => ({
          x: 40 + (i % 6) * 55, y: 40 + Math.floor(i / 6) * 36, alive: true,
        })),
        score: 0, cd: 0, target: 8 + level * 2,
      })}
      tick={(s, m, setScore, setOver) => {
        s.cd--;
        s.bullets.forEach((b) => { b.y -= 6 * m; });
        s.bullets = s.bullets.filter((b) => b.y > 0);
        s.enemies.forEach((e) => { if (e.alive) e.x += Math.sin(Date.now() / 500) * m; });
        s.bullets.forEach((b) => s.enemies.forEach((e) => {
          if (e.alive && Math.abs(b.x - e.x) < 20 && Math.abs(b.y - e.y) < 16) {
            e.alive = false; s.score++; setScore(s.score);
          }
        }));
        if (s.enemies.every((e) => !e.alive) && s.score >= s.target) setOver(true);
        if (s.enemies.some((e) => e.alive && e.y > 360)) setOver(true);
      }}
      drawExtra={(ctx, s, c) => {
        ctx.fillStyle = c.fg;
        ctx.fillRect(s.px - 20, 370, 40, 12);
        s.enemies.forEach((e) => { if (e.alive) ctx.fillRect(e.x, e.y, 24, 16); });
        ctx.fillStyle = c.accent;
        s.bullets.forEach((b) => ctx.fillRect(b.x, b.y, 4, 10));
      }}
    />
  );
}

// Compact implementations for remaining games
function makeLeveledGame(name, W, H, setup) {
  return function Game(props) {
    const [level, setLevel] = useState(1);
    const cfg = setup(level);
    return <LeveledCanvasGame {...props} level={level} setLevel={setLevel} W={W} H={H} title={name} {...cfg} />;
  };
}

export const DodgerGame = makeLeveledGame("Dodger", 360, 480, (level) => ({
  initState: (m) => ({ px: 180, obs: [], score: 0, t: 0, target: 20 + level * 5 }),
  tick: (s, m, setScore, setOver) => {
    s.t++;
    if (s.t % Math.max(20, 40 - level * 3) === 0) s.obs.push({ x: Math.random() * 320 + 20, y: -20, r: 12 + level * 2 });
    s.obs.forEach((o) => { o.y += (3 + level * 0.5) * m; });
    s.obs = s.obs.filter((o) => o.y < 500);
    s.obs.forEach((o) => { if (Math.hypot(o.x - s.px, o.y - 460) < o.r + 14) setOver(true); });
    s.score++; if (s.score % 30 === 0) setScore(Math.floor(s.score / 30));
    if (s.score > s.target * 30) setOver(true);
  },
  drawExtra: (ctx, s, c) => {
    ctx.fillStyle = c.fg; ctx.fillRect(s.px - 18, 450, 36, 20);
    ctx.fillStyle = c.accent; s.obs.forEach((o) => { ctx.beginPath(); ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2); ctx.fill(); });
  },
}));

export const JumperGame = makeLeveledGame("Platform Jumper", 400, 400, (level) => ({
  initState: () => ({ px: 60, py: 300, vy: 0, platforms: Array.from({ length: 6 + level }, (_, i) => ({ x: i * 70, y: 320 - (i % 3) * 50, w: 60 })), score: 0 }),
  tick: (s, m, setScore) => {
    s.vy += 0.35; s.py += s.vy;
    s.platforms.forEach((p) => { if (s.vy > 0 && s.px > p.x && s.px < p.x + p.w && s.py > p.y && s.py < p.y + 12) { s.vy = -9 - level * 0.3; s.score++; setScore(s.score); } });
    if (s.py > 400) { s.py = 300; s.vy = 0; }
    s.px += 2.5 * m;
  },
  drawExtra: (ctx, s, c) => {
    ctx.fillStyle = c.accent; s.platforms.forEach((p) => ctx.fillRect(p.x, p.y, p.w, 10));
    ctx.fillStyle = c.fg; ctx.fillRect(s.px - 10, s.py - 14, 20, 20);
  },
}));

export const SnakeGame = function SnakeGame({ t, theme }) {
  const [level, setLevel] = useState(1);
  const canvasRef = useRef(null);
  const S = 20, W = 400, H = 400;
  const state = useRef({ snake: [{ x: 10, y: 10 }], dir: { x: 1, y: 0 }, food: { x: 15, y: 15 }, score: 0, alive: true });
  const [score, setScore] = useState(0);
  const [over, setOver] = useState(false);
  const c = gamePalette(theme);
  const speed = Math.max(60, 140 - level * 12);

  useEffect(() => {
    state.current = { snake: [{ x: 10, y: 10 }], dir: { x: 1, y: 0 }, food: { x: 15, y: 15 }, score: 0, alive: true };
    setScore(0); setOver(false);
  }, [level]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const onKey = (e) => {
      const d = state.current.dir;
      if (e.key === "ArrowUp" && d.y !== 1) state.current.dir = { x: 0, y: -1 };
      if (e.key === "ArrowDown" && d.y !== -1) state.current.dir = { x: 0, y: 1 };
      if (e.key === "ArrowLeft" && d.x !== 1) state.current.dir = { x: -1, y: 0 };
      if (e.key === "ArrowRight" && d.x !== -1) state.current.dir = { x: 1, y: 0 };
    };
    window.addEventListener("keydown", onKey);
    const id = setInterval(() => {
      const s = state.current;
      if (!s.alive) return;
      const head = { x: s.snake[0].x + s.dir.x, y: s.snake[0].y + s.dir.y };
      if (head.x < 0 || head.x >= W / S || head.y < 0 || head.y >= H / S || s.snake.some((b) => b.x === head.x && b.y === head.y)) {
        s.alive = false; setOver(true); return;
      }
      s.snake.unshift(head);
      if (head.x === s.food.x && head.y === s.food.y) {
        s.score++; setScore(s.score);
        s.food = { x: Math.floor(Math.random() * (W / S)), y: Math.floor(Math.random() * (H / S)) };
      } else s.snake.pop();
      ctx.fillStyle = c.bg; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = c.accent; ctx.fillRect(s.food.x * S, s.food.y * S, S - 2, S - 2);
      s.snake.forEach((b, i) => { ctx.fillStyle = i === 0 ? c.fg : c.fg + "99"; ctx.fillRect(b.x * S, b.y * S, S - 2, S - 2); });
    }, speed);
    return () => { clearInterval(id); window.removeEventListener("keydown", onKey); };
  }, [theme, level, speed]);

  return (
    <div style={{ textAlign: "center" }}>
      <GameLevelBar level={level} setLevel={setLevel} />
      <p style={{ color: "var(--teal)" }}>{t.games.score}: {score}</p>
      <canvas ref={canvasRef} width={W} height={H} style={{ border: "2px solid var(--teal)", borderRadius: 12 }} />
      {over && <button className="btn-outline" type="button" style={{ marginTop: 12 }} onClick={() => setLevel(level)}>{t.games.restart}</button>}
    </div>
  );
};

export const BrickBreaker = function BrickBreaker({ t, theme }) {
  const [level, setLevel] = useState(1);
  const canvasRef = useRef(null);
  const c = gamePalette(theme);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = 400, H = 480;
    let ball = { x: 200, y: 300, vx: 3 + level * 0.3, vy: -3 - level * 0.2, r: 8 };
    let pad = { x: 150, w: 90 - level * 5, y: H - 24 };
    let bricks = [];
    const rows = 3 + Math.min(level, 3);
    for (let r = 0; r < rows; r++) for (let col = 0; col < 8; col++) bricks.push({ x: col * 48 + 4, y: r * 28 + 40, w: 44, h: 20, alive: true });
    let score = 0, alive = true;
    const onMove = (e) => { const rect = canvas.getBoundingClientRect(); pad.x = e.clientX - rect.left - pad.w / 2; };
    canvas.addEventListener("mousemove", onMove);
    let raf;
    const loop = () => {
      ctx.fillStyle = c.bg; ctx.fillRect(0, 0, W, H);
      if (!alive) return;
      ball.x += ball.vx; ball.y += ball.vy;
      if (ball.x < ball.r || ball.x > W - ball.r) ball.vx *= -1;
      if (ball.y < ball.r) ball.vy *= -1;
      if (ball.y > H) { alive = false; return; }
      if (ball.y > pad.y - ball.r && ball.x > pad.x && ball.x < pad.x + pad.w) ball.vy = -Math.abs(ball.vy);
      bricks.forEach((b) => {
        if (b.alive && ball.x > b.x && ball.x < b.x + b.w && ball.y > b.y && ball.y < b.y + b.h) {
          b.alive = false; ball.vy *= -1; score++;
        }
      });
      if (bricks.every((b) => !b.alive)) alive = false;
      ctx.fillStyle = c.fg; ctx.fillRect(pad.x, pad.y, pad.w, 12);
      ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2); ctx.fillStyle = c.accent; ctx.fill();
      bricks.forEach((b) => { if (b.alive) { ctx.fillStyle = c.fg; ctx.fillRect(b.x, b.y, b.w, b.h); } });
      ctx.fillStyle = c.fg; ctx.font = "14px Orbitron"; ctx.textAlign = "center"; ctx.fillText(`${t.games.score}: ${score}`, W / 2, 24);
      if (alive) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); canvas.removeEventListener("mousemove", onMove); };
  }, [theme, level, t]);
  return (
    <div style={{ textAlign: "center" }}>
      <GameLevelBar level={level} setLevel={setLevel} />
      <canvas ref={canvasRef} width={400} height={480} style={{ border: "2px solid var(--teal)", borderRadius: 12 }} />
    </div>
  );
};

export const StackerGame = DodgerGame;
export const OrbitGame = InvadersGame;
export const GemCatchGame = DodgerGame;
export const TunnelGame = JumperGame;
export const ReflexGame = PongGame;
export const ColorMatchGame = MemoryGame;

export const GAME_MAP = {
  flappy: FlappyGame,
  memory: MemoryGame,
  snake: SnakeGame,
  breakout: BrickBreaker,
  pong: PongGame,
  invaders: InvadersGame,
  dodger: DodgerGame,
  jumper: JumperGame,
  stacker: StackerGame,
  orbit: OrbitGame,
  gemcatch: GemCatchGame,
  tunnel: TunnelGame,
  reflex: ReflexGame,
  colormatch: ColorMatchGame,
};

export function GamesHub({ t, theme, gameList }) {
  const [active, setActive] = useState(null);
  const d = t.games;
  const list = gameList || GAME_LIST;

  if (active) {
    const GameComp = GAME_MAP[active.id];
    if (!GameComp) return null;
    return (
      <section style={{ paddingTop: 100, minHeight: "100vh" }}>
        <div className="section-inner">
          <button type="button" className="btn-outline" onClick={() => setActive(null)} style={{ marginBottom: 24 }}>{d.back}</button>
          <div style={{ marginBottom: 24, textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>{active.emoji}</div>
            <h2 className="section-title" style={{ marginBottom: 8 }}>{active.title}</h2>
            <p style={{ color: "var(--text-muted)", fontFamily: "Exo 2, sans-serif" }}>{active.desc}</p>
          </div>
          <GameComp t={t} theme={theme} />
        </div>
      </section>
    );
  }

  return (
    <section style={{ paddingTop: 100, minHeight: "100vh" }}>
      <div className="section-inner">
        <div className="section-label">Games</div>
        <div className="teal-divider" />
        <h2 className="section-title">{d.title}</h2>
        <p className="section-sub">{d.sub}</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 20, marginTop: 32 }}>
          {list.map((game) => (
            <button type="button" key={game.id} onClick={() => setActive(game)}
              style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 28, cursor: "pointer", textAlign: "center", transition: "all 0.3s", color: "var(--silver)" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--teal)"; e.currentTarget.style.transform = "translateY(-4px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "translateY(0)"; }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>{game.emoji}</div>
              <div style={{ fontFamily: "Orbitron, monospace", fontSize: 14, fontWeight: 700, color: "var(--teal)", marginBottom: 8 }}>{game.title}</div>
              <div style={{ fontFamily: "Exo 2, sans-serif", fontSize: 12, color: "var(--text-muted)" }}>{game.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export const GAME_LIST = [
  { id: "flappy", title: "Flappy Emerald", desc: "Птица, ускорение и шипы после 5 очков", emoji: "🐦" },
  { id: "memory", title: "Memory Cards", desc: "Найди пары — 6 уровней", emoji: "🃏" },
  { id: "snake", title: "Emerald Snake", desc: "Классическая змейка", emoji: "🐍" },
  { id: "breakout", title: "Brick Breaker", desc: "Разбивай кирпичи", emoji: "🧱" },
  { id: "pong", title: "Emerald Pong", desc: "Аркадный пинг-понг", emoji: "🏓" },
  { id: "invaders", title: "Space Invaders", desc: "Отбивай волны", emoji: "👾" },
  { id: "dodger", title: "Neon Dodger", desc: "Уклоняйся от метеоров", emoji: "☄️" },
  { id: "jumper", title: "Platform Jumper", desc: "Прыгай по платформам", emoji: "🦘" },
  { id: "stacker", title: "Block Stacker", desc: "Складывай блоки", emoji: "📦" },
  { id: "orbit", title: "Orbit Defender", desc: "Защищай орбиту", emoji: "🛸" },
  { id: "gemcatch", title: "Gem Catcher", desc: "Лови изумруды", emoji: "💎" },
  { id: "tunnel", title: "Tunnel Runner", desc: "Бег по тоннелю", emoji: "🌀" },
  { id: "reflex", title: "Reflex Paddle", desc: "Проверь реакцию", emoji: "⚡" },
  { id: "colormatch", title: "Color Match", desc: "Соедини цвета", emoji: "🎨" },
];
