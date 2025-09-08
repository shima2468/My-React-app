// src/assets/Components/ToolsComponents/MindMap/MindMapCanvas.jsx
import React, {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  useEffect,
} from "react";

/* ====== Size / Radii ====== */
const DEFAULT_SIZE = { w: 980, h: 520 };
const R = {
  root: 50,
  branch: 40,
  child: 32,
};

function sampleGraph(materialId) {
  if (materialId === "psy") {
    return {
      root: { label: "Psychology", color: "#3B82F6" },
      branches: [
        {
          label: "Cognition",
          color: "#06B6D4",
          children: ["Memory", "Attention"],
        },
        {
          label: "Behavior",
          color: "#F59E0B",
          children: ["Conditioning", "Reinforcement"],
        },
        {
          label: "Development",
          color: "#10B981",
          children: ["Piaget", "Attachment"],
        },
        {
          label: "Neuroscience",
          color: "#EF4444",
          children: ["Neurons", "Brain"],
        },
      ],
    };
  }
  return {
    root: { label: "Biology", color: "#3B82F6" },
    branches: [
      { label: "Genetics", color: "#10B981", children: ["DNA", "Inheritance"] },
      {
        label: "Cell Biology",
        color: "#06B6D4",
        children: ["Organelles", "Metabolism"],
      },
      {
        label: "Ecology",
        color: "#EF4444",
        children: ["Ecosystems", "Food Chain"],
      },
      {
        label: "Evolution",
        color: "#F59E0B",
        children: ["Natural Sel.", "Adaptation"],
      },
    ],
  };
}

/* ====== Layouts ====== */
function layoutRadial(graph, width, height) {
  const cx = width / 2,
    cy = height / 2;
  const R1 = Math.min(width, height) * 0.24; // branches ring
  const R2 = Math.min(width, height) * 0.38; // children ring

  const nodes = [];
  const links = [];

  nodes.push({
    id: "root",
    x: cx,
    y: cy,
    r: R.root,
    label: graph.root.label,
    color: graph.root.color,
  });

  const k = graph.branches.length || 1;
  graph.branches.forEach((b, i) => {
    const angle = (i / k) * Math.PI * 2;
    const bx = cx + R1 * Math.cos(angle);
    const by = cy + R1 * Math.sin(angle);
    const bid = `b${i}`;
    nodes.push({
      id: bid,
      x: bx,
      y: by,
      r: R.branch,
      label: b.label,
      color: b.color,
    });
    links.push({ from: "root", to: bid });

    b.children.forEach((c, j) => {
      const ca = angle + (j === 0 ? -0.28 : 0.28); // slight offset
      const cx2 = cx + R2 * Math.cos(ca);
      const cy2 = cy + R2 * Math.sin(ca);
      const cid = `${bid}-c${j}`;
      nodes.push({
        id: cid,
        x: cx2,
        y: cy2,
        r: R.child,
        label: c,
        color: b.color,
        dim: true,
      });
      links.push({ from: bid, to: cid });
    });
  });

  return { nodes, links };
}

function layoutHierarchical(graph, width, height) {
  const nodes = [];
  const links = [];

  const left = 140;
  const midX = Math.round(width * 0.48);
  const right = width - (R.child + 60);

  const branchGap = Math.max(R.branch * 3.2, 100);
  const firstBranchY = (height - branchGap * (graph.branches.length - 1)) / 2;

  nodes.push({
    id: "root",
    x: left,
    y: height / 2,
    r: R.root,
    label: graph.root.label,
    color: graph.root.color,
  });

  graph.branches.forEach((b, i) => {
    const by = firstBranchY + i * branchGap;
    const bid = `b${i}`;

    nodes.push({
      id: bid,
      x: midX,
      y: by,
      r: R.branch,
      label: b.label,
      color: b.color,
    });
    links.push({ from: "root", to: bid });

    const childGapY = Math.max(R.child * 2 + 10, 50);
    const centerIndex = (b.children.length - 1) / 2;

    b.children.forEach((c, j) => {
      const cy = by + (j - centerIndex) * childGapY;
      const cid = `${bid}-c${j}`;
      nodes.push({
        id: cid,
        x: right,
        y: cy,
        r: R.child,
        label: c,
        color: b.color,
        dim: true,
      });
      links.push({ from: bid, to: cid });
    });
  });

  return { nodes, links };
}

function layoutOrganic(graph, width, height) {
  const nodes = [];
  const links = [];

  const cx = width / 2,
    cy = height / 2;
  nodes.push({
    id: "root",
    x: cx,
    y: cy,
    r: R.root,
    label: graph.root.label,
    color: graph.root.color,
  });

  const m = graph.branches.length || 1;
  const branchRadius = Math.min(width, height) * 0.2;

  graph.branches.forEach((b, i) => {
    const theta = (i / m) * Math.PI * 2;
    const bx = cx + branchRadius * Math.cos(theta);
    const by = cy + branchRadius * Math.sin(theta);
    const bid = `b${i}`;

    nodes.push({
      id: bid,
      x: bx,
      y: by,
      r: R.branch,
      label: b.label,
      color: b.color,
    });
    links.push({ from: "root", to: bid });

    const n = b.children.length;
    if (!n) return;

    const childRing = Math.max(R.branch * 3.2, 85);
    const maxSpread = ((2 * Math.PI) / m) * 0.7;
    const baseSpread = 0.9;
    const spread = Math.min(baseSpread, maxSpread);

    const center = (n - 1) / 2;
    const step = n > 1 ? spread / (n - 1) : 0;

    b.children.forEach((c, j) => {
      const ang = theta + (j - center) * step;
      const cx2 = bx + childRing * Math.cos(ang);
      const cy2 = by + childRing * Math.sin(ang);
      const cid = `${bid}-c${j}`;
      nodes.push({
        id: cid,
        x: cx2,
        y: cy2,
        r: R.child,
        label: c,
        color: b.color,
        dim: true,
      });
      links.push({ from: bid, to: cid });
    });
  });

  return { nodes, links };
}

function computeLayout(graph, w, h, styleId) {
  return styleId === "hierarchical"
    ? layoutHierarchical(graph, w, h)
    : styleId === "organic"
    ? layoutOrganic(graph, w, h)
    : layoutRadial(graph, w, h);
}

/* ====== Helpers: zoom-to-fit ====== */
function getBounds(nodes) {
  if (!nodes?.length) return { minX: 0, minY: 0, maxX: 1, maxY: 1 };
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const n of nodes) {
    minX = Math.min(minX, n.x - n.r);
    minY = Math.min(minY, n.y - n.r);
    maxX = Math.max(maxX, n.x + n.r);
    maxY = Math.max(maxY, n.y + n.r);
  }
  return { minX, minY, maxX, maxY };
}

/* ====== Canvas Component ====== */
const MindMapCanvas = forwardRef(function MindMapCanvas(
  { size = DEFAULT_SIZE, materialId = "bio", styleId = "radial" },
  ref
) {
  const wrapRef = useRef(null);

  const [layout, setLayout] = useState(() =>
    computeLayout(sampleGraph(materialId), size.w, size.h, styleId)
  );

  // transform state
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);

  // recompute on first mount -> fit to view
  useEffect(() => {
    zoomToFit(40);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const zoomToFit = (pad = 40) => {
    const { minX, minY, maxX, maxY } = getBounds(layout.nodes);
    const w = maxX - minX || 1;
    const h = maxY - minY || 1;
    const sx = (size.w - pad * 2) / w;
    const sy = (size.h - pad * 2) / h;
    const s = Math.max(0.1, Math.min(sx, sy));
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    setScale(s);
    setTx(size.w / 2 - cx * s);
    setTy(size.h / 2 - cy * s);
  };

  useImperativeHandle(
    ref,
    () => ({
      regenerate: ({ materialId: mid, styleId: sid } = {}) => {
        const g = sampleGraph(mid || materialId);
        const lay = computeLayout(g, size.w, size.h, sid || styleId);
        setLayout(lay);
        // center nicely
        setTimeout(() => zoomToFit(40), 0);
      },
      zoomIn: () => setScale((s) => Math.min(2.2, s + 0.15)),
      zoomOut: () => setScale((s) => Math.max(0.5, s - 0.15)),
      resetView: () => zoomToFit(40),
      toggleFullscreen: () => {
        const el = wrapRef.current;
        if (!el) return;
        if (!document.fullscreenElement) el.requestFullscreen?.();
        else document.exitFullscreen?.();
      },
    }),
    [materialId, styleId, layout, size.w, size.h]
  );

  // memo for performance
  const links = useMemo(() => layout.links ?? [], [layout.links]);
  const nodes = useMemo(() => layout.nodes ?? [], [layout.nodes]);

  // label font based on node radius
  const fontFor = (n) => {
    const base = n.id === "root" ? 14 : n.dim ? 10 : 12;
    const px = Math.max(8, Math.min(base, n.r * 0.6));
    return `${px}px Inter, ui-sans-serif, system-ui`;
    // you can swap fonts here if needed
  };

  return (
    <div
      ref={wrapRef}
      className="relative bg-slate-50"
      style={{ height: size.h }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${size.w} ${size.h}`}
        className="block"
      >
        <g transform={`translate(${tx},${ty}) scale(${scale})`}>
          {/* links */}
          {links.map((e) => {
            const a = nodes.find((n) => n.id === e.from);
            const b = nodes.find((n) => n.id === e.to);
            if (!a || !b) return null;
            return (
              <line
                key={`${e.from}-${e.to}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke="#C7D2FE"
                strokeWidth="2"
              />
            );
          })}

          {/* nodes */}
          {nodes.map((n) => (
            <g key={n.id}>
              <circle
                cx={n.x}
                cy={n.y}
                r={n.r}
                fill={n.dim ? "#fff" : n.color}
                stroke={n.dim ? "#CBD5E1" : "transparent"}
                strokeWidth={n.dim ? 1.6 : 0}
                filter="url(#shadow)"
              />
              <text
                x={n.x}
                y={n.y + 1}
                textAnchor="middle"
                style={{ font: fontFor(n) }}
                className={
                  n.id === "root"
                    ? "font-semibold fill-white"
                    : n.dim
                    ? "fill-slate-800"
                    : "font-semibold fill-white"
                }
              >
                {n.label}
              </text>
            </g>
          ))}

          <defs>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow
                dx="0"
                dy="1"
                stdDeviation="2"
                floodOpacity="0.08"
              />
            </filter>
          </defs>
        </g>
      </svg>
    </div>
  );
});

export default MindMapCanvas;
