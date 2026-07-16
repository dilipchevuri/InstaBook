// Maps GS category / static-subject names to a CSS class defined in globals.css.
// Shared across the digest list, item detail page, and static capsules so colors stay consistent.
const CATEGORY_MAP = [
  { match: /polity|governance/i, cls: "cat-polity" },
  { match: /economy|economic/i, cls: "cat-economy" },
  { match: /international|relations|world/i, cls: "cat-ir" },
  { match: /environment|ecology|climate/i, cls: "cat-environment" },
  { match: /science|tech/i, cls: "cat-scitech" },
  { match: /society|social/i, cls: "cat-society" },
  { match: /history/i, cls: "cat-history" },
  { match: /geography/i, cls: "cat-geography" },
  { match: /art|culture/i, cls: "cat-culture" },
];

export function categoryClass(categoryName) {
  const found = CATEGORY_MAP.find((c) => c.match.test(categoryName || ""));
  return found ? found.cls : "cat-misc";
}
