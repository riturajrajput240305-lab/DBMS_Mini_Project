import { useRef, useEffect, useCallback } from 'react';
import './Starfield.css';

// Iconic moments in cricket history
const CRICKET_DATES = [
  { year: '1877', date: '15 MAR 1877', event: 'First Ever Test Match (AUS vs ENG)' },
  { year: '1882', date: '29 AUG 1882', event: 'Birth of The Ashes at The Oval' },
  { year: '1932', date: '25 JUN 1932', event: "India's First Test Match at Lord's" },
  { year: '1948', date: '18 AUG 1948', event: "Bradman's Farewell (99.94 Average)" },
  { year: '1971', date: '05 JAN 1971', event: 'First Ever ODI Match (Melbourne)' },
  { year: '1975', date: '21 JUN 1975', event: 'First Cricket World Cup (West Indies)' },
  { year: '1979', date: '23 JUN 1979', event: 'Clive Lloyd Retains World Cup' },
  { year: '1983', date: '18 JUN 1983', event: 'Kapil Dev 175* vs Zimbabwe' },
  { year: '1983', date: '25 JUN 1983', event: "Kapil's Devils Lift World Cup at Lord's" },
  { year: '1986', date: '18 APR 1986', event: 'Miandad Last-Ball Six in Sharjah' },
  { year: '1987', date: '08 NOV 1987', event: 'Australia Win First World Cup (Eden Gardens)' },
  { year: '1992', date: '25 MAR 1992', event: "Imran Khan's Cornered Tigers Win WC" },
  { year: '1993', date: '04 JUN 1993', event: 'Shane Warne Ball of the Century' },
  { year: '1996', date: '17 MAR 1996', event: 'Sri Lanka Win World Cup (Lahore)' },
  { year: '1999', date: '17 JUN 1999', event: 'Klusener-Donald Epic Semi-Final Tie' },
  { year: '1999', date: '20 JUN 1999', event: 'Australia Lift 1999 World Cup at Lord\'s' },
  { year: '2001', date: '15 MAR 2001', event: 'Laxman 281 & Dravid 180 Eden Miracle' },
  { year: '2002', date: '13 JUL 2002', event: "Ganguly Waves Shirt at Lord's Balcony" },
  { year: '2003', date: '23 MAR 2003', event: 'Ponting 140* Dominates World Cup Final' },
  { year: '2007', date: '19 SEP 2007', event: 'Yuvraj Singh 6 Sixes in an Over' },
  { year: '2007', date: '24 SEP 2007', event: 'India Win Inaugural T20 World Cup' },
  { year: '2008', date: '18 APR 2008', event: 'McCullum 158* Ignites Inaugural IPL' },
  { year: '2008', date: '01 JUN 2008', event: 'Rajasthan Royals Win Inaugural IPL' },
  { year: '2010', date: '24 FEB 2010', event: 'Sachin First Ever 200* in ODI History' },
  { year: '2011', date: '02 APR 2011', event: 'Dhoni Finishes Off in Style! WC Champions' },
  { year: '2012', date: '16 MAR 2012', event: 'Sachin Scores 100th International 100' },
  { year: '2013', date: '23 JUN 2013', event: 'India Win ICC Champions Trophy' },
  { year: '2013', date: '16 NOV 2013', event: 'Sachin Tendulkar Farewell at Wankhede' },
  { year: '2014', date: '13 NOV 2014', event: 'Rohit Sharma Historic 264 vs Sri Lanka' },
  { year: '2015', date: '29 MAR 2015', event: 'Australia 5th World Cup Title (MCG)' },
  { year: '2016', date: '03 APR 2016', event: 'Brathwaite "Remember the Name" 4 Sixes' },
  { year: '2019', date: '14 JUL 2019', event: 'England Win World Cup in Super Over' },
  { year: '2021', date: '19 JAN 2021', event: "India Breaches Gabba Fortress" },
  { year: '2022', date: '23 OCT 2022', event: 'Virat Kohli 82* Masterclass vs PAK' },
  { year: '2023', date: '19 NOV 2023', event: 'Australia 6th ODI World Cup Win' },
  { year: '2024', date: '29 JUN 2024', event: 'India Crowned T20 World Champions (Barbados)' },
];

const MAX_GLOW_DIST = 160;
const SAFE_EDGE_PADDING = 70; // Keep dates comfortably inside screen edges

// Exclusion zone strictly over the centered hero title
function isInHeroTitleExclusionZone(x, y, width, scrollY) {
  if (scrollY > 450) return false;
  const centerX = width / 2;
  const halfTextWidth = Math.min(width * 0.46, 360);
  const inX = Math.abs(x - centerX) < halfTextWidth;
  const inY = y >= 40 && y <= 460;
  return inX && inY;
}

function createDateNodes(width, height) {
  const nodes = [];
  const centerX = width / 2;
  const totalCount = Math.max(35, Math.min(65, Math.floor((width * height) / 28000)));

  // If wide screen, seed left and right flanking dates for hero title
  if (width >= 900) {
    const flankCount = 6;
    // Left flank
    for (let i = 0; i < flankCount; i++) {
      const item = CRICKET_DATES[i % CRICKET_DATES.length];
      const minX = SAFE_EDGE_PADDING;
      const maxX = Math.max(minX + 20, centerX - 320);
      nodes.push({
        x: minX + Math.random() * (maxX - minX),
        y: 80 + Math.random() * 260,
        year: item.year,
        date: item.date,
        event: item.event,
        baseFontSize: 11 + Math.round(Math.random() * 4),
        baseAlpha: 0.16 + Math.random() * 0.25,
        twinkleSpeed: 0.5 + Math.random() * 1.5,
        twinkleOffset: Math.random() * Math.PI * 2,
        vx: (Math.random() - 0.5) * 0.06,
        vy: (Math.random() - 0.5) * 0.06,
      });
    }

    // Right flank
    for (let i = 0; i < flankCount; i++) {
      const item = CRICKET_DATES[(i + flankCount) % CRICKET_DATES.length];
      const minX = Math.min(width - SAFE_EDGE_PADDING - 40, centerX + 320);
      const maxX = width - SAFE_EDGE_PADDING;
      nodes.push({
        x: minX + Math.random() * Math.max(20, maxX - minX),
        y: 80 + Math.random() * 260,
        year: item.year,
        date: item.date,
        event: item.event,
        baseFontSize: 11 + Math.round(Math.random() * 4),
        baseAlpha: 0.16 + Math.random() * 0.25,
        twinkleSpeed: 0.5 + Math.random() * 1.5,
        twinkleOffset: Math.random() * Math.PI * 2,
        vx: (Math.random() - 0.5) * 0.06,
        vy: (Math.random() - 0.5) * 0.06,
      });
    }
  }

  // Distribute rest safely within viewport bounds
  for (let i = nodes.length; i < totalCount; i++) {
    const item = CRICKET_DATES[i % CRICKET_DATES.length];
    let x, y;
    let attempts = 0;
    do {
      x = SAFE_EDGE_PADDING + Math.random() * (width - SAFE_EDGE_PADDING * 2);
      y = 40 + Math.random() * (height - 80);
      attempts++;
    } while (isInHeroTitleExclusionZone(x, y, width, 0) && attempts < 15);

    nodes.push({
      x,
      y,
      year: item.year,
      date: item.date,
      event: item.event,
      baseFontSize: 10 + Math.round(Math.random() * 5),
      baseAlpha: 0.12 + Math.random() * 0.26,
      twinkleSpeed: 0.4 + Math.random() * 1.6,
      twinkleOffset: Math.random() * Math.PI * 2,
      vx: (Math.random() - 0.5) * 0.08,
      vy: (Math.random() - 0.5) * 0.08,
    });
  }

  return nodes;
}

export default function Starfield() {
  const canvasRef = useRef(null);
  const nodesRef = useRef([]);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef(null);
  const sizeRef = useRef({ w: 0, h: 0 });

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    // Fixed viewport sizing
    const w = window.innerWidth;
    const h = window.innerHeight;
    sizeRef.current = { w, h };
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    nodesRef.current = createDateNodes(w, h);
  }, []);

  const draw = useCallback((time) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { w, h } = sizeRef.current;
    ctx.clearRect(0, 0, w, h);

    const mx = mouseRef.current.x;
    const my = mouseRef.current.y;
    const scrollY = window.scrollY;

    // Single closest node to cursor
    let closestNode = null;
    let minDistance = MAX_GLOW_DIST;

    if (mx >= 0 && mx <= w && my >= 0 && my <= h) {
      for (const node of nodesRef.current) {
        if (isInHeroTitleExclusionZone(node.x, node.y, w, scrollY)) continue;
        const dx = node.x - mx;
        const dy = node.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minDistance) {
          minDistance = dist;
          closestNode = node;
        }
      }
    }

    for (const node of nodesRef.current) {
      // Gentle drift with safe edge bounce
      node.x += node.vx;
      node.y += node.vy;

      if (node.x < SAFE_EDGE_PADDING) {
        node.x = SAFE_EDGE_PADDING;
        node.vx *= -1;
      } else if (node.x > w - SAFE_EDGE_PADDING) {
        node.x = w - SAFE_EDGE_PADDING;
        node.vx *= -1;
      }

      if (node.y < 30) {
        node.y = 30;
        node.vy *= -1;
      } else if (node.y > h - 30) {
        node.y = h - 30;
        node.vy *= -1;
      }

      // Skip rendering if over the centered hero title
      if (isInHeroTitleExclusionZone(node.x, node.y, w, scrollY)) {
        continue;
      }

      // Subtle twinkling
      const twinkle = Math.sin(time * 0.001 * node.twinkleSpeed + node.twinkleOffset);
      let alpha = node.baseAlpha + twinkle * 0.08;

      const isClosest = node === closestNode;
      let proximity = 0;
      let scaleBoost = 0;
      let glowRadius = 0;

      if (isClosest) {
        proximity = 1 - minDistance / MAX_GLOW_DIST;
        const ease = proximity * proximity;
        alpha = Math.min(1, alpha + ease * 0.85);
        scaleBoost = ease * 0.45;
        glowRadius = ease * 16;
      }

      alpha = Math.max(0.08, Math.min(1, alpha));
      const fontSize = Math.round(node.baseFontSize * (1 + scaleBoost));

      ctx.save();

      // Outer glow bloom only for the single active date
      if (isClosest && glowRadius > 1) {
        const glowGrad = ctx.createRadialGradient(node.x, node.y, 2, node.x, node.y, glowRadius * 2);
        glowGrad.addColorStop(0, `rgba(255, 255, 255, ${proximity * 0.4})`);
        glowGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.beginPath();
        ctx.arc(node.x, node.y, glowRadius * 2, 0, Math.PI * 2);
        ctx.fillStyle = glowGrad;
        ctx.fill();
      }

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      if (isClosest && proximity > 0.25) {
        // Glowing highlighted single date + subtitle
        ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
        ctx.shadowBlur = proximity * 14;

        ctx.font = `700 ${fontSize + 1}px 'Inter', sans-serif`;
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fillText(`✦ ${node.date}`, node.x, node.y - 8);

        ctx.font = `500 11px 'Inter', sans-serif`;
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, alpha * 0.9)})`;
        ctx.shadowBlur = proximity * 6;
        ctx.fillText(node.event, node.x, node.y + 10);
      } else {
        // Normal star-like date label
        ctx.shadowBlur = 0;
        ctx.font = `600 ${fontSize}px 'Inter', monospace`;
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fillText(node.year, node.x, node.y);
      }

      ctx.restore();
    }

    rafRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    resize();
    rafRef.current = requestAnimationFrame(draw);

    const onMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    const onMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [resize, draw]);

  return <canvas ref={canvasRef} className="starfield" />;
}
