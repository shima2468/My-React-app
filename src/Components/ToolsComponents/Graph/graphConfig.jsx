export const SIZE = { w: 880, h: 460 };

export const R = { root:50, concept: 30, entity: 30, relation: 22 };

export const COLORS = {
  concept: "#06B6D4",
  entity:  "#F59E0B",
  relation:"#EF4444",
  root:    "#3B82F6",
};

export const getR = (t) =>
  t === "root" ? R.root : t === "concept" ? R.concept : t === "entity" ? R.entity : R.relation;
