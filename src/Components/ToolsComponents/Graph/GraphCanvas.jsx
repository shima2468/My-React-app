
import React, {
  useMemo,
  useRef,
  forwardRef,
  useImperativeHandle,
  useEffect,
  useState,
} from "react";
import ReactECharts from "echarts-for-react";
import { motion, AnimatePresence } from "framer-motion";

const DEFAULT_SIZE = { w: 1200, h: 560 };


const DEFAULT_COLORS = {
  root: "#111827", 
  concept: "#374151",
  entity: "#9CA3AF", 
  relation: "#6B7280", 
  edgeNeutral: "#CBD5E1", 
};


export const GRAPH_COLORS = DEFAULT_COLORS;


const H = { root: 66, concept: 48, entity: 44, relation: 42 };


const FONT_SCALE = 0.9;


const LABEL = {
  base: 13,
  scale: 1.0, 
  hierScale: 0.9, 
  byType: { root: 1.35, concept: 1.12, entity: 1.0, relation: 1.0 },
  min: 12,
  max: 34,
};

const clamp = (x, a, b) => Math.min(b, Math.max(a, x));

const labelPx = (type, k, isHier) =>
  clamp(
    Math.round(
      LABEL.base *
        (isHier ? LABEL.hierScale : LABEL.scale) *
        (LABEL.byType[type] ?? 1) *
        k
    ),
    LABEL.min,
    LABEL.max
  );


const HIER_STYLE = {
  nodeGap: 80, 
  layerGap: 400,
  labelMin: LABEL.min,
  borderWidth: 2,
  shadowBlur: 10,
  siblingSpacer: 220,
};


const short = (s, n = 20) => (s?.length > n ? s.slice(0, n - 1) + "..." : s);

function normalizeLayout(v = "") {
  const s = String(v).toLowerCase().trim();
  if (["force", "force-directed", "forced", "cose", "fd"].includes(s))
    return "force";
  if (["circular", "circle", "radial"].includes(s)) return "circular";
  if (["hier", "hierarchical", "tree"].includes(s)) return "hierarchical";
  return "force";
}


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
        { id: "Natural Selection", type: "entity" },
        { id: "Research Methods", type: "relation" },
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
        ["Evolution", "Natural Selection"],
        ["Biology", "Research Methods"],
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
      { id: "Social Behavior", type: "concept" },
      { id: "Research Methods", type: "relation" },
      { id: "Perception", type: "entity" },
      { id: "Memory", type: "entity" },
      { id: "Attention", type: "entity" },
      { id: "Learning Theories", type: "entity" },
      { id: "Conditioning", type: "entity" },
      { id: "Attachment", type: "entity" },
      { id: "Anxiety", type: "entity" },
      { id: "Depression", type: "entity" },
      { id: "Brain", type: "entity" },
      { id: "Neurons", type: "entity" },
      { id: "Conformity", type: "entity" },
      { id: "Experiment", type: "relation" },
      { id: "Statistics", type: "relation" },
    ],
    links: [
      ["Psychology", "Cognition"],
      ["Psychology", "Behavior"],
      ["Psychology", "Development"],
      ["Psychology", "Mental Health"],
      ["Psychology", "Social Behavior"],
      ["Psychology", "Research Methods"],
      ["Cognition", "Perception"],
      ["Cognition", "Memory"],
      ["Behavior", "Learning Theories"],
      ["Behavior", "Conditioning"],
      ["Development", "Attachment"],
      ["Mental Health", "Anxiety"],
      ["Mental Health", "Depression"],
      ["Mental Health", "Brain"],
      ["Brain", "Neurons"],
      ["Social Behavior", "Conformity"],
      ["Research Methods", "Experiment"],
      ["Research Methods", "Statistics"],
    ].map(([source, target]) => ({ source, target })),
  };
}

// ===== Helpers =====
const colorForType = (t, palette) =>
  t === "root"
    ? palette.root
    : t === "concept"
    ? palette.concept
    : t === "entity"
    ? palette.entity
    : palette.relation;

const labelColorForType = (t) => (t === "entity" ? "#0f172a" : "#ffffff");


function boxSizeByType(name = "", type = "entity", mode = "generic", k = 1) {

  const per =
    mode === "hier"
      ? type === "root"
        ? 9.2
        : type === "concept"
        ? 8.6
        : 8.0
      : 8.0;

  const pad =
    mode === "hier"
      ? type === "root"
        ? 28
        : type === "concept"
        ? 26
        : 34
      : 20;

  const bounds =
    mode === "hier"
      ? {
          root: [100, 180],
          concept: [40, 100],
          entity: [10, 70],
          relation: [60, 90],
        }
      : {

          root: [140, 200],
          concept: [110, 170],
          entity: [110, 160],
          relation: [110, 160],
        };

  const [minW, maxW] = bounds[type] || [96, 128];
  const w = clamp(((name?.length || 0) * per + pad) * k, minW * k, maxW * k);

  const baseH =
    type === "root"
      ? H.root
      : type === "concept"
      ? H.concept
      : type === "relation"
      ? H.relation
      : H.entity;

  const h = Math.round((mode === "hier" ? baseH * 1.08 : baseH) * k);
  return [Math.round(w), h];
}


function toTreeData(graph, colors, trim = true, k = 1) {
  const palette = colors || DEFAULT_COLORS;
  const byId = Object.fromEntries(
    (graph.nodes || []).map((n) => [n.id, { ...n, children: [] }])
  );
  (graph.links || []).forEach((l) => {
    if (byId[l.source] && byId[l.target])
      byId[l.source].children.push(byId[l.target]);
  });
  const root =
    (graph.nodes || []).find((n) => n.type === "root") ||
    (graph.nodes || [])[0];


  const makeSpacer = () => ({
    name: " ", 
    value: 0.0001,
    type: "spacer",
    symbol: "roundRect",
    symbolSize: [1, 1],
    itemStyle: {
      color: "transparent",
      borderColor: "transparent",
      borderWidth: 0,
    },
    label: {
      show: true,
      position: "inside",
      width: Math.max(10, HIER_STYLE.siblingSpacer * k),
      color: "rgba(0,0,0,0)",
      backgroundColor: "transparent",
      overflow: "truncate",
      ellipsis: "...",
    },
    lineStyle: { opacity: 0 },
    children: [],
  });

  const mapNode = (n) => {
    const name = trim ? short(n.id) : n.id;
    const type = n.type || "entity";
    const [bw, bh] = boxSizeByType(name, type, "hier", k);

    const node = {
      name,
      value: 1,
      type,
      symbol: "roundRect",
      symbolSize: [bw, bh],
      itemStyle: {
        color: colorForType(type, palette),
        borderColor: "#ffffff",
        borderWidth: HIER_STYLE.borderWidth,
        shadowBlur: HIER_STYLE.shadowBlur,
        shadowColor: "rgba(15,23,42,0.14)",
      },
      label: {
        show: true,
        position: "inside",
        color: labelColorForType(type),
        fontWeight: type === "root" ? 800 : type === "concept" ? 700 : 600,

        fontSize: labelPx(type, k, true),

        overflow: "truncate",
        ellipsis: "...",

        width: Math.max(48, Math.min(bw - 10, 200)),
        align: "center",
        verticalAlign: "middle",
      },
      lineStyle: { color: palette.edgeNeutral },
      children: [],
    };


    const kids = (n.children || []).map(mapNode);


    const withSpacers = [];
    for (let i = 0; i < kids.length; i++) {
      withSpacers.push(kids[i]);
      if (i < kids.length - 1) withSpacers.push(makeSpacer());
    }
    node.children = withSpacers;

    return node;
  };

  return [mapNode(byId[root?.id] || root)];
}


function toGraphData(graph, colors, trim, { layout }, k = 1) {
  const palette = colors || DEFAULT_COLORS;
  const nodes = (graph.nodes || []).map((n) => {
    const raw = trim ? short(n.id) : n.id;
    const type = n.type || "entity";

    const [gw, gh] = boxSizeByType(raw, type, "generic", k);

    return {
      id: n.id,
      name: raw,
      category: type,
      symbol: "roundRect",
      symbolKeepAspect: true,
      symbolSize: [gw, gh],
      label: {
        show: true,
        position: "inside",
        color: labelColorForType(type),
        fontWeight: type === "root" ? 700 : type === "concept" ? 600 : 500,
        fontSize: labelPx(type, k, false),
        overflow: "truncate",
        ellipsis: "...",
        width: Math.max(56, Math.min(gw - 10, 220)),
        align: "center",
        verticalAlign: "middle",
      },
      itemStyle: {
        color: colorForType(type, palette),
        borderColor: "#ffffff",
        borderWidth: 2,
        shadowBlur: 6,
        shadowColor: "rgba(15,23,42,0.10)",
      },
      draggable: true,
      value: 1,
    };
  });

  const links = (graph.links || []).map((l) => ({
    source: l.source,
    target: l.target,
    lineStyle: {
      width: clamp(1.2 * k, 1.1, 2.2),
      opacity: 0.95,
      curveness: layout === "force" ? 0.15 : 0.2,
      color: (colors && colors.edgeNeutral) || DEFAULT_COLORS.edgeNeutral,
    },
    symbol: ["none", "arrow"],
    symbolSize: 7 * k,
  }));

  return { nodes, links };
}


function computeScaleFactor(vw, vh, nodeCount) {
  const minDim = Math.max(320, Math.min(vw, vh));
  const base = clamp(minDim / 900, 0.78, 1.25);
  const density = clamp(18 / Math.max(10, nodeCount), 0.75, 1.15);
  return clamp(base * density, 0.7, 1.2);
}

function sortForCircle(nodes) {
  const rank = (t) =>
    t === "root" ? 0 : t === "concept" ? 1 : t === "entity" ? 2 : 3;

  return [...nodes].sort((a, b) => {
    const ra = rank(a.category),
      rb = rank(b.category);
    if (ra !== rb) return ra - rb;
    return (a.name || "").localeCompare(b.name || "");
  });
}


function placeCircular(nodes, w, h, padL, padR, padT, padB) {
  const areaW = Math.max(1, w - padL - padR);
  const areaH = Math.max(1, h - padT - padB);
  const cx = padL + areaW / 2;
  const cy = padT + areaH / 2;

  const ordered = sortForCircle(nodes);
  const N = ordered.length || 1;

  const avgW =
    ordered.reduce(
      (s, n) => s + (Array.isArray(n.symbolSize) ? n.symbolSize[0] : 40),
      0
    ) / N;

  const needR = ((avgW + 10) * N) / (2 * Math.PI);
  const maxR = Math.max(60, Math.min(areaW, areaH) / 2);
  const R = clamp(needR * 1.2, 80, maxR * 0.95);

  const start = -Math.PI / 2; 
  return ordered.map((n, i) => {
    const th = start + (i * 2 * Math.PI) / N;
    return { ...n, x: cx + R * Math.cos(th), y: cy + R * Math.sin(th) };
  });
}


function fitGraphToView(chart) {
  try {
    const series = chart.getModel().getSeriesByIndex(0);
    if (!series) return;
    const data = series.getData();
    const xDim = data.getDimensionIndex("x");
    const yDim = data.getDimensionIndex("y");
    const pts = [];
    for (let i = 0; i < data.count(); i++) {
      const x = data.get(xDim, i),
        y = data.get(yDim, i);
      if (Number.isFinite(x) && Number.isFinite(y)) pts.push([x, y]);
    }
    if (pts.length < 2) return;

    const xs = pts.map((p) => p[0]),
      ys = pts.map((p) => p[1]);
    const minX = Math.min(...xs),
      maxX = Math.max(...xs);
    const minY = Math.min(...ys),
      maxY = Math.max(...ys);

    const width = chart.getWidth(),
      height = chart.getHeight();
    const padding = 90;
    const w = Math.max(1, maxX - minX),
      h = Math.max(1, maxY - minY);
    const scaleX = (width - padding) / w;
    const scaleY = (height - padding) / h;
    const zoom = Math.min(scaleX, scaleY) * 0.9;

    chart.dispatchAction({
      type: "graphRoam",
      zoom,
      origin: [width / 2, height / 2],
    });

    const cx = (minX + maxX) / 2,
      cy = (minY + maxY) / 2;
    const [px, py] = chart.convertToPixel({ seriesIndex: 0 }, [cx, cy]);
    chart.dispatchAction({
      type: "graphRoam",
      dx: width / 2 - px,
      dy: height / 2 - py,
    });
  } catch {

  }
}


const GraphCanvas = forwardRef(function GraphCanvas(
  {
    size = DEFAULT_SIZE,
    materialId = "bio",
    layout = "hierarchical",
    filter = "All",
    colors = DEFAULT_COLORS,
    trimLabels = true,
    stagePadding = 0.12,
    viewportScale = 0.58,
    onCounts,
    onVisibleCount,
  },
  ref
) {
  const rawGraph = useMemo(() => sampleGraph(materialId), [materialId]);
  const [isReady, setIsReady] = useState(false);
  const [vp, setVp] = useState({ w: 1200, h: size?.h ?? DEFAULT_SIZE.h });

  useEffect(() => {
    const nodes = rawGraph.nodes || [];
    onCounts?.({
      All: nodes.length,
      Concepts: nodes.filter((n) => n.type === "concept").length,
      Entities: nodes.filter((n) => n.type === "entity").length,
      Relationships: nodes.filter((n) => n.type === "relation").length,
    });
  }, [rawGraph, onCounts]);


  const filtered = useMemo(() => {
    if (filter === "All") return rawGraph;
    const t =
      filter === "Concepts"
        ? "concept"
        : filter === "Entities"
        ? "entity"
        : "relation";
    const keep = new Set(
      (rawGraph.nodes || [])
        .filter((n) => n.type === "root" || n.type === t)
        .map((n) => n.id)
    );
    return {
      nodes: (rawGraph.nodes || []).filter((n) => keep.has(n.id)),
      links: (rawGraph.links || []).filter(
        (l) => keep.has(l.source) && keep.has(l.target)
      ),
    };
  }, [rawGraph, filter]);

  useEffect(
    () => onVisibleCount?.((filtered.nodes || []).length),
    [filtered, onVisibleCount]
  );

  const L = normalizeLayout(layout);


  const padL = stagePadding * vp.w;
  const padR = stagePadding * vp.w;
  const padT = stagePadding * vp.h;
  const padB = stagePadding * vp.h;
  const pxTop = Math.round(padT);
  const pxLeft = Math.round(padL);
  const pxRight = Math.round(padR);
  const pxBottom = Math.round(padB + (L === "hierarchical" ? vp.h * 0.06 : 0));
  const padPct = `${Math.round(
    Math.max(0, Math.min(0.49, stagePadding)) * 100
  )}%`;


  const k = useMemo(
    () =>
      computeScaleFactor(
        vp.w - padL - padR,
        vp.h - padT - padB,
        (filtered.nodes || []).length
      ),
    [vp, filtered, padL, padR, padT, padB]
  );


  const option = useMemo(() => {
    if (L === "hierarchical") {
      const kHier = Math.max(0.85, k);
      return {
        backgroundColor: "#f8fafc",
        tooltip: { trigger: "item" },
        series: [
          {
            id: "main",
            type: "tree",
            data: toTreeData(filtered, colors, trimLabels, kHier),
            layout: "orthogonal",
            orient: "TB",
            roam: true,

            top: pxTop,
            left: pxLeft,
            right: pxRight,
            bottom: pxBottom,

            nodeGap: HIER_STYLE.nodeGap,
            layerGap: HIER_STYLE.layerGap,

            symbol: "roundRect",
            symbolKeepAspect: true,
            edgeShape: "polyline",
            edgeForkPosition: "65%",
            lineStyle: {
              width: clamp(1.8 * kHier, 1.4, 2.6),
              opacity: 0.95,
              color: colors.edgeNeutral || DEFAULT_COLORS.edgeNeutral,
            },
            labelLayout: { hideOverlap: false, moveOverlap: "shiftX" },

            emphasis: {
              focus: "ancestor",
              blurScope: "series",
              lineStyle: { width: clamp(3.2 * kHier, 2.4, 4.2) },
              itemStyle: { shadowBlur: 14, shadowColor: "rgba(15,23,42,0.22)" },
            },
            selectedMode: "single",
            select: {
              lineStyle: {
                width: clamp(3.8 * kHier, 2.8, 4.8),
                opacity: 1,
                shadowBlur: 10,
                shadowColor: "rgba(15,23,42,0.25)",
              },
              label: { fontWeight: 800 },
            },
            blur: {
              itemStyle: { opacity: 0.22 },
              label: { opacity: 0.55 },
              lineStyle: { opacity: 0.28 },
            },
            expandAndCollapse: false,
            initialTreeDepth: -1,
            animationDuration: 420,
            animationDurationUpdate: 650,
            animationEasing: "cubicInOut",
            animationEasingUpdate: "cubicInOut",
            universalTransition: true,
            progressive: 1000,
            progressiveThreshold: 2000,
          },
        ],
      };
    }


    const kForNodes = L === "force" ? k * 0.85 : k;
    const base = toGraphData(
      filtered,
      colors,
      trimLabels,
      { layout: L },
      kForNodes
    );

    if (L === "circular") {
      const nodesPos = placeCircular(
        base.nodes,
        vp.w,
        vp.h,
        padL,
        padR,
        padT,
        padB
      );
      return {
        backgroundColor: "#f8fafc",
        tooltip: { trigger: "item" },
        series: [
          {
            id: "main",
            type: "graph",
            layout: "none",
            data: nodesPos,
            links: base.links,
            roam: true,
            scaleLimit: { min: 0.05, max: 2.4 },
            selectedMode: "single",
            focusNodeAdjacency: true,
            emphasis: { focus: "adjacency", blurScope: "series" },
            blur: {
              itemStyle: { opacity: 0.12 },
              lineStyle: { opacity: 0.12 },
            },
            animationDuration: 450,
            animationDurationUpdate: 650,
            animationEasing: "cubicInOut",
            animationEasingUpdate: "cubicInOut",
            universalTransition: true,
          },
        ],
      };
    }


    return {
      backgroundColor: "#f8fafc",
      tooltip: { trigger: "item" },
      series: [
        {
          id: "main",
          type: "graph",
          layout: "force",
          initLayout: "circular",
          data: base.nodes,
          links: base.links,
          roam: true,
          top: padPct,
          left: padPct,
          right: padPct,
          bottom: padPct,
          scaleLimit: { min: 0.05, max: 2.4 },
          selectedMode: "single",
          edgeSymbol: ["none", "arrow"],
          edgeSymbolSize: 7 * kForNodes,
          focusNodeAdjacency: true,
          emphasis: { focus: "adjacency", blurScope: "series" },
          blur: { itemStyle: { opacity: 0.12 }, lineStyle: { opacity: 0.12 } },
          force: {
            edgeLength: [60, 120],
            repulsion: 200,
            gravity: 0.06,
            friction: 0.6,
          },
          animationDuration: 450,
          animationDurationUpdate: 650,
          animationEasing: "cubicInOut",
          animationEasingUpdate: "cubicInOut",
          universalTransition: true,
          progressive: 1000,
          progressiveThreshold: 2000,
        },
      ],
    };
  }, [
    L,
    filtered,
    colors,
    trimLabels,
    padPct,
    k,
    vp,
    padL,
    padR,
    padT,
    padB,
    pxTop,
    pxLeft,
    pxRight,
    pxBottom,
  ]);

  const chartRef = useRef(null);
  const containerRef = useRef(null);
  const timersRef = useRef([]);

  const onChartReady = (chart) => {
    chartRef.current = chart;
    const t1 = setTimeout(() => {
      fitGraphToView(chart);
      const t2 = setTimeout(() => setIsReady(true), 60);
      timersRef.current.push(t2);
    }, 0);
    timersRef.current.push(t1);
  };

  useEffect(() => {
    const t1 = setTimeout(
      () => chartRef.current && fitGraphToView(chartRef.current),
      0
    );
    const t2 = setTimeout(
      () => chartRef.current && fitGraphToView(chartRef.current),
      150
    );
    timersRef.current.push(t1, t2);
    return () => {};
  }, [layout, filter, stagePadding, k, vp]);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const el = entries[0]?.target;
      if (!el) return;
      setVp({
        w: el.clientWidth || 1200,
        h: el.clientHeight || (size?.h ?? DEFAULT_SIZE.h),
      });
      chartRef.current?.resize();
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [size?.h]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
      try {
        chartRef.current?.dispose?.();
      } catch {}
      chartRef.current = null;
    };
  }, []);

  useImperativeHandle(ref, () => {
    const api = {};

    const fns = [
      "zoomIn",
      "zoomOut",
      "resetView",
      "toggleFullscreen",
      "regenerate",
    ];

    fns.forEach((fn) => {
      api[fn] = (...args) => {
        if (fn === "zoomIn") {
          const ch = chartRef.current;
          if (!ch) return;
          const w = ch.getWidth(),
            h = ch.getHeight();
          ch.dispatchAction({
            type: "graphRoam",
            zoom: 1.15,
            origin: [w / 2, h / 2],
          });
        } else if (fn === "zoomOut") {
          const ch = chartRef.current;
          if (!ch) return;
          const w = ch.getWidth(),
            h = ch.getHeight();
          ch.dispatchAction({
            type: "graphRoam",
            zoom: 0.85,
            origin: [w / 2, h / 2],
          });
        } else if (fn === "resetView") {
          if (chartRef.current) fitGraphToView(chartRef.current);
        } else if (fn === "toggleFullscreen") {
          const el = containerRef.current;
          if (!el) return;
          if (!document.fullscreenElement) el.requestFullscreen?.();
          else document.exitFullscreen?.();
          setTimeout(() => chartRef.current?.resize(), 200);
        } else if (fn === "regenerate") {
          // hook point
        }
      };
    });

    return api;
  });

  const outerStyle = {
    position: "relative",
    width: "100%",
    height: size?.h ?? DEFAULT_SIZE.h,
    display: "grid",
    placeItems: "center",
    overflow: "hidden",
    background: "#f8fafc",
  };

  const Skeleton = () => (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "grid",
        placeItems: "center",
        background:
          "repeating-linear-gradient(90deg,#f1f5f9,#f1f5f9 16px,#e2e8f0 16px,#e2e8f0 32px)",
        maskImage:
          "radial-gradient(ellipse at center, black 40%, transparent 70%)",
        WebkitMaskImage:
          "radial-gradient(ellipse at center, black 40%, transparent 70%)",
        opacity: 0.75,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          padding: "10px 14px",
          borderRadius: 12,
          background: "#ffffffaa",
          boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
          fontFamily: "system-ui, sans-serif",
          fontSize: 14,
          color: "#334155",
          pointerEvents: "none",
        }}
      >
        Loading graph…
      </div>
    </div>
  );

  return (
    <div ref={containerRef} id="graph-viewport" style={outerStyle}>
      <AnimatePresence initial={false}>
        {!isReady && (
          <motion.div
            key="skeleton"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
          >
            <Skeleton />
          </motion.div>
        )}
      </AnimatePresence>

      <ReactECharts
        option={option}
        style={{ width: "100%", height: "100%" }}
        notMerge={false}
        lazyUpdate
        onChartReady={onChartReady}
        opts={{
          renderer: "canvas",
          devicePixelRatio: Math.min(2, window.devicePixelRatio || 1.5),
        }}
      />
    </div>
  );
});

export default GraphCanvas;
