export const SCHOOLS = [
  {
    id: "otaniemi", name: "Otaniemen lukio",
    palkkiCount: 8, periodCount: 5,
    times: ["8.15–9.45","10.00–11.30","11.45–13.15","13.30–15.00","15.15–16.45"],
    days: ["Ma","Ti","Ke","To","Pe"],
    rotation: [
      [1,2,3,4,5],[6,7,8,1,2],[3,4,5,6,7],[8,1,2,3,4],[5,6,7,8,null]
    ],
  },
  {
    id: "espoonlahti", name: "Espoonlahden lukio",
    palkkiCount: 8, periodCount: 5,
    times: ["8.30–9.45","9.55–11.10","11.25–13.10","13.20–14.35","14.45–16.00"],
    days: ["Ma","Ti","Ke","To","Pe"],
    rotation: [
      [2,7,4,7,1],[3,5,2,5,4],[7,4,3,1,6],[6,1,6,2,5],[8,null,8,3,8]
    ]
  },
  {
    id: "haukilahti", name: "Haukilahden lukio",
    palkkiCount: 8, periodCount: 5,
    times: ["8.30–9.45","10.00–11.15","11.25–13.20","13.35–14.50","15.05–16.20"],
    days: ["Ma","Ti","Ke","To","Pe"],
    rotation: [
      [2,7,7,7,1],[3,5,2,5,4],[4,4,3,1,6],[6,1,6,2,5],[8,null,8,3,8]
    ]
  },
  {
    id: "matinkyla", name: "Matinkylän lukio",
    palkkiCount: 8, periodCount: 5,
    times: ["8.15–9.30","9.45–11.00","11.10–13.00","13.15–14.30","14.45–16.00"],
    days: ["Ma","Ti","Ke","To","Pe"],
    rotation: [
      [2,7,4,7,1],[3,5,2,5,4],[7,4,3,1,6],[6,1,6,2,5],[8,null,8,3,8]
    ]
  },
  {
    id: "etela-tapiola", name: "Etelä-Tapiolan lukio",
    palkkiCount: 9, periodCount: 5,
    times: ["8.15–9.30","9.45–11.00","11.00–13.00","13.15–14.30","14.45–16.00"],
    days: ["Ma","Ti","Ke","To","Pe"],
    rotation: [
      [2,7,4,7,1],[3,5,2,5,4],[7,4,3,1,6],[6,1,6,2,5],[8,9,8,3,8]
    ]
  }
];

export const PTINTS = [
  { bg: "var(--p1)", b: "var(--p1b)", l: "var(--p1l)", lRaw: "oklch(0.55 0.13 45)",  glow: "oklch(0.80 0.12 45 / 0.55)",  name: "Orange" },
  { bg: "var(--p2)", b: "var(--p2b)", l: "var(--p2l)", lRaw: "oklch(0.44 0.10 150)", glow: "oklch(0.78 0.10 150 / 0.45)", name: "Sage"   },
  { bg: "var(--p3)", b: "var(--p3b)", l: "var(--p3l)", lRaw: "oklch(0.50 0.12 80)",  glow: "oklch(0.79 0.11 80 / 0.45)",  name: "Lime"   },
  { bg: "var(--p4)", b: "var(--p4b)", l: "var(--p4l)", lRaw: "oklch(0.44 0.10 240)", glow: "oklch(0.78 0.10 240 / 0.45)", name: "Blue"   },
  { bg: "var(--p5)", b: "var(--p5b)", l: "var(--p5l)", lRaw: "oklch(0.52 0.11 340)", glow: "oklch(0.80 0.11 340 / 0.45)", name: "Pink"   },
];
