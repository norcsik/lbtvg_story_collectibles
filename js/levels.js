// Map marker positions are measured from the approved 960 by 954 pixel map frame.
const markerFiles = {
  default: "level-marker.svg",
  active: "level-marker-active.svg"
};

const chapters = [
  {
    title: "The Riddler’s Revenge - Hero",
    levels: [
      ["1-1", 211, 499, "default", 0], ["1-2", 277, 255, "villain", 1], ["1-3", 347, 428, "active", 2], ["1-4", 607, 284, "special", 3], ["1-5", 806, 787, "special", 4]
    ]
  },
  {
    title: "Power Crazed Penguin - Hero",
    levels: [
      ["2-1", 174, 552, "hero", 5], ["2-2", 228, 805, "hero", 6], ["2-3", 371, 614, "hero", 7], ["2-4", 693, 408, "hero", 8], ["2-5", 855, 346, "hero", 9]
    ]
  },
  {
    title: "The Joker's Return - Hero",
    levels: [
      ["3-1", 176, 705, "hero", 10], ["3-2", 307, 662, "hero", 11], ["3-3", 426, 499, "hero", 12], ["3-4", 529, 662, "hero", 13], ["3-5", 709, 537, "hero", 14]
    ]
  },
  {
    title: "The Riddler’s Revenge - Villain",
    levels: [
      ["4-1", 211, 499, "hero", 15], ["4-2", 277, 255, "villain", 16], ["4-3", 607, 284, "special", 17], ["4-4", 436, 576, "hero", 18], ["4-5", 806, 787, "special", 19]
    ]
  },
  {
    title: "Power Crazed Penguin - Villain",
    levels: [
      ["5-1", 95, 751, "hero", 20], ["5-2", 142, 556, "hero", 21], ["5-3", 228, 805, "hero", 22], ["5-4", 371, 614, "hero", 23], ["5-5", 855, 346, "hero", 24]
    ]
  },
  {
    title: "The Joker's Return - Villain",
    levels: [
      ["6-1", 307, 662, "hero", 25], ["6-2", 396, 499, "hero", 26], ["6-3", 591, 462, "active", 27], ["6-4", 529, 662, "hero", 28], ["6-5", 709, 537, "hero", 29]
    ]
  }
];

//Data labels
const markerContainer = document.querySelector("#level-markers");
const mapImage = document.querySelector(".level-map-image");
const mapFallback = document.querySelector(".level-map-fallback");
const mapStaticBurst = document.querySelector(".map-static-burst");
const chapterHeading = document.querySelector("#chapter-title");
const selectedLevelHeading = document.querySelector("#selected-level-title");
const completionPercentageLabel = document.querySelector("#level-completion");
const minikitFeature = document.querySelector(".minikit-feature");
const minikitCountLabel = document.querySelector("#minikit-count");
const minikitGridContainer = document.querySelector(".minikit-grid");
const hostageFeature = document.querySelector(".hostage-feature");
const brickFeature = document.querySelector(".brick-feature");
const minikitGrid = Array.from(document.querySelectorAll(".minikit-grid img"));
const otherIcons = Array.from(document.querySelectorAll(".collectible-type-icon"));
const otherIconButtons = Array.from(document.querySelectorAll(".special-collectibles .collectible-popup-trigger"));
const chapterButtons = document.querySelectorAll("[data-chapter-step]");
const videoPopup = document.querySelector("#video-popup");
const videoPopupClose = document.querySelector("#video-popup-close");
const videoPopupPrevious = document.querySelector("#video-popup-previous");
const videoPopupNext = document.querySelector("#video-popup-next");
let videoPopupYoutube = document.querySelector("#video-popup-youtube");
const videoPopupVideo = document.querySelector("#video-popup-video");
const videoPopupNoVideo = document.querySelector("#video-popup-no-video");
const videoPopupDescription = document.querySelector("#video-popup-description");
const videoPopupIcons = document.querySelector("#video-popup-icons");
const chapterSwitchSound = new Audio("assets/sounds/BATARANG_LOCK_2.wav");
const levelSelectSound = new Audio("assets/sounds/MENUSELECT.wav");

function playSound(sound) {
  sound.currentTime = 0;
  sound.play().catch((error) => {
    console.error("Unable to play interface sound:", error);
  });
}

// Image paths
const minikitIcons = ["assets/images/collectibles/minikit_0.png", "assets/images/collectibles/minikit_1.png", "assets/images/collectibles/minikit_2.png"];
const hostageIcons = ["assets/images/collectibles/head_0.png", "assets/images/collectibles/head_1.png", "assets/images/collectibles/head_2.png", "assets/images/collectibles/head_3.png"];
const brickIcons = ["assets/images/collectibles/brick_0.png", "assets/images/collectibles/brick_1.png", "assets/images/collectibles/brick_2.png"];

// State variables
let currentChapter = 0;
let selectedLevel = "1-1";
let levelData = [];
let currentRecord = null;
let currentPopupCollectibleIndex = 0;
let popupReturnFocus = null;
let currentMapVariant = "hero";
const textAnimationDuration = 250;
const textAnimationTimers = new WeakMap();
const mapStaticBurstDuration = 400;
let mapStaticBurstTimer;
let mapStaticBurstGeneration = 0;

mapImage.addEventListener("loadeddata", () => {
  mapImage.classList.remove("is-unavailable");
});
mapImage.addEventListener("error", () => {
  mapImage.classList.add("is-unavailable");
  console.error("Unable to load map background:", mapImage.error);
});
if (mapImage.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
  mapImage.classList.remove("is-unavailable");
}

//Text animations
function cancelTextAnimation(element) {
  const activeAnimation = textAnimationTimers.get(element);
  if (Array.isArray(activeAnimation)) {
    activeAnimation.forEach(clearTimeout);
  } else if (activeAnimation) {
    clearInterval(activeAnimation.interval);
    clearTimeout(activeAnimation.timeout);
  }
  textAnimationTimers.delete(element);
}

function animateText(element, nextText) {
  const target = String(nextText);
  cancelTextAnimation(element);
  const originalCharacters = Array.from(element.textContent);
  const targetCharacters = Array.from(target);
  const characterCount = Math.max(originalCharacters.length, targetCharacters.length);
  const changedIndices = Array.from({ length: characterCount }, (_, index) => index)
    .filter((index) => (originalCharacters[index] || "") !== (targetCharacters[index] || ""));

  if (!changedIndices.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    element.textContent = target;
    return;
  }

  const currentCharacters = Array.from({ length: characterCount }, (_, index) => originalCharacters[index] || "");
  const nextCharacters = Array.from({ length: characterCount }, (_, index) => targetCharacters[index] || "");
  const timers = changedIndices.map((characterIndex, changeIndex) => setTimeout(() => {
    currentCharacters[characterIndex] = nextCharacters[characterIndex];
    element.textContent = currentCharacters.join("");
    if (changeIndex === changedIndices.length - 1) {
      textAnimationTimers.delete(element);
    }
  }, ((changeIndex + 1) / changedIndices.length) * textAnimationDuration));
  textAnimationTimers.set(element, timers);
}

function animateNumberText(element, nextText) {
  const target = String(nextText);
  const currentMatch = element.textContent.match(/^(\d+)(.*)$/);
  const targetMatch = target.match(/^(\d+)(.*)$/);
  if (!currentMatch || !targetMatch || currentMatch[2] !== targetMatch[2]) {
    animateText(element, target);
    return;
  }

  cancelTextAnimation(element);
  if (element.textContent === target || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    element.textContent = target;
    return;
  }

  const startValue = Number(currentMatch[1]);
  const targetValue = Number(targetMatch[1]);
  const direction = Math.sign(targetValue - startValue);
  const startedAt = performance.now();
  const updateNumber = () => {
    const progress = Math.min((performance.now() - startedAt) / textAnimationDuration, 1);
    const step = Math.floor(progress * Math.abs(targetValue - startValue));
    element.textContent = `${startValue + direction * step}${targetMatch[2]}`;
  };

  updateNumber();
  const interval = setInterval(updateNumber, 10);
  const timeout = setTimeout(() => {
    clearInterval(interval);
    element.textContent = target;
    textAnimationTimers.delete(element);
  }, textAnimationDuration);
  textAnimationTimers.set(element, { interval, timeout });
}

function playMapStaticBurst() {
  const generation = ++mapStaticBurstGeneration;
  clearTimeout(mapStaticBurstTimer);
  mapStaticBurst.hidden = true;
  mapStaticBurst.removeAttribute("src");
  mapStaticBurst.onload = () => {
    if (generation !== mapStaticBurstGeneration) {
      return;
    }

    mapStaticBurstTimer = setTimeout(() => {
      if (generation !== mapStaticBurstGeneration) {
        return;
      }

      mapStaticBurst.hidden = true;
      mapStaticBurst.removeAttribute("src");
    }, mapStaticBurstDuration);
  };
  const burstUrl = new URL(mapStaticBurst.dataset.src, document.baseURI);
  burstUrl.searchParams.set("play", String(generation));
  mapStaticBurst.src = burstUrl.href;
  mapStaticBurst.hidden = false;
}

mapStaticBurst.addEventListener("error", () => {
  mapStaticBurst.hidden = true;
  console.error("Unable to load map transition:", mapStaticBurst.dataset.src);
});

// Draw the current chapter's accessible level buttons over the map artwork.
function renderMarkers() {
  const chapter = chapters[currentChapter];
  animateText(chapterHeading, chapter.title);
  const nextMapVariant = currentChapter < 3 ? "hero" : "villain";
  if (nextMapVariant !== currentMapVariant) {
    currentMapVariant = nextMapVariant;
    mapFallback.src = `assets/images/map/${currentMapVariant}_map.png`;
    mapImage.classList.add("is-unavailable");
    mapImage.src = `assets/images/map/${currentMapVariant}_map.mp4`;
    mapImage.load();
    mapImage.play().catch((error) => {
      console.error("Unable to play map background:", error);
    });

    playMapStaticBurst();
  }
  markerContainer.replaceChildren();

  chapter.levels.forEach(([label, x, y]) => {
    const marker = document.createElement("button");
    marker.className = "level-marker";
    marker.type = "button";
    marker.setAttribute("aria-label", `Select level ${label}`);
    marker.setAttribute("aria-pressed", String(label === selectedLevel));
    marker.style.left = `${(x / 960) * 100}%`;
    marker.style.top = `${((y - 70) / 954) * 100}%`;

    const image = document.createElement("img");
    image.src = `assets/images/ui/${label === selectedLevel ? markerFiles.active : markerFiles.default}`;
    image.alt = "";
    marker.append(image);

    const text = document.createElement("span");
    text.textContent = label;
    marker.append(text);
    marker.addEventListener("click", () => {
      playSound(levelSelectSound);
      selectLevel(label);
    });
    markerContainer.append(marker);
  });
}

function getYouTubeEmbedUrl(videoValue) {
  if (typeof videoValue !== "string" || videoValue.trim().length === 0) {
    return "";
  }

  const value = videoValue.trim();
  const videoIdPattern = /^[A-Za-z0-9_-]{11}$/;
  if (videoIdPattern.test(value)) {
    return `https://www.youtube.com/embed/${value}`;
  }

  let url;
  try {
    url = new URL(value);
  } catch (error) {
    if (error instanceof TypeError) {
      return "";
    }
    throw error;
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return "";
  }

  let videoId = "";
  if (url.hostname === "youtu.be") {
    videoId = url.pathname.split("/").filter(Boolean)[0] || "";
  } else if ([
    "youtube.com",
    "www.youtube.com",
    "m.youtube.com",
    "youtube-nocookie.com",
    "www.youtube-nocookie.com",
  ].includes(url.hostname)) {
    if (url.pathname === "/watch") {
      videoId = url.searchParams.get("v") || "";
    } else {
      const match = url.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)/);
      videoId = match ? match[1] : "";
    }
  }

  return videoIdPattern.test(videoId) ? `https://www.youtube.com/embed/${videoId}` : "";
}

// Convert a local video filename from the level data to its MP4 path.
function getVideoAssetPath(videoName) {
  if (typeof videoName !== "string" || videoName.trim().length === 0) {
    return "";
  }

  const value = videoName.trim();
  return /^[a-z][a-z\d+.-]*:/i.test(value) ? "" : `assets/videos/${value}.mp4`;
}

function getCollectibleLabel(index) {
  const minikitCount = currentRecord.collectibles.length - 2;
  if (index < minikitCount) {
    return `Minikit ${index + 1}`;
  }
  return index === minikitCount ? "Hostage" : "Brick";
}

function showPopupCollectible(index) {
  const collectibleCount = currentRecord.collectibles.length;
  if (!Number.isInteger(index) || index < 0 || index >= collectibleCount) {
    throw new RangeError(`Collectible index ${index} is outside the current level.`);
  }

  currentPopupCollectibleIndex = index;
  const label = getCollectibleLabel(index);
  const videoValue = currentRecord.videos[index];
  const youtubeUrl = getYouTubeEmbedUrl(videoValue);
  const videoPath = getVideoAssetPath(videoValue);
  const description = currentRecord.description[index];

  const nextYoutubeFrame = videoPopupYoutube.cloneNode(false);
  nextYoutubeFrame.removeAttribute("src");
  nextYoutubeFrame.hidden = true;
  videoPopupYoutube.replaceWith(nextYoutubeFrame);
  videoPopupYoutube = nextYoutubeFrame;

  videoPopupVideo.setAttribute("aria-label", `${label} walkthrough video`);
  videoPopupVideo.pause();
  videoPopupVideo.removeAttribute("src");
  videoPopupVideo.load();
  videoPopupVideo.hidden = true;

  if (youtubeUrl) {
    videoPopupYoutube.title = `${label} walkthrough video`;
    videoPopupYoutube.hidden = false;
    videoPopupYoutube.src = youtubeUrl;
    videoPopupNoVideo.hidden = true;
  } else if (videoPath) {
    videoPopupVideo.hidden = false;
    videoPopupVideo.src = videoPath;
    videoPopupVideo.load();
    videoPopupNoVideo.hidden = true;
  } else {
    videoPopupVideo.removeAttribute("src");
    videoPopupVideo.load();
    videoPopupVideo.hidden = true;
    videoPopupNoVideo.textContent = `No video is available for ${label.toLowerCase()}.`;
    videoPopupNoVideo.hidden = false;
  }

  videoPopupDescription.textContent = typeof description === "string" && description.trim()
    ? description
    : `No description is available for ${label.toLowerCase()}.`;

  Array.from(videoPopupIcons.children).forEach((icon, iconIndex) => {
    if (iconIndex === index) {
      icon.setAttribute("aria-current", "true");
    } else {
      icon.removeAttribute("aria-current");
    }
  });
}

function renderPopupIcons() {
  const minikitCount = currentRecord.collectibles.length - 2;
  videoPopupIcons.replaceChildren();
  videoPopupIcons.style.setProperty("--popup-icon-count", currentRecord.collectibles.length);

  const appendIcon = (index, label, iconPaths) => {
    const src = iconPaths[currentRecord.collectibles[index]];
    if (!src) {
      throw new RangeError(`No icon is available for ${label} with status ${currentRecord.collectibles[index]}.`);
    }

    const button = document.createElement("button");
    button.className = "video-popup-icon-button";
    button.type = "button";
    button.setAttribute("aria-label", `Show ${label} walkthrough`);
    button.addEventListener("click", () => showPopupCollectible(index));

    const image = document.createElement("img");
    image.src = src;
    image.alt = "";
    button.append(image);
    videoPopupIcons.append(button);
  };

  for (let i = 0; i < minikitCount; i++) {
    appendIcon(i, `minikit ${i + 1}`, minikitIcons);
  }
  appendIcon(minikitCount, "hostage", hostageIcons);
  appendIcon(minikitCount + 1, "brick", brickIcons);
}

function openVideoPopup(index, trigger) {
  if (!currentRecord) {
    throw new Error("Cannot open a collectible walkthrough before level data is loaded.");
  }

  popupReturnFocus = trigger;
  renderPopupIcons();
  videoPopup.showModal();
  showPopupCollectible(index);
}

// Update the selected level data and pressed state after a map selection.
function selectLevel(label, animate = true) {
  const level = chapters[currentChapter].levels.find(([levelLabel]) => levelLabel === label);
  if (!level) {
    throw new Error(`Level ${label} is not defined in the current chapter.`);
  }

  const record = levelData[level[4]];
  if (!record || typeof record.name !== "string") {
    throw new Error(`No level name found for data index ${level[4]}.`);
  }

  currentRecord = record;
  otherIconButtons.forEach((button) => {
    button.disabled = false;
  });
  selectedLevel = label;

  //Set up variables for level completion and minikit count
  let totalCollectibles = 0;
  let completionPercentage = 0;
  let totalMinikits = 0;
  const minikitCount = record.collectibles.length - 2;
  const minikitColumns = Math.ceil(minikitCount / 2);
  let collectibleCount = 0;

  // Calculate level completion percentage.
  for (let collectible of record.collectibles){
    if (collectible < 3){
      //Update number of available collectibles
      collectibleCount++;
      //Update collected
      if (collectible >= 1 && collectible < 3){
        totalCollectibles++;
      }
    }
  }

  //Cap number of available collectibles at 12
  if (collectibleCount > 12){
    collectibleCount = 12;
  }

  completionPercentage = Math.round((totalCollectibles / collectibleCount) * 100);
  minikitFeature.style.setProperty("--minikit-reveal", `${completionPercentage}%`);

  const hostageStatus = record.collectibles[record.collectibles.length - 2];
  const brickStatus = record.collectibles[record.collectibles.length - 1];
  hostageFeature.classList.toggle("is-solid", hostageStatus === 1 || hostageStatus === 2);
  brickFeature.classList.toggle("is-solid", brickStatus === 1 || brickStatus === 2);

  // Calculate total minikits collected.
  for(let i = 0; i < minikitCount; i++){
    if (record.collectibles[i] > 0){
      totalMinikits++;
    }
  }

  //Update percentage and minikit count labels
  const minikitCountText = `${totalMinikits}/10`;
  const completionPercentageText = `${completionPercentage}%`;
  if (animate) {
    animateText(selectedLevelHeading, record.name);
    animateNumberText(completionPercentageLabel, completionPercentageText);
    animateNumberText(minikitCountLabel, minikitCountText);
  } else {
    selectedLevelHeading.textContent = record.name;
    completionPercentageLabel.textContent = completionPercentageText;
    minikitCountLabel.textContent = minikitCountText;
  }
  minikitGridContainer.setAttribute("aria-label", `Minikit status for ${minikitCount} collectibles`);
  minikitGridContainer.replaceChildren();
  minikitGrid.splice(0, minikitGrid.length);

  // Update collectible images to correspond with their obtainability
  for (let i = 0; i < record.collectibles.length; i++){
    if(i < record.collectibles.length - 2){
      const minikitIcon = document.createElement("img");
      minikitIcon.src = minikitIcons[record.collectibles[i]];
      minikitIcon.alt = "";

      const minikitButton = document.createElement("button");
      minikitButton.className = "collectible-popup-trigger";
      minikitButton.type = "button";
      minikitButton.setAttribute("aria-label", `Show minikit ${i + 1} walkthrough`);
      minikitButton.setAttribute("aria-haspopup", "dialog");
      minikitButton.style.gridRow = `${Math.floor(i / minikitColumns) + 1}`;
      minikitButton.style.gridColumn = `${i % minikitColumns + 1}`;
      minikitButton.addEventListener("click", () => openVideoPopup(i, minikitButton));
      minikitButton.append(minikitIcon);

      minikitGrid.push(minikitIcon);
      minikitGridContainer.append(minikitButton);
    }
    else if (i === record.collectibles.length - 2){
      otherIcons[0].src = hostageIcons[record.collectibles[i]];
    }
    else{
      otherIcons[1].src = brickIcons[record.collectibles[i]];
    }
  }



  // Render the level markers
  renderMarkers();
}

otherIconButtons.forEach((button, index) => {
  button.addEventListener("click", () => {
    const collectibleIndex = currentRecord.collectibles.length - 2 + index;
    openVideoPopup(collectibleIndex, button);
  });
});

videoPopupClose.addEventListener("click", () => videoPopup.close());
videoPopupPrevious.addEventListener("click", () => {
  const count = currentRecord.collectibles.length;
  showPopupCollectible((currentPopupCollectibleIndex - 1 + count) % count);
});
videoPopupNext.addEventListener("click", () => {
  const count = currentRecord.collectibles.length;
  showPopupCollectible((currentPopupCollectibleIndex + 1) % count);
});
videoPopup.addEventListener("close", () => {
  videoPopupVideo.pause();
  videoPopupVideo.removeAttribute("src");
  videoPopupVideo.load();
  videoPopupVideo.hidden = true;
  videoPopupYoutube.removeAttribute("src");
  videoPopupYoutube.hidden = true;
  videoPopupNoVideo.hidden = true;
  videoPopupIcons.replaceChildren();
  if (popupReturnFocus && popupReturnFocus.isConnected) {
    popupReturnFocus.focus();
  }
  popupReturnFocus = null;
});

async function synchronizeCollectibleAnimations() {
  const images = Array.from(document.querySelectorAll(".minikit-feature img, .hostage-feature img, .brick-feature img"));
  const synchronizationId = String(Date.now());
  const imageUrls = images.map((image) => {
    const imageUrl = new URL(image.getAttribute("src"), document.baseURI);
    imageUrl.searchParams.set("sync", synchronizationId);
    return imageUrl.href;
  });
  const preloads = imageUrls.map((url) => {
    const preload = new Image();
    preload.src = url;
    return preload.decode();
  });
  await Promise.all(preloads);

  images.forEach((image, index) => {
    image.src = imageUrls[index];
  });
  await Promise.all(images.map((image) => image.decode()));
}

// Load level records before enabling map and chapter selection.
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

  // The chapter arrows switch between the available level groups.
  chapterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      playSound(chapterSwitchSound);
      currentChapter = (currentChapter + Number(button.dataset.chapterStep) + chapters.length) % chapters.length;
      selectedLevel = chapters[currentChapter].levels[0][0];
      selectLevel(selectedLevel);
    });
  });

  selectLevel(selectedLevel, false);
  await Promise.all([document.fonts.ready, synchronizeCollectibleAnimations()]);
  document.body.classList.add("is-ready");
}

loadLevelData().catch(async (error) => {
  console.error("Unable to initialize level selection:", error);
  await document.fonts.ready;
  document.body.classList.add("is-ready");
});
