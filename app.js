async function createRecommendations() {

  thinking.classList.add("active");

  const oldButtonText =
    sendButton.textContent;

  sendButton.disabled = true;


  try {

    const response =
      await fetch(
        "https://YOUR-BACKEND.vercel.app/api/gift-finder",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            answers
          })
        }
      );


    if (!response.ok) {

      throw new Error(
        "Backend request failed"
      );

    }


    const data =
      await response.json();


    if (!data.gifts) {

      throw new Error(
        "No gifts returned"
      );

    }


    resultsSummary.textContent =
      data.summary ||
      "A few ideas chosen around what you told us.";


    renderAIGifts(data.gifts);


    showScreen(resultsScreen);


  } catch (error) {

    console.error(error);

    showToast(
      "Something went wrong. Please try again."
    );

  } finally {

    thinking.classList.remove("active");

    sendButton.disabled = false;

    sendButton.textContent =
      oldButtonText;

  }

}
function renderAIGifts(gifts) {

  giftGrid.innerHTML = "";


  gifts.forEach(gift => {

    const card =
      document.createElement("article");

    card.className = "gift-card";


    const alreadySaved =
      savedGifts.some(
        item => item.name === gift.name
      );


    const imageHTML = gift.image

      ? `
        <img
          src="${gift.image}"
          alt="${escapeHTML(gift.name)}"
          loading="lazy"
        >
      `

      : `
        <div class="image-loading">
          <span>Image unavailable</span>
        </div>
      `;


    card.innerHTML = `

      <div class="gift-image">

        ${imageHTML}

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

        <button
          class="save-gift ${alreadySaved ? "saved" : ""}"
        >
          ${alreadySaved ? "Saved" : "Save this gift"}
        </button>

      </div>

    `;


    const saveButton =
      card.querySelector(".save-gift");


    saveButton.addEventListener(
      "click",
      () => {

        saveGift(gift);

        saveButton.textContent =
          "Saved";

        saveButton.classList.add(
          "saved"
        );

      }
    );


    giftGrid.appendChild(card);

  });

}
