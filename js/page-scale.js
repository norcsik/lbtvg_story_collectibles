const rootStyles = getComputedStyle(document.documentElement);
const pageWidth = parseFloat(rootStyles.getPropertyValue("--page-width"));
const pageHeight = parseFloat(rootStyles.getPropertyValue("--page-height"));

function scalePageToViewport() {
  const scale = Math.min(
    1,
    window.innerWidth / pageWidth,
    window.innerHeight / pageHeight
  );
  document.documentElement.style.setProperty("--page-scale", scale);
}

window.addEventListener("resize", scalePageToViewport);
scalePageToViewport();
