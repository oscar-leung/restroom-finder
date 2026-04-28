import { useEffect, useRef, useState } from "react";

/**
 * LoadingGame — Chrome dinosaur style, but with a sprinting toilet
 * jumping over plungers and toilet-paper rolls.
 *
 * Plays during the "Finding bathrooms near you…" loading state. Tap
 * the canvas (or hit space) to jump. Score increments per cleared
 * obstacle. Best score persists in localStorage.
 *
 * Pure canvas + vanilla game loop. ~3 KB minified.
 */
const BEST_KEY = "gg_loading_game_best";

export default function LoadingGame({ message = "Finding bathrooms near you…" }) {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => {
    try { return Number(localStorage.getItem(BEST_KEY)) || 0; } catch { return 0; }
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;

    // Game state
    const state = {
      y: 0,            // toilet vertical offset (0 = on ground, negative = up)
      vy: 0,           // velocity
      jumping: false,
      obstacles: [],   // [{ x, type: "plunger" | "tp" }]
      lastSpawn: 0,
      lastTime: 0,
      score: 0,
      speed: 3,
      gameOver: false,
      hits: 0,
    };

    const groundY = H - 22;
    const toiletX = 32;

    const drawToilet = (x, y) => {
      // Tank
      ctx.fillStyle = "white";
      ctx.strokeStyle = "#0f172a";
      ctx.lineWidth = 1.5;
      ctx.fillRect(x + 12, y - 28, 14, 18);
      ctx.strokeRect(x + 12, y - 28, 14, 18);
      // Bowl
      ctx.beginPath();
      ctx.ellipse(x + 8, y - 4, 16, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Eye
      ctx.fillStyle = "#0f172a";
      ctx.beginPath();
      ctx.arc(x + 4, y - 6, 1.6, 0, Math.PI * 2);
      ctx.fill();
      // Tiny legs
      const legBob = state.jumping ? 0 : Math.sin(state.lastTime / 80) * 1.5;
      ctx.fillStyle = "white";
      ctx.fillRect(x - 2, y + 4 + legBob, 4, 6);
      ctx.fillRect(x + 12, y + 4 - legBob, 4, 6);
      ctx.strokeRect(x - 2, y + 4 + legBob, 4, 6);
      ctx.strokeRect(x + 12, y + 4 - legBob, 4, 6);
    };

    const drawPlunger = (x, y) => {
      // Stick
      ctx.fillStyle = "#7c2d12";
      ctx.fillRect(x + 4, y - 16, 3, 18);
      // Cup
      ctx.fillStyle = "#dc2626";
      ctx.beginPath();
      ctx.ellipse(x + 5, y, 7, 4, 0, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawTPRoll = (x, y) => {
      ctx.fillStyle = "#fef3c7";
      ctx.strokeStyle = "#0f172a";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(x + 6, y - 4, 7, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Center hole
      ctx.fillStyle = "#a16207";
      ctx.beginPath();
      ctx.ellipse(x + 6, y - 4, 2, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();
    };

    const reset = () => {
      state.obstacles = [];
      state.score = 0;
      state.speed = 3;
      state.gameOver = false;
      state.hits = 0;
      state.y = 0;
      state.vy = 0;
      setScore(0);
    };

    const jump = () => {
      if (state.jumping || state.gameOver) {
        if (state.gameOver) reset();
        return;
      }
      state.jumping = true;
      state.vy = -9;
    };

    const loop = (t) => {
      state.lastTime = t;

      // Physics
      if (state.jumping) {
        state.vy += 0.55;
        state.y += state.vy;
        if (state.y >= 0) {
          state.y = 0;
          state.vy = 0;
          state.jumping = false;
        }
      }

      if (!state.gameOver) {
        // Spawn obstacles. Faster as score climbs.
        const spawnGap = Math.max(700, 1400 - state.score * 25);
        if (t - state.lastSpawn > spawnGap + Math.random() * 400) {
          state.obstacles.push({
            x: W,
            type: Math.random() > 0.5 ? "plunger" : "tp",
            scored: false,
          });
          state.lastSpawn = t;
        }
        // Move
        state.speed = 3 + state.score * 0.05;
        for (const o of state.obstacles) {
          o.x -= state.speed;
          if (o.x < toiletX && !o.scored) {
            o.scored = true;
            state.score += 1;
            setScore(state.score);
          }
        }
        state.obstacles = state.obstacles.filter((o) => o.x > -30);

        // Collide
        for (const o of state.obstacles) {
          if (
            o.x < toiletX + 20 &&
            o.x + 12 > toiletX &&
            state.y > -16
          ) {
            state.gameOver = true;
            // Save best
            if (state.score > best) {
              try { localStorage.setItem(BEST_KEY, String(state.score)); } catch {}
              setBest(state.score);
            }
          }
        }
      }

      // Draw
      ctx.clearRect(0, 0, W, H);

      // Ground line
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, groundY + 2);
      ctx.lineTo(W, groundY + 2);
      ctx.stroke();

      // Obstacles
      for (const o of state.obstacles) {
        if (o.type === "plunger") drawPlunger(o.x, groundY);
        else drawTPRoll(o.x, groundY);
      }

      // Toilet
      drawToilet(toiletX, groundY + state.y);

      // Game-over overlay
      if (state.gameOver) {
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "#7c3aed";
        ctx.font = "700 14px system-ui";
        ctx.textAlign = "center";
        ctx.fillText("you got flushed", W / 2, H / 2 - 6);
        ctx.fillStyle = "#64748b";
        ctx.font = "500 11px system-ui";
        ctx.fillText("tap to retry", W / 2, H / 2 + 12);
      }

      raf = requestAnimationFrame(loop);
    };

    let raf = requestAnimationFrame(loop);

    const onKey = (e) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        jump();
      }
    };
    canvas.addEventListener("pointerdown", jump);
    window.addEventListener("keydown", onKey);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKey);
      canvas.removeEventListener("pointerdown", jump);
    };
  }, [best]);

  return (
    <div className="loading-game-wrap">
      <p className="loading-game-message">{message}</p>
      <canvas
        ref={canvasRef}
        width={320}
        height={140}
        className="loading-game-canvas"
        aria-label="Mini game while data loads — tap to jump"
      />
      <div className="loading-game-meta">
        <span>tap or space to jump</span>
        <span className="loading-game-score">
          <strong>{score}</strong>
          <span className="loading-game-best">best {best}</span>
        </span>
      </div>
    </div>
  );
}
