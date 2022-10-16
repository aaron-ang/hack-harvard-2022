const setLoadingState = () => {
  document.getElementById("transcribeBtn").innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="margin: auto; background: none; display: block; shape-rendering: auto;" width="50px" height="50px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid"> <path fill="none" stroke="#5dbea3" stroke-width="8" stroke-dasharray="42.76482137044271 42.76482137044271" d="M24.3 30C11.4 30 5 43.3 5 50s6.4 20 19.3 20c19.3 0 32.1-40 51.4-40 C88.6 30 95 43.3 95 50s-6.4 20-19.3 20C56.4 70 43.6 30 24.3 30z" stroke-linecap="round"> <animate attributeName="stroke-dashoffset" repeatCount="indefinite" dur="1s" keyTimes="0;1" values="0;256.58892822265625"></animate> </path></svg>';
  document.getElementById("transcribeBtn").classList.remove("btn-transcribe");
  document
    .getElementById("transcribeBtn")
    .classList.add("btn-transcribe-loading");
};

const removeLoadingState = () => {
  document.getElementById("transcribeBtn").innerHTML = "Transcribe!";
  document
    .getElementById("transcribeBtn")
    .classList.remove("btn-transcribe-loading");
  document.getElementById("transcribeBtn").classList.add("btn-transcribe");
};

const getTranscription = () => {
  // Get the url of the currently open link.
  chrome.tabs.query(
    { active: true, currentWindow: true },
    async function (tabs) {
      setLoadingState();

      const link = tabs[0].url;
      const isFiltered = document.getElementById("filterProfanities").checked;

      // Call the AssemblyAI api to transcribe video.
      try {
        const response = await fetch("http://localhost:3000", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            link: link,
            isFiltered: isFiltered,
          }),
        });

        const data = await response.json();

        // analyze sentiment of the transcription.
        const safety = data.content_safety_labels.summary;
        if (safety.profanity > 0.5 || safety.nsfw > 0.5) {
          if (
            confirm(
              "This video contains profanity or NSFW content. Continue downloading transcript?"
            )
          ) {
            // Download the text received as a text file.
            const blob = new Blob([data.text], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            chrome.downloads.download({
              url: url,
            });
          } else {
            return;
          }
        } else {
          const blob = new Blob([data.text], { type: "text/plain" });
          const url = URL.createObjectURL(blob);
          chrome.downloads.download({
            url: url,
          });
        }
      } catch (e) {
        console.log(e);
      } finally {
        removeLoadingState();
      }
    }
  );
};

document
  .getElementById("transcribeBtn")
  .addEventListener("click", getTranscription);
