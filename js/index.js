
// State variables
let levelData = [];
const statLabels = Array.from(document.querySelectorAll(".collectible-total > span"));
const headerCounterLabels = Array.from(document.querySelectorAll(".header-counter span"));
const overviewTitle = document.querySelector(".overview-title");
const batmanMark = document.querySelector("#batman-mark");
const chartContainer = document.querySelector("#collectible-chart");
const chartYAxis = document.querySelector("#chart-y-axis");
const chartPlot = document.querySelector("#chart-plot");
const chartScroll = document.querySelector("#chart-scroll");
const chartScrollPrevious = document.querySelector("#chart-scroll-previous");
const chartScrollNext = document.querySelector("#chart-scroll-next");
const buildSound = new Audio();
const collectibleStates = [
  { values: [0], label: "Uncollected", color: "unobtained", image: "assets/images/collectibles/stud_0.png" },
  { values: [1], label: "Collected", color: "obtained", image: "assets/images/collectibles/stud_1.png" },
  { values: [2], label: "Glitched", color: "glitched", image: "assets/images/collectibles/stud_2.png" },
  { values: [1, 2], label: "Total Collected", color: "selected", image: "assets/images/collectibles/stud.png" }
];
const studScale = 0.7;
const studWidth = 68 * studScale;
const studHeight = 42 * studScale;
const studOverlap = 10;
const studStep = studHeight - studOverlap;
const chartHeadroom = 24;
const countLabelGap = 4;
const chartLabelHeight = 36;

function playOverviewSoundAfterInteraction() {
  const startPlayback = () => {
    document.removeEventListener("pointerdown", startPlayback);
    document.removeEventListener("keydown", startPlayback);
    buildSound.currentTime = 0;
    buildSound.play().catch((error) => {
      console.error("Unable to play Overview entry sound:", error);
    });
  };

  document.addEventListener("pointerdown", startPlayback, { once: true });
  document.addEventListener("keydown", startPlayback, { once: true });
}

function updateChartScrollButtons() {
  chartScrollPrevious.disabled = chartScroll.scrollLeft <= 0;
  chartScrollNext.disabled = chartScroll.scrollLeft >= chartScroll.scrollWidth - chartScroll.clientWidth - 1;
}

function scrollChartByLevel(direction) {
  const levels = Array.from(chartPlot.querySelectorAll(".chart-level"));
  let currentIndex = 0;

  levels.forEach((level, index) => {
    if (level.offsetLeft <= chartScroll.scrollLeft + 1) {
      currentIndex = index;
    }
  });

  const targetIndex = Math.max(0, Math.min(levels.length - 1, currentIndex + direction));
  chartScroll.scrollTo({ left: levels[targetIndex].offsetLeft, behavior: "smooth" });
}

chartScrollPrevious.addEventListener("click", () => scrollChartByLevel(-1));
chartScrollNext.addEventListener("click", () => scrollChartByLevel(1));
chartScroll.addEventListener("scroll", updateChartScrollButtons, { passive: true });

async function playOverviewEntrySound() {
  const response = await fetch("assets/sounds/brick_build.wav");
  if (!response.ok) {
    throw new Error(`Failed to load Overview entry sound (${response.status}).`);
  }

  const soundUrl = URL.createObjectURL(new Blob([await response.blob()], { type: "audio/wav" }));
  buildSound.addEventListener("ended", () => URL.revokeObjectURL(soundUrl), { once: true });
  buildSound.src = soundUrl;
  try {
    await buildSound.play();
  } catch (error) {
    if (error.name !== "NotAllowedError") {
      throw error;
    }

    playOverviewSoundAfterInteraction();
  }
}

playOverviewEntrySound().catch((error) => {
  console.error("Unable to play Overview entry sound:", error);
});

//Set up variables for data
let minikitCount = 0;

let totalMinikits = 0;
let percentMinikits = 0;
let totalMinikitsNormallyCollected = 0;
let percentMinikitsNormallyCollected = 0;
let totalMinikitsGlitched = 0;
let percentMinikitsGlitched = 0;
let totalHostages = 0;
let percentHostages = 0;
let totalHostagesNormallyCollected = 0;
let percentHostagesNormallyCollected = 0;
let totalHostagesGlitched = 0;
let percentHostagesGlitched = 0;
let totalBricks = 0;
let percentBricks = 0;
let totalBricksNormallyCollected = 0;
let percentBricksNormallyCollected = 0;
let totalBricksGlitched = 0;
let percentBricksGlitched = 0;


function updateStats() {
    // Calculate minikit total & percentages.
    for (let level of levelData){

        //Count how many minikits are available in the level
        minikitCount = level.collectibles.length - 2;

        // Calculate total minikits collected & glitched
        for(let i = 0; i < minikitCount; i++){
            if (level.collectibles[i] === 1 || level.collectibles[i] === 2){
                totalMinikits++;
            }
            if (level.collectibles[i] === 1){
                totalMinikitsNormallyCollected++;
            }
            if (level.collectibles[i] === 2){
                totalMinikitsGlitched++;
            }
        }

        //Calculate hostages collected & glitched
        const hostageStatus = level.collectibles[level.collectibles.length - 2];
        if (hostageStatus === 1 || hostageStatus === 2){
            totalHostages++;
        }
        if (hostageStatus === 1){
            totalHostagesNormallyCollected++;
        }
        if (hostageStatus === 2){
            totalHostagesGlitched++;
        }

        //Calculate bricks collected & glitched
        const brickStatus = level.collectibles[level.collectibles.length - 1];
        if (brickStatus === 1 || brickStatus === 2){
            totalBricks++;
        }
        if (brickStatus === 1){
            totalBricksNormallyCollected++;
        }
        if (brickStatus === 2){
            totalBricksGlitched++;
        }
    }

    //Calculate percentages for minikits, hostages, and bricks
    percentMinikits = Math.round((totalMinikits / 300) * 100);
    percentMinikitsNormallyCollected = Math.round((totalMinikitsNormallyCollected / 300) * 100);
    percentMinikitsGlitched = Math.round((totalMinikitsGlitched / 300) * 100);

    percentHostages = Math.round((totalHostages / 25) * 100);
    percentHostagesNormallyCollected = Math.round((totalHostagesNormallyCollected / 25) * 100);
    percentHostagesGlitched = Math.round((totalHostagesGlitched / 25) * 100);

    percentBricks = Math.round((totalBricks / 30) * 100);
    percentBricksNormallyCollected = Math.round((totalBricksNormallyCollected / 30) * 100);
    percentBricksGlitched = Math.round((totalBricksGlitched / 30) * 100);

    // Plug the the calculated values into the stats
    const stats = [
        [totalMinikits, 300, percentMinikits],
        [totalHostages, 25, percentHostages],
        [totalBricks, 30, percentBricks],
        [totalMinikitsNormallyCollected, 300, percentMinikitsNormallyCollected],
        [totalHostagesNormallyCollected, 25, percentHostagesNormallyCollected],
        [totalBricksNormallyCollected, 30, percentBricksNormallyCollected],
        [totalMinikitsGlitched, 300, percentMinikitsGlitched],
        [totalHostagesGlitched, 25, percentHostagesGlitched],
        [totalBricksGlitched, 30, percentBricksGlitched]
    ];

    stats.forEach(([count, total, percentage], index) => {
        const label = statLabels[index];
        label.firstChild.textContent = `${count}/${total} `;
        label.lastChild.textContent = ` ${percentage}%`;
    });

    [totalMinikits, totalHostages, totalBricks].forEach((count, index) => {
        headerCounterLabels[index].textContent = `${count}/${[300, 25, 30][index]}`;
    });

    const gameCompletionPercentage = Math.round(((totalMinikits + totalHostages + totalBricks) / 355) * 100);
    overviewTitle.textContent = `${gameCompletionPercentage}% Game Completion`;
    batmanMark.setAttribute("aria-label", `Batman emblem showing ${gameCompletionPercentage}% game completion`);
    batmanMark.style.setProperty("--batman-reveal", `${gameCompletionPercentage}%`);
}

function updateUncollectedStats() {
  const counts = [0, 0, 0];
  const totals = [300, 25, 30];

  levelData.forEach(({ collectibles }) => {
    const minikitCount = collectibles.length - 2;
    for (let i = 0; i < minikitCount; i++) {
      if (collectibles[i] === 0) {
        counts[0]++;
      }
    }
    if (collectibles[minikitCount] === 0) {
      counts[1]++;
    }
    if (collectibles[minikitCount + 1] === 0) {
      counts[2]++;
    }
  });

  const labels = Array.from(document.querySelectorAll(".is-uncollected .collectible-total > span"));
  labels.forEach((label, index) => {
    label.firstChild.textContent = `${counts[index]}/${totals[index]} `;
    label.lastChild.textContent = ` ${Math.round((counts[index] / totals[index]) * 100)}%`;
  });
}

function renderEpisodeStats() {
  const episodeStats = Array.from(document.querySelectorAll(".episode-stat-value"));
  episodeStats.forEach((label) => {
    const episodePrefix = `${label.dataset.episode}-`;
    const levels = levelData.filter(({ level }) => level.startsWith(episodePrefix));
    const collectibles = levels.flatMap(({ collectibles }) => collectibles);
    const availableCount = collectibles.filter((status) => status !== 3).length;
    const collectedCount = collectibles.filter((status) => status > 0 && status < 3).length;

    if (episodePrefix === "2-"){
      label.firstChild.textContent = `${collectedCount}/${availableCount - 2}`;
      label.lastChild.textContent = ` ${Math.round((collectedCount / (availableCount - 2)) * 100)}%`;
    }
    else{
      label.firstChild.textContent = `${collectedCount}/${availableCount}`;
      label.lastChild.textContent = ` ${Math.round((collectedCount / availableCount) * 100)}%`;
    }
  });
}

// Render each level's collectible-status counts as stacks of stud images.
function renderCollectibleChart() {
  const countsByLevel = levelData.map(({ level, collectibles }) => ({
    level,
    counts: collectibleStates.map(({ values }) => collectibles.filter((item) => values.includes(item)).length)
  }));
  const maxCount = Math.max(0, ...countsByLevel.flatMap(({ counts }) => counts));
  const plotHeight = maxCount * studStep;

  chartContainer.style.setProperty("--plot-height", `${plotHeight}px`);
  chartContainer.style.setProperty("--chart-headroom", `${chartHeadroom}px`);
  chartContainer.style.setProperty("--axis-label-height", `${chartLabelHeight}px`);
  chartContainer.style.setProperty("--level-width", `${studWidth * 4 + 12}px`);
  chartContainer.style.setProperty("--stud-width", `${studWidth}px`);
  chartContainer.style.setProperty("--stud-height", `${studHeight}px`);
  chartYAxis.replaceChildren();
  chartPlot.replaceChildren();

  const ticks = document.createElement("div");
  ticks.className = "chart-y-ticks";
  for (let value = maxCount; value >= 0; value--) {
    if (value % 2 !== 0) {
      continue;
    }

    const tick = document.createElement("span");
    tick.className = "chart-y-tick";
    tick.textContent = value;
    tick.style.top = `${(maxCount - value) * studStep}px`;
    ticks.append(tick);
  }
  chartYAxis.append(ticks, document.createElement("div"));

  const gridLines = document.createElement("div");
  gridLines.className = "chart-gridlines";
  for (let value = maxCount; value >= 0; value--) {
    if (value % 2 !== 0) {
      continue;
    }

    const line = document.createElement("span");
    line.className = value === 0 ? "chart-gridline is-zero" : "chart-gridline";
    line.style.bottom = `${value * studStep}px`;
    gridLines.append(line);
  }

  const levels = document.createElement("div");
  levels.className = "chart-levels";
  let barAnimationIndex = 0;
  countsByLevel.forEach(({ level, counts }) => {
    const levelGroup = document.createElement("div");
    levelGroup.className = "chart-level";
    levelGroup.setAttribute("role", "group");
    levelGroup.setAttribute("aria-label", `Level ${level}`);

    const bars = document.createElement("div");
    bars.className = "chart-bars";
    counts.forEach((count, index) => {
      const state = collectibleStates[index];
      const column = document.createElement("div");
      column.className = "chart-column";

      const countLabel = document.createElement("span");
      countLabel.className = `chart-count-label chart-count-${state.color}`;
      countLabel.textContent = count;
      countLabel.style.bottom = `${count * studStep + countLabelGap}px`;
      countLabel.style.setProperty(
        "--fade-delay",
        `${barAnimationIndex * 0.1 + (count > 0 ? (count - 1) * 0.1 + 0.2 : 0)}s`
      );
      countLabel.setAttribute("aria-hidden", "true");

      const bar = document.createElement("div");
      bar.className = "chart-bar";
      bar.style.height = `${count * studStep}px`;
      bar.setAttribute("role", "img");
      bar.setAttribute("aria-label", `${state.label}: ${count}`);

      for (let i = 0; i < count; i++) {
        const stud = document.createElement("img");
        stud.src = state.image;
        stud.alt = "";
        stud.style.setProperty("--drop-offset", `${-(chartHeadroom + plotHeight - count * studStep + i * studStep + studHeight + 1)}px`);
        stud.style.setProperty("--drop-delay", `${(barAnimationIndex + count - i - 1) * 0.1}s`);
        bar.append(stud);
      }

      column.append(countLabel, bar);
      bars.append(column);
      barAnimationIndex++;
    });

    const levelLabel = document.createElement("span");
    levelLabel.className = "chart-level-label";
    levelLabel.textContent = level;
    levelGroup.append(bars, levelLabel);
    levels.append(levelGroup);
  });

  chartPlot.append(gridLines, levels);
  const plotWidth = Math.max(levels.scrollWidth, chartScroll.clientWidth);
  chartPlot.style.width = `${plotWidth}px`;
  gridLines.style.width = `${plotWidth}px`;
  updateChartScrollButtons();
}




// Load level records.
async function loadLevelData() {
  const response = await fetch("assets/data/data.json");
  if (!response.ok) {
    throw new Error(`Failed to load level data (${response.status}).`);
  }

  const records = await response.json();
  if (!Array.isArray(records)) {
    throw new TypeError("Level data must be an array.");
  }
  levelData = records;
  updateStats();
  updateUncollectedStats();
  renderEpisodeStats();
  renderCollectibleChart();
  await document.fonts.ready;
  document.body.classList.add("is-ready");
}

loadLevelData().catch(async (error) => {
  console.error("Unable to load overview statistics:", error);
  await document.fonts.ready;
  document.body.classList.add("is-ready");
});