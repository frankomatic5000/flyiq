import test from "node:test";
import assert from "node:assert/strict";

function isInternationalRoute(route) {
  const domesticPrefixes = ["NYC", "LAX", "BOS", "CHI", "MIA", "SFO", "SEA", "DFW", "ATL"];
  const parts = route.split("-").map((part) => part.trim().toUpperCase());
  return parts.some((part) => part && !domesticPrefixes.includes(part));
}

function calculateBookingWindow(route) {
  const routeType = isInternationalRoute(route) ? "international" : "domestic";
  return routeType === "domestic" ? "21-30 days" : "31-45 days";
}

test("domestic routes use 21-30 day booking window", () => {
  assert.equal(calculateBookingWindow("NYC-LAX"), "21-30 days");
});

test("international routes use 31-45 day booking window", () => {
  assert.equal(calculateBookingWindow("NYC-PAR"), "31-45 days");
});
