const API_URL = "https://prompt-generator-vercel-vert.vercel.app/api/community";

const artistName = document.getElementById("artistName");
const artDescription = document.getElementById("artDescription");
const artImage = document.getElementById("artImage");
const previewImage = document.getElementById("previewImage");
const shareBtn = document.getElementById("shareBtn");
const postContainer = document.getElementById("postContainer");

let selectedImage = "";

artImage.addEventListener("change", function () {
  const file = artImage.files[0];

  if (file) {
    const reader = new FileReader();

    reader.onload = function (event) {
      selectedImage = event.target.result;
      previewImage.src = selectedImage;
      previewImage.style.display = "block";
    };

    reader.readAsDataURL(file);
  }
});

shareBtn.addEventListener("click", async function () {
  if (
    artistName.value.trim() === "" ||
    artDescription.value.trim() === "" ||
    selectedImage === ""
  ) {
    alert("Please add your name, description, and artwork image.");
    return;
  }

  const newPost = {
    name: artistName.value,
    description: artDescription.value,
    image: selectedImage
  };

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(newPost)
  });

  const result = await response.json();
  console.log("MongoDB save result:", result);

  artistName.value = "";
  artDescription.value = "";
  artImage.value = "";
  previewImage.style.display = "none";
  selectedImage = "";

  loadPosts();
});

async function loadPosts() {
  const response = await fetch(API_URL);
  const posts = await response.json();

  postContainer.innerHTML = "";

  posts.forEach(function (post) {
    const postCard = document.createElement("div");
    postCard.classList.add("post-card");

    postCard.innerHTML = `
      <img src="${post.image}" alt="Artwork">

      <h3>${post.name}</h3>

      <p>${post.description}</p>

      <button class="like-btn" onclick="likePost('${post._id}')">
        ♥ Like (${post.likes})
      </button>

      <div class="comment-section">
        <input 
          type="text" 
          class="comment-input" 
          id="comment-${post._id}" 
          placeholder="Write a comment"
        />

        <button onclick="addComment('${post._id}')">Comment</button>

        <ul class="comment-list">
          ${post.comments.map(comment => `<li>${comment}</li>`).join("")}
        </ul>
      </div>
    `;

    postContainer.appendChild(postCard);
  });
}

async function likePost(id) {
  await fetch(API_URL, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      id: id,
      type: "like"
    })
  });

  loadPosts();
}

async function addComment(id) {
  const commentInput = document.getElementById(`comment-${id}`);
  const commentText = commentInput.value.trim();

  if (commentText === "") {
    alert("Please write a comment first.");
    return;
  }

  await fetch(API_URL, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      id: id,
      type: "comment",
      comment: commentText
    })
  });

  loadPosts();
}

/* BACK TO TOP BUTTON */

const topBtn = document.getElementById("topBtn");

if (topBtn) {
  topBtn.addEventListener("click", function () {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });
}

loadPosts();