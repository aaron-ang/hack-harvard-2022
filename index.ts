import dotenv from "dotenv";
import fs from "fs";
import axios from "axios";
import ytdl from "ytdl-core";
dotenv.config();

const APIKey = process.env.ASSEMBLY_API_KEY;
const audioSource = "https://youtu.be/NWGzAwqfOG4";
const audioFile = "audio.mp3";
let audioURL = "";

const assembly = axios.create({
  baseURL: "https://api.assemblyai.com/v2",
  headers: {
    authorization: APIKey,
    "content-type": "application/json",
    "transfer-encoding": "chunked",
  },
});

// Need to pipe it to api call instead of saving locally
await ytdl(audioSource, { filter: "audioonly" }).pipe(
  fs.createWriteStream(audioFile)
);

await fs.readFile(audioFile, (err, data) => {
  if (err) return console.error(err);

  assembly
    .post("/upload", data)
    .then((res) => {
      console.log(res.data);
      audioURL = res.data.upload_url;
    })
    .catch((err) => console.error(err));
});

// audioURl is empty
console.log(`audio URL: ${audioURL}`);

assembly
  .post("/transcript", {
    audio_url: audioURL,
  })
  .then((res) => console.log(res.data))
  .catch((err) => console.error(err));
