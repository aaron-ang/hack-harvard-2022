import axios from "axios";

const APIKey = process.env.ASSEMBLYAI_API_KEY;
const audioURL = "https://youtu.be/WO7wT-FX2mA";

const assembly = axios.create({
  baseURL: "https://api.assemblyai.com/v2",
  headers: {
    authorization: APIKey,
    "content-type": "application/json",
  },
});

assembly
  .post("/transcript", {
    audio_url: audioURL,
  })
  .then((res: { data: any }) => console.log(res.data))
  .catch((err: any) => console.error(err));
