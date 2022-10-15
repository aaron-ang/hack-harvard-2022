const getTranscription = async () => {
    let link = "https://youtu.be/Yyyi12oaK94";
    let isFiltered = document.getElementById("filterProfanities").checked;

    try {
        let response = await fetch("http://localhost:3000", {
            method: "POST",
            body: {
                "link": link, 
                "isFiltered": isFiltered
            }
        });

        let data = await response.json();

        console.log(data);
    
    } catch (e) {
        console.log(e)
    }
}