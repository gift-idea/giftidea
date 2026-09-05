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
