const apiUrl = "https://prompt-generator-vercel-vert.vercel.app/api/prompts";

const timerDisplay = document.getElementById("timerDisplay");
const topTimeLabel = document.getElementById("topTimeLabel");
const timeInput = document.getElementById("timeInput");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const restartBtn = document.getElementById("restartBtn");
const progressBar = document.getElementById("progressBar");
const promptsContainer = document.getElementById("promptsContainer");

let countdown;
let totalSeconds = 600;
let timeLeft = 600;
let isRunning = false;

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function updateDisplay() {
  if (timerDisplay) {
    timerDisplay.textContent = formatTime(timeLeft);
  }

  if (topTimeLabel) {
    topTimeLabel.textContent = formatTime(totalSeconds);
  }

  if (progressBar) {
    const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;
    progressBar.style.width = progress + "%";
  }
}

function resetTimer() {
  if (!timeInput) return;

  let minutes = parseInt(timeInput.value, 10);

  if (isNaN(minutes) || minutes < 1) {
    minutes = 1;
    timeInput.value = 1;
  }

  if (minutes > 30) {
    minutes = 30;
    timeInput.value = 30;
  }

  totalSeconds = minutes * 60;
  timeLeft = totalSeconds;

  clearInterval(countdown);
  updateDisplay();
  isRunning = false;
}

if (timeInput) {
  timeInput.addEventListener("change", resetTimer);
}

if (startBtn) {
  startBtn.onclick = () => {
    if (isRunning) return;

    isRunning = true;

    countdown = setInterval(() => {
      if (timeLeft > 0) {
        timeLeft--;
        updateDisplay();
      } else {
        clearInterval(countdown);
        isRunning = false;
        alert("Time's up!");
      }
    }, 1000);
  };
}

if (pauseBtn) {
  pauseBtn.onclick = () => {
    clearInterval(countdown);
    isRunning = false;
  };
}

if (restartBtn) {
  restartBtn.onclick = () => {
    clearInterval(countdown);
    timeLeft = totalSeconds;
    updateDisplay();
    isRunning = false;
  };
}

/* SAVED PROMPTS */

function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem("artPromptFavorites")) || [];
  } catch (error) {
    console.error("Error reading favorites:", error);
    return [];
  }
}

function saveFavorites(favorites) {
  localStorage.setItem("artPromptFavorites", JSON.stringify(favorites));
}

function getLatestPrompt() {
  return localStorage.getItem("latestChallengePrompt") || "";
}

function saveSelectedChallengePrompt(text) {
  localStorage.setItem("selectedChallengePrompt", text);
}

function getSelectedChallengePrompt() {
  return localStorage.getItem("selectedChallengePrompt") || "";
}

function dedupePrompts(promptList) {
  const uniquePrompts = [];
  const seen = new Set();

  promptList.forEach((prompt) => {
    if (!prompt || !prompt.text) return;

    const normalizedText = prompt.text.trim();

    if (!normalizedText) return;

    if (!seen.has(normalizedText)) {
      seen.add(normalizedText);
      uniquePrompts.push(prompt);
    }
  });

  return uniquePrompts;
}

async function getGeneratedPromptsFromDB() {
  try {
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`Failed to load prompts: ${response.status}`);
    }

    const data = await response.json();

    return data
      .filter((item) => item && item.category === "generated" && item.text)
      .map((item) => ({
        text: item.text,
        source: "database"
      }));
  } catch (error) {
    console.error("Error loading generated prompts from database:", error);
    return [];
  }
}

function createPromptCard(prompt, isSelected = false) {
  const card = document.createElement("div");
  card.className = "prompt-card";

  if (isSelected) {
    card.classList.add("selected");
  }

  const text = document.createElement("p");
  text.textContent = prompt.text;

  const diamondBtn = document.createElement("button");
  diamondBtn.className = "diamond-btn";
  diamondBtn.type = "button";

  const diamond = document.createElement("span");
  diamond.className = "diamond";

  diamondBtn.appendChild(diamond);
  card.appendChild(text);
  card.appendChild(diamondBtn);

  card.addEventListener("click", () => {
    document.querySelectorAll(".prompt-card").forEach((item) => {
      item.classList.remove("selected");
    });

    card.classList.add("selected");
    saveSelectedChallengePrompt(prompt.text);
  });

  diamondBtn.addEventListener("click", (e) => {
    e.stopPropagation();

    let favorites = getFavorites();
    favorites = favorites.filter((item) => item.text !== prompt.text);

    saveFavorites(favorites);
    card.remove();
  });

  return card;
}

async function loadPrompts() {
  if (!promptsContainer) return;

  const latestPrompt = getLatestPrompt();
  const favorites = getFavorites();
  const dbGeneratedPrompts = await getGeneratedPromptsFromDB();

  promptsContainer.innerHTML = "";

  const combinedPrompts = [];

  if (latestPrompt) {
    combinedPrompts.push({
      text: latestPrompt,
      source: "latest"
    });
  }

  favorites.forEach((promptObj) => {
    if (promptObj && promptObj.text) {
      combinedPrompts.push({
        text: promptObj.text,
        source: "favorite"
      });
    }
  });

  dbGeneratedPrompts.forEach((promptObj) => {
    combinedPrompts.push(promptObj);
  });

  const uniquePrompts = dedupePrompts(combinedPrompts);

  if (uniquePrompts.length === 0) {
    promptsContainer.innerHTML = "<p>No saved prompts yet.</p>";
    return;
  }

  const savedSelectedText = getSelectedChallengePrompt();
  let hasSelectedMatch = false;

  uniquePrompts.forEach((prompt, index) => {
    const shouldSelect =
      (savedSelectedText && prompt.text === savedSelectedText) ||
      (!savedSelectedText && index === 0);

    if (shouldSelect) {
      hasSelectedMatch = true;
    }

    const card = createPromptCard(prompt, shouldSelect);
    promptsContainer.appendChild(card);
  });

  if (!hasSelectedMatch && uniquePrompts.length > 0) {
    saveSelectedChallengePrompt(uniquePrompts[0].text);

    const firstCard = promptsContainer.querySelector(".prompt-card");

    if (firstCard) {
      firstCard.classList.add("selected");
    }
  }
}

/* QUICK SKETCH */

const sketchImage = document.getElementById("sketchImage");
const refreshBtn = document.getElementById("refreshBtn");


if (refreshBtn && sketchImage) {
  refreshBtn.addEventListener("click", () => {
    sketchImage.src = `https://picsum.photos/600/360?random=${Date.now()}`;
  });
}



/* BACK TO TOP */

const topBtn = document.getElementById("topBtn");

if (topBtn) {
  topBtn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });
}

updateDisplay();
loadPrompts();