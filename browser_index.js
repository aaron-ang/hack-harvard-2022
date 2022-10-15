const getTranscription = async () => {
  const link = "https://www.youtube.com/shorts/8_F3eEXfYYg";
  const isFiltered = document.getElementById("filterProfanities").checked;

  try {
    const response = await fetch("http://localhost:3000", {
      method: "POST",
      body: JSON.stringify({
        link: link,
        isFiltered: isFiltered,
      }),
    });

    const data = response.json();

    console.log(data);
  } catch (e) {
    console.log(e);
  }
};

document
  .getElementById("transcribe")
  .addEventListener("click", getTranscription);
