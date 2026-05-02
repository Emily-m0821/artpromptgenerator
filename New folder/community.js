const API_URL = "https://prompt-generator-vercel-vert.vercel.app/api/community";

const artistName = document.getElementById("artistName");
const artDescription = document.getElementById("artDescription");
const artImage = document.getElementById("artImage");
const previewImage = document.getElementById("previewImage");
const shareBtn = document.getElementById("shareBtn");
const postContainer = document.getElementById("postContainer");

let posts = JSON.parse(localStorage.getItem("communityPosts")) || [];
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

shareBtn.addEventListener("click", function () {
  if (artistName.value.trim() === "" || artDescription.value.trim() === "" || selectedImage === "") {
    alert("Please add your name, description, and artwork image.");
    return;
  }

  const newPost = {
    id: Date.now(),
    name: artistName.value,
    description: artDescription.value,
    image: selectedImage,
    likes: 0,
    comments: []
  };

  posts.unshift(newPost);
  savePosts();
  displayPosts();

  artistName.value = "";
  artDescription.value = "";
  artImage.value = "";
  previewImage.style.display = "none";
  selectedImage = "";
});

function displayPosts() {
  postContainer.innerHTML = "";

  posts.forEach(function (post) {
    const postCard = document.createElement("div");
    postCard.classList.add("post-card");

    postCard.innerHTML = `
      <img src="${post.image}" alt="Artwork">
      <h3>${post.name}</h3>
      <p>${post.description}</p>

      <button class="like-btn" onclick="likePost(${post.id})">
        ♥ Like (${post.likes})
      </button>

      <div class="comment-section">
        <input 
          type="text" 
          class="comment-input" 
          id="comment-${post.id}" 
          placeholder="Write a comment"
        />

        <button onclick="addComment(${post.id})">Comment</button>

        <ul class="comment-list">
          ${post.comments.map(comment => `<li>${comment}</li>`).join("")}
        </ul>
      </div>
    `;

    postContainer.appendChild(postCard);
  });
}

function likePost(id) {
  const post = posts.find(function (post) {
    return post.id === id;
  });

  post.likes++;
  savePosts();
  displayPosts();
}

function addComment(id) {
  const commentInput = document.getElementById(`comment-${id}`);
  const commentText = commentInput.value.trim();

  if (commentText === "") {
    alert("Please write a comment first.");
    return;
  }

  const post = posts.find(function (post) {
    return post.id === id;
  });

  post.comments.push(commentText);
  savePosts();
  displayPosts();
}

function savePosts() {
  localStorage.setItem("communityPosts", JSON.stringify(posts));
}

displayPosts();

/* back to the top button*/
const topBtn = document.getElementById("topBtn");

topBtn.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});