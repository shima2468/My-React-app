import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";

const DEFAULT_SIZE = { w: 880, h: 460 };

const R = { root: 35, concept: 30, entity: 30, relation: 22 };
const getR = (t) =>
  t === "root" ? R.root : t === "concept" ? R.concept : t === "entity" ? R.entity : R.relation;

function sampleGraph(materialId) {
  if (materialId === "bio") {
    return {
      nodes: [
        { id: "Biology", type: "root" },
        { id: "Genetics", type: "concept" },
        { id: "Cell Biology", type: "concept" },
        { id: "Ecology", type: "concept" },
        { id: "Evolution", type: "concept" },
        { id: "DNA", type: "entity" },
        { id: "Inheritance", type: "entity" },
        { id: "Organelles", type: "entity" },
        { id: "Metabolism", type: "entity" },
        { id: "Ecosystems", type: "entity" },
        { id: "Food Chain", type: "entity" },
        { id: "Adaptation", type: "entity" },
        { id: "Natural Sel.", type: "entity" },
        { id: "Research M.", type: "relation" },
      ],
      links: [
        ["Biology", "Genetics"],
        ["Biology", "Cell Biology"],
        ["Biology", "Ecology"],
        ["Biology", "Evolution"],
        ["Genetics", "DNA"],
        ["Genetics", "Inheritance"],
        ["Cell Biology", "Organelles"],
        ["Cell Biology", "Metabolism"],
        ["Ecology", "Ecosystems"],
        ["Ecology", "Food Chain"],
        ["Evolution", "Adaptation"],
        ["Evolution", "Natural Sel."],
        ["Biology", "Research M."],
      ].map(([source, target]) => ({ source, target })),
    };
  }

  return {
    nodes: [
      { id: "Psychology", type: "root" },
      { id: "Cognition", type: "concept" },
      { id: "Behavior", type: "concept" },
      { id: "Development", type: "concept" },
      { id: "Mental Health", type: "concept" },
      { id: "Perception", type: "entity" },
      { id: "Memory", type: "entity" },
      { id: "Attention", type: "entity" },
      { id: "Learning T.", type: "entity" },
      { id: "Reinforcement", type: "entity" },
      { id: "Conditioning", type: "entity" },
      { id: "Anxiety", type: "entity" },
      { id: "Depression", type: "entity" },
      { id: "Social Beh.", type: "concept" },
      { id: "Social Inf.", type: "entity" },
      { id: "Conformity", type: "entity" },
      { id: "Group Dyn.", type: "entity" },
      { id: "Research M.", type: "relation" },
      { id: "Experiment", type: "relation" },
      { id: "Statistics", type: "relation" },
      { id: "Brain", type: "entity" },
      { id: "Neurons", type: "entity" },
      { id: "Piaget", type: "entity" },
      { id: "Attachment", type: "entity" },
    ],
    links: [
      ["Psychology", "Cognition"],
      ["Psychology", "Behavior"],
      ["Psychology", "Development"],
      ["Psychology", "Mental Health"],
      ["Psychology", "Social Beh."],
      ["Psychology", "Research M."],
      ["Research M.", "Experiment"],
      ["Research M.", "Statistics"],
      ["Cognition", "Perception"],
      ["Cognition", "Memory"],
      ["Cognition", "Attention"],
      ["Behavior", "Learning T."],
      ["Behavior", "Reinforcement"],
      ["Behavior", "Conditioning"],
      ["Mental Health", "Anxiety"],
      ["Mental Health", "Depression"],
      ["Social Beh.", "Social Inf."],
      ["Social Beh.", "Conformity"],
      ["Social Beh.", "Group Dyn."],
      ["Development", "Piaget"],
      ["Development", "Attachment"],
      ["Mental Health", "Brain"],
      ["Brain", "Neurons"],
    ].map(([source, target]) => ({ source, target })),
  };
}

/* ===== Helpers / Layouts ===== */
const byId = (arr = []) => Object.fromEntries(arr.map((n) => [n.id, n]));

function layoutCircular(g = { nodes: [], links: [] }, w, h) {
  const nodes = (g.nodes ?? []).map((n) => ({ ...n }));
  const links = (g.links ?? []).map((l) => ({ ...l }));

  const cx = w / 2,
    cy = h / 2;
  const root = nodes.find((n) => n.type === "root");
  if (root) {
    root.x = cx;
    root.y = cy;
  }

  const others = nodes.filter((n) => n !== root);
  const r = Math.min(w, h) * 0.32;
  others.forEach((n, i) => {
    const angle = (i / Math.max(1, others.length)) * Math.PI * 2;
    n.x = cx + r * Math.cos(angle);
    n.y = cy + r * Math.sin(angle);
  });

  return { nodes, links };
}

function layoutHierarchicalSmart(g = { nodes: [], links: [] }, w, h) {
  const nodes = (g.nodes ?? []).map((n) => ({ ...n }));
  const links = (g.links ?? []).map((l) => ({ ...l }));
  const map = byId(nodes);

  const marginTop = 40,
    marginBot = 40;
  const topY = marginTop,
    botY = h - marginBot;

  const leftX = 120;
  const midX = Math.round(w * 0.4);
  const rightX = w - 140;

  const adj = {};
  for (const l of links) {
    adj[l.source] = adj[l.source] || new Set();
    adj[l.target] = adj[l.target] || new Set();
    adj[l.source].add(l.target);
    adj[l.target].add(l.source);
  }

  const root = nodes.find((n) => n.type === "root");
  if (root) {
    root.x = midX;
    root.y = h / 2;
  }

  const concepts = nodes.filter((n) => n.type === "concept");
  const others = nodes.filter((n) => n.type !== "concept" && n.type !== "root");

  const gapC = Math.max(R.concept * 3.0, 100);
  const firstY = Math.max(topY, (h - gapC * (Math.max(1, concepts.length) - 1)) / 2);

  concepts.forEach((n, i) => {
    n.x = leftX;
    n.y = Math.min(botY, firstY + i * gapC);
  });

  const childGap = Math.max(R.entity * 2 + 14, 54);
  const minGap = Math.max(R.entity * 2 + 6, 46);

  const proposals = [];
  const seen = new Set();

  for (const c of concepts) {
    const neigh = Array.from(adj[c.id] || []);
    const kids = neigh
      .map((id) => map[id])
      .filter((n) => n && n.type !== "root" && n.type !== "concept");

    if (!kids.length) continue;

    const center = (kids.length - 1) / 2;
    kids.forEach((k, j) => {
      const yWant = c.y + (j - center) * childGap;
      proposals.push({ id: k.id, yWant, groupCenter: c.y });
    });
  }

  if (root) {
    const rootKids = Array.from(adj[root.id] || [])
      .map((id) => map[id])
      .filter((n) => n && n.type !== "concept" && n.id !== root.id);
    rootKids.forEach((rk, idx) => {
      proposals.push({
        id: rk.id,
        yWant: firstY + idx * childGap * 0.8,
        groupCenter: h / 2,
      });
    });
  }

  proposals.sort((a, b) => a.yWant - b.yWant);
  let nextY = topY;
  for (const p of proposals) {
    if (seen.has(p.id)) continue;
    const n = map[p.id];
    if (!n) continue;
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

function layoutForce(g = { nodes: [], links: [] }, w, h, steps = 220) {
  const nodes = (g.nodes ?? []).map((n) => ({
    ...n,
    x: n.x ?? Math.random() * w,
    y: n.y ?? Math.random() * h,
    vx: 0,
    vy: 0,
  }));
  const links = (g.links ?? []).map((l) => ({ ...l }));

  const kLink = 0.03;
  const rest = 140;
  const repulse = 4000;
  const damping = 0.9;

  const dict = byId(nodes);

  for (let s = 0; s < steps; s++) {
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i],
          b = nodes[j];
        let dx = a.x - b.x,
          dy = a.y - b.y;
        let d2 = dx * dx + dy * dy + 0.01;
        const f = repulse / d2;
        const invd = 1 / Math.sqrt(d2);
        const fx = dx * invd * f,
          fy = dy * invd * f;
        a.vx += fx;
        a.vy += fy;
        b.vx -= fx;
        b.vy -= fy;
      }
    }
    for (const l of links) {
      const a = dict[l.source],
        b = dict[l.target];
      if (!a || !b) continue;
      const dx = b.x - a.x,
        dy = b.y - a.y;
      const d = Math.sqrt(dx * dx + dy * dy) || 0.001;
      const diff = (d - rest) * kLink;
      const fx = (dx / d) * diff,
        fy = (dy / d) * diff;
      a.vx += fx;
      a.vy += fy;
      b.vx -= fx;
      b.vy -= fy;
    }
    for (const n of nodes) {
      if (n.type === "root") {
        n.vx += (w / 2 - n.x) * 0.02;
        n.vy += (h / 2 - n.y) * 0.02;
      }
      n.x += (n.vx *= damping);
      n.y += (n.vy *= damping);
      n.x = Math.max(60, Math.min(w - 60, n.x));
      n.y = Math.max(60, Math.min(h - 60, n.y));
    }
  }
  return { nodes, links };
}

/* ===== The Component ===== */
const GraphCanvas = forwardRef(function GraphCanvas(
  {
    size = DEFAULT_SIZE,
    colors = {
      concept: "#06B6D4",
      entity: "#F59E0B",
      relation: "#EF4444",
      root: "#3B82F6",
    },
    materialId,
    layout = "hier", // "force" | "circular" | "hier"
    filter = "All",  // "All" | "Concepts" | "Entities" | "Relationships"
    onCounts,        // (counts) => void
    onVisibleCount,  // (n) => void
  },
  ref
) {
  const wrapRef = useRef(null);

  // الرسم الخام
  const [rawGraph, setRawGraph] = useState(() => sampleGraph(materialId));

  // transform
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);

  // initialize / when material changes
  useEffect(() => {
    setRawGraph(sampleGraph(materialId));
    setScale(1);
    setTx(0);
    setTy(0);
  }, [materialId]);

  // layouts
  const laid = useMemo(() => {
    const g = rawGraph || { nodes: [], links: [] };
    if (layout === "circular") return layoutCircular(g, size.w, size.h);
    if (layout === "hier") return layoutHierarchicalSmart(g, size.w, size.h);
    return layoutForce(g, size.w, size.h, 220);
  }, [rawGraph, layout, size.w, size.h]);

  // counts
  const counts = useMemo(() => {
    const nodes = laid.nodes || [];
    const total = nodes.length;
    const Concepts = nodes.filter((n) => n.type === "concept").length;
    const Entities = nodes.filter((n) => n.type === "entity").length;
    const Relationships = nodes.filter((n) => n.type === "relation").length;
    return { All: total, Concepts, Entities, Relationships };
  }, [laid]);

  useEffect(() => {
    onCounts && onCounts(counts);
  }, [counts, onCounts]);

  // filter
  const filtered = useMemo(() => {
    const g = laid || { nodes: [], links: [] };
    if (filter === "All") return g;
    const t = filter === "Concepts" ? "concept" : filter === "Entities" ? "entity" : "relation";
    const keep = new Set(
      (g.nodes || [])
        .filter(
          (n) => n.type === "root" || n.type === t || (t === "relation" && n.type === "relation")
        )
        .map((n) => n.id)
    );
    const nodes = (g.nodes || []).filter((n) => keep.has(n.id));
    const links = (g.links || []).filter((l) => keep.has(l.source) && keep.has(l.target));
    return { nodes, links };
  }, [laid, filter]);

  useEffect(() => {
    onVisibleCount && onVisibleCount((filtered.nodes || []).length);
  }, [filtered, onVisibleCount]);

  // dragging
  const dragging = useRef(null);
  const onMouseDown = (id, e) => {
    dragging.current = { id, ox: e.clientX, oy: e.clientY };
  };
  const onMouseMove = (e) => {
    if (!dragging.current) return;
    const { id, ox, oy } = dragging.current;
    const dx = (e.clientX - ox) / scale;
    const dy = (e.clientY - oy) / scale;
    const n = (filtered.nodes || []).find((x) => x.id === id);
    if (n) {
      n.x += dx;
      n.y += dy;
      dragging.current.ox = e.clientX;
      dragging.current.oy = e.clientY;
    }
  };
  const onMouseUp = () => (dragging.current = null);

  // imperative API
  useImperativeHandle(ref, () => ({
    zoomIn: () => setScale((s) => Math.min(2.2, s + 0.15)),
    zoomOut: () => setScale((s) => Math.max(0.6, s - 0.15)),
    resetView: () => {
      setScale(1);
      setTx(0);
      setTy(0);
    },
    toggleFullscreen: () => {
      const el = wrapRef.current;
      if (!el) return;
      if (!document.fullscreenElement) el.requestFullscreen?.();
      else document.exitFullscreen?.();
    },
    regenerate: ({ materialId: mid, layout: lo, filter: fi } = {}) => {
      if (mid) setRawGraph(sampleGraph(mid));
      if (typeof lo === "string") {
        // just to trigger re-layout from parent also
      }
      if (typeof fi === "string") {
        // parent already sets filter state; here no-op
      }
      // reset transform
      setScale(1);
      setTx(0);
      setTy(0);
    },
  }));

  // colors
  const fillOf = (t) =>
    t === "root"
      ? (colors && colors.root) || "#3B82F6"
      : t === "concept"
      ? (colors && colors.concept) || "#06B6D4"
      : t === "entity"
      ? (colors && colors.entity) || "#F59E0B"
      : (colors && colors.relation) || "#EF4444";

  return (
    <div
      ref={wrapRef}
      className="relative"
      style={{ height: size.h }}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      <svg width="100%" height="100%" viewBox={`0 0 ${size.w} ${size.h}`} className="block">
        <g transform={`translate(${tx},${ty}) scale(${scale})`}>
          {/* links */}
          {(filtered.links || []).map((l, i) => {
            const A = (filtered.nodes || []).find((n) => n.id === l.source);
            const B = (filtered.nodes || []).find((n) => n.id === l.target);
            if (!A || !B) return null;
            return (
              <line
                key={i}
                x1={A.x}
                y1={A.y}
                x2={B.x}
                y2={B.y}
                stroke="#CFD8FF"
                strokeWidth="2"
              />
            );
          })}

          {/* nodes */}
          {(filtered.nodes || []).map((n) => {
            const radius = getR(n.type);
            const fill = fillOf(n.type);
            return (
              <g
                key={n.id}
                transform={`translate(${n.x},${n.y})`}
                onMouseDown={(e) => onMouseDown(n.id, e)}
                className="cursor-grab"
              >
                <circle r={radius} fill={fill} filter="url(#shadow)" />
                <text
                  textAnchor="middle"
                  y={4}
                  className={
                    n.type === "root"
                      ? "text-[13px] font-semibold fill-white"
                      : "text-[10px] font-medium fill-white"
                  }
                  style={{ fontFamily: "Inter, ui-sans-serif, system-ui" }}
                >
                  {n.id}
                </text>
                {n.type !== "root" && (
                  <circle
                    cx={radius - 5}
                    cy={-(radius - 5)}
                    r="4"
                    fill="#2563EB"
                    stroke="white"
                    strokeWidth="1"
                  />
                )}
              </g>
            );
          })}

          <defs>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.08" />
            </filter>
          </defs>
        </g>
      </svg>
    </div>
  );
});

export default GraphCanvas;
