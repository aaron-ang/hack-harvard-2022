const getTranscription = () => {
  // Get the url of the currently open link.
  chrome.tabs.query(
    { active: true, currentWindow: true },
    async function (tabs) {
      let link = tabs[0].url;
      let isFiltered = document.getElementById("filterProfanities").checked;

      // Call the AssemblyAI api to transcribe video.
      try {
        let response = await fetch("http://localhost:3000", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            link: link,
            isFiltered: isFiltered,
          }),
        });

        let data = await response.json();

        console.log(data);
      } catch (e) {
        console.log(e);
      }
    }
  );
};

document
  .getElementById("transcribeBtn")
  .addEventListener("click", getTranscription);
