const homeScreen = document.getElementById("homeScreen");
const questionScreen = document.getElementById("questionScreen");
const resultsScreen = document.getElementById("resultsScreen");
const savedScreen = document.getElementById("savedScreen");

const startButton = document.getElementById("startButton");
const sendButton = document.getElementById("sendButton");
const restartButton = document.getElementById("restartButton");
const anotherButton = document.getElementById("anotherButton");
const savedButton = document.getElementById("savedButton");
const backButton = document.getElementById("backButton");

const answerInput = document.getElementById("answerInput");
const questionText = document.getElementById("questionText");
const questionSubtitle = document.getElementById("questionSubtitle");
const questionNumber = document.getElementById("questionNumber");
const progressText = document.getElementById("progressText");
const progressFill = document.getElementById("progressFill");
const thinking = document.getElementById("thinking");

const giftGrid = document.getElementById("giftGrid");
const savedGrid = document.getElementById("savedGrid");
const savedCount = document.getElementById("savedCount");
const resultsSummary = document.getElementById("resultsSummary");
const emptyState = document.getElementById("emptyState");
const toast = document.getElementById("toast");


let answers = [];

let savedGifts = JSON.parse(
  localStorage.getItem("littleSomethingSaved") || "[]"
);


const questionBank = {

  person: {
    text: "Who are you shopping for?",
    subtitle: "Tell us who they are to you and anything that comes to mind."
  },

  personality: {
    text: "What are they like?",
    subtitle: "Think about their personality, energy, hobbies or little habits."
  },

  interests: {
    text: "What are they into lately?",
    subtitle: "Anything counts — books, music, cooking, art, tech, fitness, travel..."
  },

  budget: {
    text: "How much would you like to spend?",
    subtitle: "A rough budget is perfect. We'll keep the ideas realistic."
  },

  occasion: {
    text: "What's the occasion?",
    subtitle: "Birthday, graduation, thank-you, just because, or something else?"
  }

};


let currentQuestion = "person";


function showScreen(screen) {

  document.querySelectorAll(".screen").forEach(item => {
    item.classList.remove("active");
  });

  screen.classList.add("active");

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


function startFinder() {

  answers = [];

  currentQuestion = "person";

  showScreen(questionScreen);

  showQuestion();

}


function showQuestion() {

  const question = questionBank[currentQuestion];

  questionText.textContent = question.text;
  questionSubtitle.textContent = question.subtitle;

  const number = answers.length + 1;

  questionNumber.textContent =
    String(number).padStart(2, "0");

  progressText.textContent =
    `Question ${number}`;

  const percentage =
    Math.min((number / 5) * 100, 100);

  progressFill.style.width =
    `${percentage}%`;

  answerInput.value = "";

  setTimeout(() => {
    answerInput.focus();
  }, 250);

}


function chooseNextQuestion() {

  const combinedAnswers =
    answers
      .map(item => item.answer.toLowerCase())
      .join(" ");

  if (!answers.some(item => item.type === "person")) {
    return "person";
  }

  if (!answers.some(item => item.type === "personality")) {
    return "personality";
  }

  if (!answers.some(item => item.type === "interests")) {
    return "interests";
  }

  if (!answers.some(item => item.type === "budget")) {
    return "budget";
  }

  if (!answers.some(item => item.type === "occasion")) {
    return "occasion";
  }

  return null;
}


function submitAnswer() {

  const answer =
    answerInput.value.trim();

  if (!answer) {
    answerInput.focus();
    return;
  }


  thinking.classList.add("active");
  sendButton.disabled = true;
  answerInput.disabled = true;


  answers.push({
    type: currentQuestion,
    answer: answer
  });


  setTimeout(() => {

    const next =
      chooseNextQuestion();

    thinking.classList.remove("active");

    sendButton.disabled = false;
    answerInput.disabled = false;


    if (!next) {

      createResults();

      return;
    }


    currentQuestion = next;

    showQuestion();

  }, 650);

}


function getBudget() {

  const budgetAnswer =
    answers
      .find(item => item.type === "budget")
      ?.answer
      .toLowerCase() || "";

  const numbers =
    budgetAnswer.match(/\d+/g);

  if (!numbers || numbers.length === 0) {
    return 50;
  }

  return Number(numbers[0]);
}


function getAnswersText() {

  return answers
    .map(item => item.answer)
    .join(" ")
    .toLowerCase();

}


function createResults() {

  const text = getAnswersText();
  const budget = getBudget();

  let gifts = [];


  if (
    text.includes("book") ||
    text.includes("read") ||
    text.includes("کتاب")
  ) {

    gifts.push({
      name: "A beautifully chosen book",
      price: budget >= 30 ? "$28" : "$18",
      category: "For the reader",
      reason: "A thoughtful pick for someone who enjoys getting lost in a good story.",
      style: "book"
    });

  }


  if (
    text.includes("cook") ||
    text.includes("food") ||
    text.includes("bake") ||
    text.includes("آشپ") ||
    text.includes("غذا")
  ) {

    gifts.push({
      name: "A cozy cooking set",
      price: budget >= 45 ? "$42" : "$25",
      category: "For the home cook",
      reason: "Something useful that turns an everyday hobby into a little ritual.",
      style: "cook"
    });

  }


  if (
    text.includes("music") ||
    text.includes("song") ||
    text.includes("guitar") ||
    text.includes("موسیقی")
  ) {

    gifts.push({
      name: "A music lover's little kit",
      price: budget >= 50 ? "$45" : "$25",
      category: "For the music lover",
      reason: "A small, personal gift for someone who always has a soundtrack playing.",
      style: "music"
    });

  }


  if (
    text.includes("art") ||
    text.includes("draw") ||
    text.includes("paint") ||
    text.includes("هنر") ||
    text.includes("نقاش")
  ) {

    gifts.push({
      name: "An artist's sketch set",
      price: budget >= 40 ? "$36" : "$22",
      category: "For the creative",
      reason: "A simple creative companion for someone who loves making things.",
      style: "art"
    });

  }


  if (
    text.includes("travel") ||
    text.includes("trip") ||
    text.includes("سفر")
  ) {

    gifts.push({
      name: "A thoughtful travel companion",
      price: budget >= 50 ? "$48" : "$27",
      category: "For the traveler",
      reason: "Practical enough to use and personal enough to feel like a real gift.",
      style: "travel"
    });

  }


  if (
    text.includes("tech") ||
    text.includes("computer") ||
    text.includes("gaming") ||
    text.includes("technology")
  ) {

    gifts.push({
      name: "A clever desk accessory",
      price: budget >= 40 ? "$35" : "$20",
      category: "For the tech lover",
      reason: "A useful little upgrade for their everyday desk setup.",
      style: "tech"
    });

  }


  const fallback = [

    {
      name: "A personalized keepsake",
      price: budget >= 40 ? "$35" : "$22",
      category: "Something personal",
      reason: "A small meaningful gift that feels considered rather than random.",
      style: "personal"
    },

    {
      name: "A cozy everyday set",
      price: budget >= 45 ? "$40" : "$24",
      category: "For slow days",
      reason: "A warm, useful combination made for someone who appreciates little comforts.",
      style: "cozy"
    },

    {
      name: "A beautiful desk piece",
      price: budget >= 50 ? "$45" : "$25",
      category: "For their space",
      reason: "A simple object that adds a little personality to their everyday space.",
      style: "desk"
    }

  ];


  gifts = [
    ...gifts,
    ...fallback
  ];


  gifts =
    gifts.slice(0, 3);


  resultsSummary.textContent =
    `Based on what you told us, these felt like the closest matches — thoughtful, useful and within the spirit of your budget.`;


  renderGifts(gifts);

  showScreen(resultsScreen);

}


function getImageStyle(style) {

  const styles = {

    book:
      "linear-gradient(135deg, #d9d0df, #eee8f2)",

    cook:
      "linear-gradient(135deg, #e8c7c8, #f4dddd)",

    music:
      "linear-gradient(135deg, #c9d3c2, #e2e8dd)",

    art:
      "linear-gradient(135deg, #e6d4c8, #f2e8e0)",

    travel:
      "linear-gradient(135deg, #d1dce0, #e8eff0)",

    tech:
      "linear-gradient(135deg, #d6d1db, #ebe8ef)",

    personal:
      "linear-gradient(135deg, #e8c7c8, #f3e0df)",

    cozy:
      "linear-gradient(135deg, #ddd1c4, #eee6dc)",

    desk:
      "linear-gradient(135deg, #c9d3c2, #e1e8dc)"

  };

  return styles[style] || styles.personal;

}


function renderGifts(gifts) {

  giftGrid.innerHTML = "";

  gifts.forEach(gift => {

    const card =
      document.createElement("article");

    card.className = "gift-card";


    card.innerHTML = `

      <div
        class="gift-image"
        style="background: ${getImageStyle(gift.style)}"
      >

        <div class="image-object"></div>

      </div>

      <div class="gift-info">

        <div class="gift-category">
          ${escapeHTML(gift.category)}
        </div>

        <h3 class="gift-name">
          ${escapeHTML(gift.name)}
        </h3>

        <div class="gift-price">
          ${escapeHTML(gift.price)}
        </div>

        <p class="gift-reason">
          ${escapeHTML(gift.reason)}
        </p>

        <button class="save-gift">
          Save this gift
        </button>

      </div>
    `;


    const saveButton =
      card.querySelector(".save-gift");


    saveButton.addEventListener("click", () => {

      saveGift(gift);

      saveButton.textContent =
        "Saved";

      saveButton.disabled = true;

    });


    giftGrid.appendChild(card);

  });

}


function saveGift(gift) {

  const exists =
    savedGifts.some(
      item => item.name === gift.name
    );

  if (exists) {
    showToast("Already in your collection");
    return;
  }


  savedGifts.push(gift);

  localStorage.setItem(
    "littleSomethingSaved",
    JSON.stringify(savedGifts)
  );


  updateSavedCount();

  showToast("Saved to your collection");

}


function renderSaved() {

  savedGrid.innerHTML = "";


  if (savedGifts.length === 0) {

    emptyState.style.display = "block";

    return;

  }


  emptyState.style.display = "none";


  savedGifts.forEach(gift => {

    const card =
      document.createElement("article");

    card.className = "gift-card";


    card.innerHTML = `

      <div
        class="gift-image"
        style="background: ${getImageStyle(gift.style)}"
      >

        <div class="image-object"></div>

      </div>

      <div class="gift-info">

        <div class="gift-category">
          ${escapeHTML(gift.category)}
        </div>

        <h3 class="gift-name">
          ${escapeHTML(gift.name)}
        </h3>

        <div class="gift-price">
          ${escapeHTML(gift.price)}
        </div>

        <p class="gift-reason">
          ${escapeHTML(gift.reason)}
        </p>

      </div>
    `;


    savedGrid.appendChild(card);

  });

}


function updateSavedCount() {

  savedCount.textContent =
    savedGifts.length;

}


function showToast(message) {

  toast.textContent = message;

  toast.classList.add("show");


  setTimeout(() => {

    toast.classList.remove("show");

  }, 2000);

}


function escapeHTML(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


startButton.addEventListener(
  "click",
  startFinder
);


sendButton.addEventListener(
  "click",
  submitAnswer
);


answerInput.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {

      event.preventDefault();

      submitAnswer();

    }

  }
);


restartButton.addEventListener(
  "click",
  startFinder
);


anotherButton.addEventListener(
  "click",
  startFinder
);


savedButton.addEventListener(
  "click",
  () => {

    renderSaved();

    showScreen(savedScreen);

  }
);


backButton.addEventListener(
  "click",
  () => {

    showScreen(homeScreen);

  }
);


updateSavedCount();