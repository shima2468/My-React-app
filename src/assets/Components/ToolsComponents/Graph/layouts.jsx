// src/assets/Components/ToolsUI/Graph/layouts.js
const byId = (arr) => Object.fromEntries(arr.map((n) => [n.id, n]));

export function layoutCircular(g, w, h) {
  const nodes = g.nodes.map((n) => ({ ...n }));
  const links = g.links.map((l) => ({ ...l }));
  const cx = w / 2, cy = h / 2;
  const root = nodes.find((n) => n.type === "root");
  if (root) { root.x = cx; root.y = cy; }
  const others = nodes.filter((n) => n !== root);
  const r = Math.min(w, h) * 0.32;
  others.forEach((n, i) => {
    const a = (i / others.length) * Math.PI * 2;
    n.x = cx + r * Math.cos(a);
    n.y = cy + r * Math.sin(a);
  });
  return { nodes, links };
}

export function layoutHierarchicalSmart(g, w, h, R = { concept: 30, entity: 30 }) {
  const nodes = g.nodes.map((n) => ({ ...n }));
  const links = g.links.map((l) => ({ ...l }));
  const map = byId(nodes);
  const marginTop = 40, marginBot = 40;
  const topY = marginTop, botY = h - marginBot;
  const leftX = 120, midX = Math.round(w * 0.4), rightX = w - 140;

  const adj = {};
  for (const l of links) {
    adj[l.source] = adj[l.source] || new Set();
    adj[l.target] = adj[l.target] || new Set();
    adj[l.source].add(l.target);
    adj[l.target].add(l.source);
  }

  const root = nodes.find((n) => n.type === "root");
  if (root) { root.x = midX; root.y = h / 2; }

  const concepts = nodes.filter((n) => n.type === "concept");
  const others   = nodes.filter((n) => n.type !== "concept" && n.type !== "root");

  const gapC = Math.max(R.concept * 3.0, 100);
  const firstY = Math.max(topY, (h - gapC * (Math.max(1, concepts.length) - 1)) / 2);

  concepts.forEach((n, i) => { n.x = leftX; n.y = Math.min(botY, firstY + i * gapC); });

  const childGap = Math.max(R.entity * 2 + 14, 54);
  const minGap   = Math.max(R.entity * 2 + 6, 46);

  const proposals = [];
  const seen = new Set();

  for (const c of concepts) {
    const kids = Array.from(adj[c.id] || [])
      .map((id) => map[id])
      .filter((n) => n && n.type !== "root" && n.type !== "concept");
    if (!kids.length) continue;
    const center = (kids.length - 1) / 2;
    kids.forEach((k, j) => proposals.push({ id: k.id, yWant: c.y + (j - center) * childGap }));
  }

  if (root) {
    const rootKids = Array.from(adj[root.id] || [])
      .map((id) => map[id])
      .filter((n) => n && n.type !== "concept" && n.id !== root.id);
    rootKids.forEach((rk, idx) => proposals.push({ id: rk.id, yWant: firstY + idx * childGap * 0.8 }));
  }

  proposals.sort((a, b) => a.yWant - b.yWant);
  let nextY = topY;
  for (const p of proposals) {
    if (seen.has(p.id)) continue;
    const n = map[p.id]; if (!n) continue;
    n.x = rightX;
    n.y = Math.min(botY, Math.max(p.yWant, nextY));
    nextY = n.y + minGap;
    seen.add(n.id);
  }

  for (const n of others) {
    if (seen.has(n.id)) continue;
    n.x = rightX;
    n.y = Math.min(botY, nextY);
    nextY = n.y + minGap;
    seen.add(n.id);
  }
  return { nodes, links };
}

export function layoutForce(g, w, h, steps = 220) {
  const nodes = g.nodes.map((n) => ({ ...n, x: n.x ?? Math.random() * w, y: n.y ?? Math.random() * h, vx: 0, vy: 0 }));
  const links = g.links.map((l) => ({ ...l }));
  const kLink = 0.03, rest = 140, repulse = 4000, damping = 0.9;
  const dict = Object.fromEntries(nodes.map(n => [n.id, n]));

  for (let s = 0; s < steps; s++) {
    for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j];
      let dx = a.x - b.x, dy = a.y - b.y;
      let d2 = dx*dx + dy*dy + 0.01;
      const f = repulse / d2, inv = 1 / Math.sqrt(d2);
      const fx = dx * inv * f, fy = dy * inv * f;
      a.vx += fx; a.vy += fy; b.vx -= fx; b.vy -= fy;
    }
    for (const l of links) {
      const a = dict[l.source], b = dict[l.target];
      const dx = b.x - a.x, dy = b.y - a.y;
      const d = Math.sqrt(dx*dx + dy*dy) || 0.001;
      const diff = (d - rest) * kLink, inv = 1 / d;
      const fx = dx * inv * diff, fy = dy * inv * diff;
      a.vx += fx; a.vy += fy; b.vx -= fx; b.vy -= fy;
    }
    for (const n of nodes) {
      if (n.type === "root") { n.vx += (w/2 - n.x) * 0.02; n.vy += (h/2 - n.y) * 0.02; }
      n.x += (n.vx *= damping); n.y += (n.vy *= damping);
      n.x = Math.max(60, Math.min(w - 60, n.x));
      n.y = Math.max(60, Math.min(h - 60, n.y));
    }
  }
  return { nodes, links };
}
