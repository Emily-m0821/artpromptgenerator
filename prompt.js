/**************************************************************
 * API
 **************************************************************/
const apiUrl = "https://prompt-generator-vercel-vert.vercel.app/api/prompts";


/**************************************************************
 * PROMPT BANK FROM DATABASE
 **************************************************************/
let PROMPT_BANK = {
  environment: [],
  character: [],
  colorPalette: [],
  perspective: [],
  emotion: [],
  mediaSkills: [],
  media: [],
  conceptualStorytelling: [],
  generated: []
};

/**************************************************************
 * FAVORITES STORAGE
 **************************************************************/
const FAVORITES_KEY = "artPromptFavorites";

let favorites = loadFavorites();
let currentPrompts = [];

/**************************************************************
 * SELECTORS
 **************************************************************/
const categoryForm = document.getElementById("categoryForm");
const promptCountSelect = document.getElementById("promptCount");
const generateBtn = document.getElementById("generateBtn");
const output = document.getElementById("output");
const favoritesBox = document.getElementById("favorites");

const promptOutput = document.getElementById("promptOutput");
const savePromptBtn = document.getElementById("savePromptBtn");
const generatePromptBtn = document.getElementById("generatePromptBtn");
const customPromptInput = document.getElementById("customPromptInput");

/**************************************************************
 * HELPERS
 **************************************************************/
function pickOne(array) {
  if (!array || array.length === 0) return null;
  const index = Math.floor(Math.random() * array.length);
  return array[index];
}

function getSelectedCategories() {
  if (!categoryForm) return [];

  const boxes = categoryForm.querySelectorAll('input[type="checkbox"]');
  const selected = [];

  boxes.forEach((box) => {
    if (box.checked) selected.push(box.value);
  });

  return selected;
}

function selectOnlyOneCategoryOnLoad() {
  if (!categoryForm) return;

  const checkboxes = categoryForm.querySelectorAll('input[type="checkbox"]');

  checkboxes.forEach((cb) => {
    cb.checked = false;
  });

  const usableCheckboxes = [...checkboxes].filter((cb) => cb.value !== "random");

  if (usableCheckboxes.length > 0) {
    const randomIndex = Math.floor(Math.random() * usableCheckboxes.length);
    usableCheckboxes[randomIndex].checked = true;
  }
}

function normalizeCategory(category) {
  if (!category) return "";

  const map = {
    environment: "environment",
    character: "character",
    characterdesign: "character",

    colorpalette: "colorPalette",
    color: "colorPalette",

    perspective: "perspective",

    emotion: "emotion",
    emotionmood: "emotion",
    "emotion&mood": "emotion",

    mediaskills: "mediaSkills",
    artskills: "mediaSkills",
    "artskills/techniques": "mediaSkills",

    media: "media",

    conceptualstorytelling: "conceptualStorytelling",
    conceptual: "conceptualStorytelling",
    storytelling: "conceptualStorytelling",

    generated: "generated"
  };

  const key = category.toString().trim().toLowerCase().replace(/\s+/g, "");
  return map[key] || "";
}

function makePrompt(selectedCategories) {
  let sentence = "Draw ";
  let addedMainIdea = false;

  if (selectedCategories.includes("character")) {
    const pickedCharacter = pickOne(PROMPT_BANK.character);
    if (pickedCharacter) {
      sentence += pickedCharacter;
      addedMainIdea = true;
    }
  }

  if (!addedMainIdea && selectedCategories.includes("conceptualStorytelling")) {
    const pickedConcept = pickOne(PROMPT_BANK.conceptualStorytelling);
    if (pickedConcept) {
      sentence += pickedConcept;
      addedMainIdea = true;
    }
  }

  if (!addedMainIdea && selectedCategories.includes("generated")) {
    const pickedGenerated = pickOne(PROMPT_BANK.generated);
    if (pickedGenerated) {
      sentence += pickedGenerated;
      addedMainIdea = true;
    }
  }

  if (!addedMainIdea) {
    sentence += "a subject of your choice";
  }

  if (selectedCategories.includes("environment")) {
    const pickedEnvironment = pickOne(PROMPT_BANK.environment);
    if (pickedEnvironment) {
      sentence += ` in ${pickedEnvironment}`;
    }
  }

  sentence += ".";

  if (selectedCategories.includes("colorPalette")) {
    const pickedColor = pickOne(PROMPT_BANK.colorPalette);
    if (pickedColor) {
      sentence += ` Color: ${pickedColor}.`;
    }
  }

  if (selectedCategories.includes("perspective")) {
    const pickedPerspective = pickOne(PROMPT_BANK.perspective);
    if (pickedPerspective) {
      sentence += ` Composition: ${pickedPerspective}.`;
    }
  }

  if (selectedCategories.includes("emotion")) {
    const pickedEmotion = pickOne(PROMPT_BANK.emotion);
    if (pickedEmotion) {
      sentence += ` Mood: ${pickedEmotion}.`;
    }
  }

  if (selectedCategories.includes("mediaSkills")) {
    const pickedSkill = pickOne(PROMPT_BANK.mediaSkills);
    if (pickedSkill) {
      sentence += ` Skill focus: ${pickedSkill}.`;
    }
  }

  if (selectedCategories.includes("media")) {
    const pickedMedia = pickOne(PROMPT_BANK.media);
    if (pickedMedia) {
      sentence += ` Media: ${pickedMedia}.`;
    }
  }

  return {
    id: Date.now().toString() + Math.random().toString(16).slice(2),
    text: sentence
  };
}

/**************************************************************
 * FAVORITES
 **************************************************************/
function loadFavorites() {
  const raw = localStorage.getItem(FAVORITES_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveFavorites() {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

function isFavorite(text) {
  return favorites.some((item) => item.text === text);
}

function toggleFavorite(promptObj) {
  if (isFavorite(promptObj.text)) {
    favorites = favorites.filter((item) => item.text !== promptObj.text);
  } else {
    favorites.unshift(promptObj);
  }

  saveFavorites();
  renderPrompts();
  renderFavorites();
}

/**************************************************************
 * RENDER
 **************************************************************/
function createPromptCard(promptObj) {
  const card = document.createElement("div");
  card.className = "prompt-card";

  const text = document.createElement("div");
  text.className = "prompt-text";
  text.textContent = promptObj.text;

  const favBtn = document.createElement("button");
  favBtn.className = "fav-btn";
  favBtn.innerHTML = "◆";

  if (isFavorite(promptObj.text)) {
    favBtn.classList.add("saved");
  }

  favBtn.addEventListener("click", () => {
    toggleFavorite(promptObj);
  });

  card.appendChild(text);
  card.appendChild(favBtn);

  return card;
}

function renderPrompts() {
  if (!output) return;

  output.innerHTML = "";

  currentPrompts.forEach((promptObj) => {
    output.appendChild(createPromptCard(promptObj));
  });
}

function renderFavorites() {
  if (!favoritesBox) return;

  favoritesBox.innerHTML = "";

  favorites.forEach((promptObj) => {
    favoritesBox.appendChild(createPromptCard(promptObj));
  });
}

/**************************************************************
 * GENERATE
 **************************************************************/
function generatePrompts() {
  const selected = getSelectedCategories();
  const nonRandomSelected = selected.filter((category) => category !== "random");
  let count = Number(promptCountSelect?.value || 3);

  if (nonRandomSelected.length === 0) {
    alert("Please select at least one category.");
    return;
  }

  if (!Number.isFinite(count)) count = 2;
  if (count < 2) count = 2;
  if (count > 6) count = 6;

  if (promptCountSelect) {
    promptCountSelect.value = count;
  }

  currentPrompts = [];

  for (let i = 0; i < count; i++) {
    currentPrompts.push(makePrompt(nonRandomSelected));
  }

  renderPrompts();
}

/**************************************************************
 * DATABASE
 **************************************************************/
function clearPromptBank() {
  Object.keys(PROMPT_BANK).forEach((key) => {
    PROMPT_BANK[key] = [];
  });
}

async function loadPrompts() {
  try {
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`Failed to load prompts: ${response.status}`);
    }

    const data = await response.json();

    clearPromptBank();

    data.forEach((prompt) => {
      const normalizedCategory = normalizeCategory(prompt.category);

      if (normalizedCategory && PROMPT_BANK[normalizedCategory]) {
        PROMPT_BANK[normalizedCategory].push(prompt.text);
      }
    });

    console.log("Loaded prompt bank from database:", PROMPT_BANK);
  } catch (error) {
    console.error("Error loading prompts:", error);
  }
}

async function savePrompt(promptText) {
  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text: promptText,
        category: "generated"
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to save prompt: ${response.status}`);
    }

    const result = await response.json();
    console.log("Saved:", result);

    await loadPrompts();
  } catch (error) {
    console.error("Error saving prompt:", error);
  }
}

function generateRandomPrompt() {
  if (!promptOutput) return;

  const randomPrompt = pickOne(PROMPT_BANK.generated);

  if (!randomPrompt) {
    promptOutput.textContent = 'No prompts saved in the "generated" category yet.';
    return;
  }

  promptOutput.textContent = randomPrompt;
}

/**************************************************************
 * EVENTS
 **************************************************************/
if (generateBtn) {
  generateBtn.addEventListener("click", generatePrompts);
}

if (savePromptBtn) {
  savePromptBtn.addEventListener("click", async () => {
    const promptText = customPromptInput ? customPromptInput.value.trim() : "";

    if (!promptText) {
      alert("Please enter a prompt first.");
      return;
    }

    await savePrompt(promptText);

    if (customPromptInput) {
      customPromptInput.value = "";
    }

    alert("Prompt saved to Generated category!");
  });
}

if (generatePromptBtn) {
  generatePromptBtn.addEventListener("click", generateRandomPrompt);
}

/**************************************************************
 * INITIALIZE
 **************************************************************/
function setPromptCountRange() {
  if (!promptCountSelect) return;

  promptCountSelect.innerHTML = "";

  for (let i = 2; i <= 6; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = i;
    promptCountSelect.appendChild(option);
  }

  promptCountSelect.value = 3;
}

selectOnlyOneCategoryOnLoad();
setPromptCountRange();
renderFavorites();

loadPrompts().then(() => {
  generatePrompts();
});

const refreshBtn = document.getElementById("refreshBtn");
const sketchImage = document.getElementById("sketchImage");

function loadNewImage() {
  const randomId = Math.floor(Math.random() * 1000);
  sketchImage.src = `https://picsum.photos/300/420?random=${randomId}`;
}

/* back to the top button*/
refreshBtn.addEventListener("click", loadNewImage);

const topBtn = document.getElementById("topBtn");

topBtn.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});