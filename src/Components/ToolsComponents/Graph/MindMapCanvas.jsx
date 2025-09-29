

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import ReactECharts from "echarts-for-react";
import { motion, AnimatePresence } from "framer-motion";


const DEFAULT_SIZE = { w: 980, h: 520 };


const DEFAULT_COLORS = {
  root: "#000000",   // black
  branch: "#1F2937",// gray-800
  leaf: "#E5E7EB", // gray-200 (فاتح للنص الداكن)
  edgeNeutral: "#D1D5DB", // gray-300 (حواف محايدة)
};


const FONT = 9;


const H_ORG = { root: 48, mid: 36, leaf: 32 };
const H_RAD = { root: 44, mid: 34, leaf: 30 };

const ORGANIC_PAD_MIN = 0.30;
const RADIAL_PAD_DEFAULT = 0.08;
const HIER_PAD_DEFAULT = 0.08;


function sampleGraph(materialId) {
  if (materialId === "psy") {
    return {
      root: { id: "Psychology", color: COLORS.root },
      branches: [
        { id: "Cognition", color: COLORS.branch, children: ["Memory", "Attention"] },
        { id: "Behavior", color: COLORS.branch, children: ["Conditioning", "Reinforcement"] },
        { id: "Development", color: COLORS.branch, children: ["Piaget", "Attachment"] },
        { id: "Neuroscience", color: COLORS.branch, children: ["Neurons", "Brain"] },
      ],
    };
  }
  return {
    root: { id: "Biology", color: COLORS.root },
    branches: [
      { id: "Genetics", color: COLORS.branch, children: ["DNA", "Inheritance"] },
      { id: "Cell Biology", color: COLORS.branch, children: ["Organelles", "Metabolism"] },
      { id: "Ecology", color: COLORS.branch, children: ["Ecosystems", "Food Chain"] },
      { id: "Evolution", color: COLORS.branch, children: ["Natural Selection", "Adaptation"] },
    ],
  };
}

const short = (s, n = 22) => (s?.length > n ? s.slice(0, n - 1) + "…" : s);
const normalizeLayout = (v = "") => {
  const s = String(v).toLowerCase().trim();
  if (["organic", "force", "force-directed"].includes(s)) return "organic";
  if (["hierarchical", "hier", "tree"].includes(s)) return "hierarchical";
  return "radial";
};
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));


function boxSize(name = "", depth = 0, mode = "radial") {

  const per = depth === 0 ? 9.0 : depth === 1 ? 8.4 : 8.0;
  const pad = depth === 0 ? 56 : depth === 1 ? 44 : 34;

  const bounds = {
    hierarchical: [
      [120, 168], 
      [100, 130], 
      [70, 65],  
    ],
    radial: [
      [110, 160],
      [92, 126],
      [70, 90],
    ],
    organic: [
      [130, 170],
      [100, 128],
      [78, 98],
    ],
  };
  const [minW, maxW] = bounds[mode][depth] || [96, 128];
  const baseW = clamp((name?.length || 0) * per + pad, minW, maxW);

  const h =
    mode === "radial"
      ? depth === 0
        ? H_RAD.root
        : depth === 1
        ? H_RAD.mid
        : H_RAD.leaf
      : depth === 0
      ? H_ORG.root
      : depth === 1
      ? H_ORG.mid
      : H_ORG.leaf;

  return [Math.round(baseW), h];
}


function toGraphData(mind) {
  const nodes = [];
  const links = [];

  nodes.push({
    id: "root",
    name: short(mind.root.id),
    category: "root",
    symbol: "roundRect",
    symbolSize: boxSize(mind.root.id, 0, "organic"),
    itemStyle: { color: mind.root.color, borderColor: "#fff", borderWidth: 2 },
    label: { show: true, color: "#fff", fontWeight: 700, fontSize: FONT, position: "inside" },
  });

  (mind.branches || []).forEach((b, i) => {
    const bid = `b${i}`;
    nodes.push({
      id: bid,
      name: short(b.id),
      category: "branch",
      symbol: "roundRect",
      symbolSize: boxSize(b.id, 1, "organic"),
      itemStyle: { color: b.color, borderColor: "#fff", borderWidth: 2 },
      label: { show: true, color: "#fff", fontWeight: 600, fontSize: FONT - 1, position: "inside" },
    });
    links.push({ source: "root", target: bid, lineStyle: { color: b.color } });

    (b.children || []).forEach((c, j) => {
      const cid = `${bid}-c${j}`;
      nodes.push({
        id: cid,
        name: short(c),
        category: "leaf",
        symbol: "roundRect",
        symbolSize: boxSize(c, 2, "organic"),
        itemStyle: { color: COLORS.leaf, borderColor: "#fff", borderWidth: 2 },
        label: { show: true, color: "#0f172a", fontSize: FONT - 2, position: "inside" },
      });
      links.push({ source: bid, target: cid, lineStyle: { color: b.color } });
    });
  });

  return { nodes, links };
}

function toTreeData(mind, mode) {
  const root = {
    nid: "root",
    name: short(mind.root.id),
    value: 1,
    itemStyle: { color: mind.root.color, borderColor: "#fff", borderWidth: 2 },
    lineStyle: { color: COLORS.edgeNeutral },
    symbol: "roundRect",
    symbolSize: boxSize(mind.root.id, 0, mode),
    label: { color: "#fff", fontWeight: 700, fontSize: FONT, position: "inside", rotate: 0 },
    children: (mind.branches || []).map((b, i) => ({
      nid: `b${i}`,
      name: short(b.id),
      value: 1,
      itemStyle: { color: b.color, borderColor: "#fff", borderWidth: 2 },
      lineStyle: { color: b.color },
      symbol: "roundRect",
      symbolSize: boxSize(b.id, 1, mode),
      label: { color: "#fff", fontWeight: 600, fontSize: FONT - 1, position: "inside", rotate: 0 },
      children: (b.children || []).map((c, j) => ({
        nid: `b${i}-c${j}`,
        name: short(c),
        value: 1,
        itemStyle: { color: COLORS.leaf, borderColor: "#fff", borderWidth: 2 },
        lineStyle: { color: b.color },
        symbol: "roundRect",
        symbolSize: boxSize(c, 2, mode),
        label: { color: "#0f172a", fontSize: FONT - 2, position: "inside", rotate: 0 },
      })),
    })),
  };
  return [root];
}

function fitGraphToView(chart, shrink = 0.98) {
  try {
    const series = chart.getModel().getSeriesByIndex(0);
    if (!series) return;
    const data = series.getData();
    const xDim = data.getDimensionIndex("x");
    const yDim = data.getDimensionIndex("y");
    const pts = [];
    for (let i = 0; i < data.count(); i++) {
      const x = data.get(xDim, i), y = data.get(yDim, i);
      if (Number.isFinite(x) && Number.isFinite(y)) pts.push([x, y]);
    }
    if (pts.length < 2) return;

    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);

    const width = chart.getWidth(), height = chart.getHeight();
    const padding = 72;
    const w = Math.max(1, maxX - minX), h = Math.max(1, maxY - minY);
    const scaleX = (width - padding) / w;
    const scaleY = (height - padding) / h;
    const zoom = Math.min(scaleX, scaleY) * shrink;

    chart.dispatchAction({ type: "graphRoam", zoom, origin: [width / 2, height / 2] });

    const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
    const [px, py] = chart.convertToPixel({ seriesIndex: 0 }, [cx, cy]);
    chart.dispatchAction({ type: "graphRoam", dx: width / 2 - px, dy: height / 2 - py });
  } catch {}
}


const MindMapCanvas = forwardRef(function MindMapCanvas(
  {
    size = DEFAULT_SIZE,
    materialId = "psy",
    styleId = "radial", 
    stagePadding = 0.18,
  },
  ref
) {
  const [mind, setMind] = useState(() => sampleGraph(materialId));
  const chartRef = useRef(null);
  const containerRef = useRef(null);
  const timersRef = useRef([]);
  const autoFitRef = useRef(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => setMind(sampleGraph(materialId)), [materialId]);

  const L = normalizeLayout(styleId);


  const padForLayout =
    L === "organic" ? Math.max(stagePadding, ORGANIC_PAD_MIN)
    : L === "radial" ? Math.min(stagePadding, RADIAL_PAD_DEFAULT)
    : Math.min(stagePadding, HIER_PAD_DEFAULT);

  const padPct = `${Math.round(Math.max(0, Math.min(0.49, padForLayout)) * 100)}%`;

  const fitShrink = L === "organic" ? 0.88 : L === "hierarchical" ? 0.95 : 0.96;

  const option = useMemo(() => {
    if (L === "organic") {
      const { nodes, links } = toGraphData(mind);
      return {
        backgroundColor: "#f8fafc",
        tooltip: { trigger: "item" },
        series: [{
          id: "main",
          type: "graph",
          layout: "force",
          data: nodes,
          links,
          roam: true,
          top: padPct, left: padPct, right: padPct, bottom: padPct,
          scaleLimit: { min: 0.05, max: 2.4 },
          edgeSymbol: ["none", "arrow"],
          edgeSymbolSize: 8,
          lineStyle: { color: COLORS.edgeNeutral, width: 1.4, opacity: 0.9 },
          emphasis: { focus: "adjacency", blurScope: "series" },
          blur: { itemStyle: { opacity: 0.12 }, lineStyle: { opacity: 0.12 }, label: { opacity: 0.55 } },
          labelLayout: { hideOverlap: true, moveOverlap: "shiftX" },
          force: { edgeLength: [70, 110], repulsion: 520, gravity: 0.08, friction: 0.65 },
          animationDuration: 450,
          animationDurationUpdate: 650,
          animationEasing: "cubicInOut",
          animationEasingUpdate: "cubicInOut",
          universalTransition: true,
        }],
      };
    }

    if (L === "hierarchical") {
      return {
        backgroundColor: "#f8fafc",
        tooltip: { trigger: "item" },
        series: [{
          id: "main",
          type: "tree",
          data: toTreeData(mind, "hierarchical"),
          layout: "orthogonal",
          orient: "TB",
          top: padPct, left: padPct, right: padPct, bottom: padPct,
          roam: true,
          edgeShape: "curve",
          edgeForkPosition: "55%",
          symbol: "roundRect",
          symbolKeepAspect: true,

          // حجم ديناميكي (يعطي أوراق أضيق → ما تتداخل)
          symbolSize: (val, params) => {
            const depth = (params?.treeAncestors?.length ?? 1) - 1;
            const name = params?.data?.name ?? "";
            return boxSize(name, Math.max(0, depth), "hierarchical");
          },

          lineStyle: { color: COLORS.edgeNeutral, width: 1.6, opacity: 0.9 },

          label: {
            position: "inside",
            rotate: 0,
            color: (p) => ((p?.treeAncestors?.length ?? 1) <= 2 ? "#fff" : "#0f172a"),
            fontWeight: (p) => ((p?.treeAncestors?.length ?? 1) <= 2 ? 600 : 500),
            fontSize: (p) => ((p?.treeAncestors?.length ?? 1) <= 1 ? FONT : FONT - 1),
          },
          labelLayout: { hideOverlap: true },

          emphasis: {
            focus: "ancestor",
            blurScope: "series",
            lineStyle: { width: 3, opacity: 1 },
            itemStyle: { shadowBlur: 12, shadowColor: "rgba(15,23,42,0.18)" },
          },
          selectedMode: "single",
          select: {
            lineStyle: { width: 3.5, opacity: 1, shadowBlur: 10, shadowColor: "rgba(15,23,42,0.25)" },
            label: { fontWeight: 700 },
            itemStyle: { shadowBlur: 14, shadowColor: "rgba(15,23,42,0.25)" },
          },
          blur: {
            itemStyle: { opacity: 0.22 },
            label: { opacity: 0.5 },
            lineStyle: { opacity: 0.2 },
          },

          expandAndCollapse: true,
          initialTreeDepth: 2,
          animationDuration: 420,
          animationDurationUpdate: 650,
          animationEasing: "cubicInOut",
          animationEasingUpdate: "cubicInOut",
          universalTransition: true,
        }],
      };
    }

    return {
      backgroundColor: "#f8fafc",
      tooltip: { trigger: "item" },
      series: [{
        id: "main",
        type: "tree",
        data: toTreeData(mind, "radial"),
        layout: "radial",
        roam: true,
        top: padPct, left: padPct, right: padPct, bottom: padPct,
        symbol: "roundRect",
        symbolKeepAspect: true,
        symbolSize: (val, params) => {
          const depth = (params?.treeAncestors?.length ?? 1) - 1;
          const name = params?.data?.name ?? "";
          return boxSize(name, Math.max(0, depth), "radial");
        },
        edgeShape: "curve", 
        lineStyle: { color: COLORS.edgeNeutral, width: 1.8, opacity: 0.95 },
        label: {
          position: "inside",
          rotate: 0,
          align: "center",
          verticalAlign: "middle",
          color: (p) => ((p?.treeAncestors?.length ?? 1) <= 2 ? "#fff" : "#0f172a"),
          fontWeight: (p) => ((p?.treeAncestors?.length ?? 1) <= 2 ? 600 : 500),
          fontSize: (p) => ((p?.treeAncestors?.length ?? 1) <= 1 ? FONT : FONT - 1),
        },
        leaves: { label: { rotate: 0 } },
        labelLayout: { hideOverlap: true },
        emphasis: { focus: "ancestor", blurScope: "series", lineStyle: { width: 3 } },
        selectedMode: "single",
        select: { lineStyle: { width: 3.5, opacity: 1, shadowBlur: 10, shadowColor: "rgba(15,23,42,0.25)" } },
        blur: { itemStyle: { opacity: 0.22 }, label: { opacity: 0.5 } },
        expandAndCollapse: true,
        initialTreeDepth: 3,
        animationDuration: 420,
        animationDurationUpdate: 650,
        animationEasing: "cubicInOut",
        animationEasingUpdate: "cubicInOut",
        universalTransition: true,
      }],
    };
  }, [L, mind, padPct]);


  const onChartReady = (chart) => {
    chartRef.current = chart;
    setIsReady(false);

    chart.on("click", (params) => {
      if ((params.seriesType === "tree" || params.seriesType === "graph") && typeof params.dataIndex === "number") {
        chart.dispatchAction({ type: "toggleSelect", seriesIndex: 0, dataIndex: params.dataIndex });
      }
    });

    const t1 = setTimeout(() => {
      try { fitGraphToView(chart, fitShrink); } catch {}
      const t2 = setTimeout(() => setIsReady(true), 60);
      timersRef.current.push(t2);
    }, 0);
    timersRef.current.push(t1);
  };


  useEffect(() => {
    autoFitRef.current = true;
    const t1 = setTimeout(() => chartRef.current && fitGraphToView(chartRef.current, fitShrink), 0);
    const t2 = setTimeout(() => chartRef.current && fitGraphToView(chartRef.current, fitShrink), 150);
    timersRef.current.push(t1, t2);
  }, [styleId, materialId, padPct]);


  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(() => {
      const ch = chartRef.current;
      if (!ch) return;
      ch.resize();
      if (autoFitRef.current) fitGraphToView(ch, fitShrink);
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);


  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
      try { chartRef.current?.dispose?.(); } catch {}
      chartRef.current = null;
    };
  }, []);


  useImperativeHandle(ref, () => ({
    regenerate: ({ materialId: mid } = {}) => {
      if (mid) setMind(sampleGraph(mid));
      setTimeout(() => chartRef.current && fitGraphToView(chartRef.current, fitShrink), 0);
    },
    zoomIn: () => {
      const ch = chartRef.current; if (!ch) return;
      autoFitRef.current = false;
      const w = ch.getWidth(), h = ch.getHeight();
      ch.dispatchAction({ type: "graphRoam", zoom: 1.15, origin: [w / 2, h / 2] });
    },
    zoomOut: () => {
      const ch = chartRef.current; if (!ch) return;
      autoFitRef.current = false;
      const w = ch.getWidth(), h = ch.getHeight();
      ch.dispatchAction({ type: "graphRoam", zoom: 0.85, origin: [w / 2, h / 2] });
    },
    resetView: () => {
      const ch = chartRef.current; if (!ch) return;
      autoFitRef.current = true;
      ch.dispatchAction({ type: "downplay", seriesIndex: 0 });
      fitGraphToView(ch, fitShrink);
    },
    toggleFullscreen: () => {
      const el = containerRef.current; if (!el) return;
      if (!document.fullscreenElement) el.requestFullscreen?.();
      else document.exitFullscreen?.();
      setTimeout(() => chartRef.current?.resize(), 200);
    },
  }));

  const outerStyle = {
    position: "relative",
    width: "100%",
    height: size?.h ?? DEFAULT_SIZE.h,
    background: "#f8fafc",
    overflow: "hidden",
    zIndex: 0,
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
        maskImage: "radial-gradient(ellipse at center, black 40%, transparent 70%)",
        WebkitMaskImage: "radial-gradient(ellipse at center, black 40%, transparent 70%)",
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
        Loading mind map…
      </div>
    </div>
  );

  return (
    <div ref={containerRef} className="relative" style={outerStyle}>
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

      <motion.div
        key={`mind-${materialId}-${L}`}
        initial={false}
        animate={isReady ? { opacity: 1, scale: 1, filter: "blur(0px)" }
                         : { opacity: 0, scale: 0.97, filter: "blur(2px)" }}
        transition={{ duration: 0.38, ease: [0.4, 0.0, 0.2, 1] }}
        style={{ width: "100%", height: "100%", pointerEvents: isReady ? "auto" : "none" }}
      >
        <ReactECharts
          option={option}
          style={{ width: "100%", height: "100%" }}
          notMerge={false}
          lazyUpdate
          onChartReady={onChartReady}
        />
      </motion.div>
    </div>
  );
});

export default MindMapCanvas;
export { MindMapCanvas };
