const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

// Every target moves independently as it leaves the top of the viewport.
// The selected elements do not contain other targets, so their transforms do
// not compound. Interactive cards remain visible while they contain focus.
const exitTargets = document.querySelectorAll(
  [
    ".hero-copy",
    ".subhero-copy",
    ".section-head",
    ".zone-card",
    ".spec-card",
    ".more-card",
    ".model-wrap",
    ".zone-info",
    ".vip-art",
    ".vip-info",
    ".price-card",
    ".rates-callout > div",
    ".rates-callout > a",
    ".booking-pending > div",
    ".booking-pending > a",
    ".closing > .eyebrow",
    ".closing > h2",
    ".closing > a",
    ".closing-gamepad",
    ".tool-hero > *",
    ".preview-alert",
    ".tool-card",
    ".admin-heading",
    ".admin-stats > div",
  ].join(", "),
);

exitTargets.forEach((element) => element.classList.add("scroll-exit"));

// Use layout offsets instead of transformed bounding boxes so scaling an
// element cannot change its own scroll progress.
function documentTop(element) {
  let top = 0;
  for (let node = element; node; node = node.offsetParent) {
    top += node.offsetTop;
  }
  return top;
}

function clamp(value) {
  return Math.min(1, Math.max(0, value));
}

let pending = false;
function update() {
  pending = false;
  const viewportHeight = window.innerHeight;

  for (const element of exitTargets) {
    if (reducedMotion.matches || element.contains(document.activeElement)) {
      element.style.removeProperty("--exit-opacity");
      element.style.removeProperty("--exit-scale");
      element.style.removeProperty("--exit-shift");
      element.style.removeProperty("--exit-blur");
      continue;
    }

    const top = documentTop(element) - window.scrollY;
    // Stretch the transition over a larger part of the screen for a gentler exit.
    const distance = Math.max(
      viewportHeight * 0.7,
      Math.min(element.offsetHeight * 1.4, viewportHeight * 1.3),
    );
    const progress = clamp((viewportHeight * 0.12 - top) / distance);
    const eased = progress * progress * (3 - 2 * progress);
    element.style.setProperty("--exit-opacity", (1 - eased).toFixed(3));
    element.style.setProperty("--exit-scale", (1 - eased * 0.18).toFixed(3));
    element.style.setProperty("--exit-shift", `${(-eased * 24).toFixed(1)}px`);
    element.style.setProperty("--exit-blur", `${(eased * 1.5).toFixed(2)}px`);
  }
}

function schedule() {
  if (!pending) {
    pending = true;
    requestAnimationFrame(update);
  }
}

function setMotionPreference() {
  document.documentElement.classList.toggle("motion-ready", !reducedMotion.matches);
  schedule();
}

addEventListener("scroll", schedule, { passive: true });
addEventListener("resize", schedule, { passive: true });
addEventListener("focusin", schedule);
addEventListener("focusout", schedule);
reducedMotion.addEventListener("change", setMotionPreference);
setMotionPreference();

// Background portraits continue to fade in and out at the edges.
const edgeCharacters = document.querySelectorAll(".edge-character");
let edgePending = false;
function updateEdges() {
  edgePending = false;
  const scroll = window.scrollY;
  const entrance = clamp(scroll / 900);
  const phase = (scroll / 2000) * Math.PI;
  const first = (1 + Math.cos(phase)) / 2;
  const amounts = [first, 1 - first, first, 1 - first];

  edgeCharacters.forEach((element, index) => {
    element.style.opacity = reducedMotion.matches
      ? "0"
      : (entrance * amounts[index] * 0.58).toFixed(3);
    element.style.setProperty("--edge-shift", `${((1 - entrance) * 18).toFixed(1)}px`);
  });
}

function scheduleEdges() {
  if (!edgePending) {
    edgePending = true;
    requestAnimationFrame(updateEdges);
  }
}

addEventListener("scroll", scheduleEdges, { passive: true });
addEventListener("resize", scheduleEdges, { passive: true });
reducedMotion.addEventListener("change", scheduleEdges);
scheduleEdges();
