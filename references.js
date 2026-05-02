const refreshBtn = document.getElementById("refreshBtn");

const artworks = [
  {
    image: document.getElementById("artImage1"),
    placeholder: document.getElementById("placeholder1"),
    title: document.getElementById("artTitle1"),
    meta: document.getElementById("artMeta1"),
    desc: document.getElementById("artDesc1"),
  },
  {
    image: document.getElementById("artImage2"),
    placeholder: document.getElementById("placeholder2"),
    title: document.getElementById("artTitle2"),
    meta: document.getElementById("artMeta2"),
    desc: document.getElementById("artDesc2"),
  },
  {
    image: document.getElementById("artImage3"),
    placeholder: document.getElementById("placeholder3"),
    title: document.getElementById("artTitle3"),
    meta: document.getElementById("artMeta3"),
    desc: document.getElementById("artDesc3"),
  }
];

const API_URL =
  "https://api.artic.edu/api/v1/artworks?fields=id,title,artist_display,date_display,place_of_origin,thumbnail,image_id&limit=100&page=";

function cleanText(text, fallback = "Unknown") {
  if (!text || typeof text !== "string") return fallback;
  return text.trim();
}

function getShortDescription(item) {
  if (item.thumbnail && item.thumbnail.alt_text) {
    return item.thumbnail.alt_text;
  }
  return "No description available.";
}

function getArtistName(artistDisplay) {
  if (!artistDisplay) return "Unknown artist";
  return artistDisplay.split("\n")[0].trim() || "Unknown artist";
}

function getImageUrl(imageId) {
  if (!imageId) return "";
  return `https://www.artic.edu/iiif/2/${imageId}/full/843,/0/default.jpg`;
}

function setLoading(card) {
  card.image.style.display = "none";
  card.placeholder.style.display = "flex";
  card.placeholder.textContent = "Loading...";
}

function setError(card) {
  card.image.style.display = "none";
  card.placeholder.style.display = "flex";
  card.placeholder.textContent = "Failed to load.";
}

function renderArtwork(card, item, index) {
  const artist = getArtistName(item.artist_display);
  const date = cleanText(item.date_display);
  const country = cleanText(item.place_of_origin);
  const title = cleanText(item.title, `Artwork ${index}`);
  const desc = getShortDescription(item);
  const imageUrl = getImageUrl(item.image_id);

  card.title.textContent = title.toUpperCase();
  card.meta.textContent = `${artist}, ${date}, ${country}`;
  card.desc.textContent = desc;

  if (imageUrl) {
    card.image.src = imageUrl;
    card.image.onload = () => {
      card.image.style.display = "block";
      card.placeholder.style.display = "none";
    };
  } else {
    setError(card);
  }
}

function pickThree(items) {
  const valid = items.filter(item => item.image_id && item.title);

  if (valid.length < 3) throw new Error("Not enough artworks");

  const shuffled = valid.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 3);
}

async function fetchArtworks() {
  refreshBtn.disabled = true;
  refreshBtn.textContent = "Loading...";

  artworks.forEach(setLoading);

  try {
    const page = Math.floor(Math.random() * 50) + 1;
    const res = await fetch(API_URL + page);
    const data = await res.json();

    const selected = pickThree(data.data);

    selected.forEach((item, i) => {
      renderArtwork(artworks[i], item, i + 1);
    });

  } catch (err) {
    console.error(err);
    artworks.forEach(setError);
  }

  refreshBtn.disabled = false;
  refreshBtn.textContent = "Refresh";
}

refreshBtn.addEventListener("click", fetchArtworks);
fetchArtworks();

const topBtn = document.getElementById("topBtn");

topBtn.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});