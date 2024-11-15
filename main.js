// Authentication State
let isLoggedIn = false;
let currentUser = null;

// Initialize local storage
const initializeStorage = () => {
  if (!localStorage.getItem("users")) {
    localStorage.setItem("users", JSON.stringify([]));
  }
  if (!localStorage.getItem("complaints")) {
    localStorage.setItem("complaints", JSON.stringify([]));
  }
};

// Page Navigation
window.showPage = (pageId) => {
  if (pageId !== "auth" && pageId !== "articles" && !isLoggedIn) {
    alert("Please login first");
    pageId = "auth";
  }

  document.querySelectorAll(".page").forEach((page) => {
    page.classList.add("hidden");
  });

  document.getElementById(`${pageId}Page`).classList.remove("hidden");

  if (pageId === "articles") {
    loadArticles();
  }
  if (pageId === "complaint") {
    displayUserComplaints();
  }
};

// Authentication
window.toggleAuth = () => {
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  loginForm.classList.toggle("hidden");
  signupForm.classList.toggle("hidden");
};

window.handleLogin = (event) => {
  event.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  const users = JSON.parse(localStorage.getItem("users"));
  const user = users.find((u) => u.email === email && u.password === password);

  if (user) {
    isLoggedIn = true;
    currentUser = user;
    document.getElementById("authButton").textContent = "Logout";
    showPage("articles");
  } else {
    alert("Invalid credentials");
  }
};

window.handleSignup = (event) => {
  event.preventDefault();
  const name = document.getElementById("signupName").value;
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;

  const users = JSON.parse(localStorage.getItem("users"));
  if (users.some((u) => u.email === email)) {
    alert("Email already exists");
    return;
  }

  users.push({ name, email, password });
  localStorage.setItem("users", JSON.stringify(users));
  alert("Signup successful! Please login.");
  toggleAuth();
};

// Articles
const articles = [
  {
    title: "Climate Change Impact",
    content: "Understanding the global effects of climate change...",
    image: "media/mnit_logo.png",
  },
  {
    title: "Sustainable Living",
    content: "Tips for reducing your environmental footprint...",
    image: "media/mnit_logo.png",
  },
  {
    title: "Ocean Conservation",
    content: "Protecting marine ecosystems and biodiversity...",
    image: "media/mnit_logo.png",
  },
];

const loadArticles = () => {
  const articlesList = document.getElementById("articlesList");
  articlesList.innerHTML = articles
    .map(
      (article) => `
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
            <img src="${article.image}" alt="${article.title}" class="object-contain w-full h-48">
            <div class="p-4">
                <h3 class="text-xl font-bold mb-2">${article.title}</h3>
                <p class="text-gray-600">${article.content}</p>
            </div>
        </div>
    `
    )
    .join("");
};

// Complaint Handling
window.handleComplaint = (event) => {
  event.preventDefault();

  // Retrieve input values
  const subject = document.getElementById("complaintSubject").value;
  const description = document.getElementById("complaintDescription").value;
  const mediaFile = document.getElementById("complaintMedia").files[0];

  // Generate a unique tracking ID
  const trackingId = Math.random().toString(36).substr(2, 9);

  // Prepare complaint data object
  const complaintData = {
    trackingId,
    subject,
    description,
    userId: currentUser.email,
    status: "Pending",
    date: new Date().toISOString(),
  };

  // Add media file if present (optional handling)
  if (mediaFile) {
    complaintData.mediaFileName = mediaFile.name;
    complaintData.mediaFileType = mediaFile.type;
  }

  // Store the complaint data (assuming `addComplaint` handles this storage)
  addComplaint(complaintData);

  // Show the new complaint immediately in the complaints list (excluding media)
  const newComplaintCard = createComplaintCard(complaintData);
  const userComplaints = document.getElementById("userComplaints");
  userComplaints.insertAdjacentHTML("afterbegin", newComplaintCard);

  // Alert user with the tracking ID and reset form
  alert(`Complaint submitted successfully! Your tracking ID is: ${trackingId}`);
  event.target.reset();
};

// Contact Form
window.handleContact = (event) => {
  event.preventDefault();
  alert("Thank you for your message. We will get back to you soon!");
  event.target.reset();
};

// Initialize
initializeStorage();
showPage("auth");

// Complaint Management Functions

const createComplaintCard = (complaint) => {
  return `
        <div class="bg-white rounded-lg shadow-md p-6 mb-4">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-xl font-bold text-green-600">Tracking ID: ${
                  complaint.trackingId
                }</h3>
                <span class="px-3 py-1 rounded-full text-sm ${
                  complaint.status === "Pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-green-100 text-green-800"
                }">${complaint.status}</span>
            </div>
            <div class="mb-2">
                <span class="font-semibold">Subject:</span> ${complaint.subject}
            </div>
            <div class="mb-2">
                <span class="font-semibold">Description:</span>
                <p class="text-gray-600">${complaint.description}</p>
            </div>
            <div class="text-sm text-gray-500">
                Submitted on: ${new Date(complaint.date).toLocaleDateString()}
            </div>
        </div>
    `;
};

const getUserComplaints = (userEmail) => {
  const complaints = JSON.parse(localStorage.getItem("complaints") || "[]");
  return complaints.filter((complaint) => complaint.userId === userEmail);
};

const addComplaint = (complaintData) => {
  const complaints = JSON.parse(localStorage.getItem("complaints") || "[]");
  complaints.push(complaintData);
  localStorage.setItem("complaints", JSON.stringify(complaints));
};

const displayUserComplaints = () => {
  if (!currentUser) return;

  const complaints = getUserComplaints(currentUser.email);
  const complaintsContainer = document.getElementById("userComplaints");

  if (complaints.length === 0) {
    complaintsContainer.innerHTML = `
            <div class="text-center text-gray-600 py-8">
                No complaints submitted yet.
            </div>
        `;
    return;
  }

  complaintsContainer.innerHTML = complaints
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map(createComplaintCard)
    .join("");
};
