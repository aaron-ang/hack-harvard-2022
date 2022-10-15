import dotenv from "dotenv";
import fs from "fs";
import axios from "axios";
import ytdl from "ytdl-core";
dotenv.config();

const APIKey = process.env.ASSEMBLY_API_KEY;
// https://youtu.be/NWGzAwqfOG4
const audioSource = "https://youtu.be/PWfRu5YQahs";
const audioFile = "./audio.wav";
let audioURL = "";
let transcriptId = "";
let status = "";
let profanityFilter = false;

const assembly = axios.create({
  baseURL: "https://api.assemblyai.com/v2",
  headers: {
    authorization: APIKey,
    "content-type": "application/json",
    "transfer-encoding": "chunked",
  },
});

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Need to pipe it to api call instead of saving locally
await ytdl(audioSource, { filter: "audioonly" })
  .pipe(await fs.createWriteStream(audioFile))
  .on("finish", async () => {
    fs.readFile(audioFile, async (err, data) => {
      if (err) return console.error(err);

      await assembly
        .post("/upload", data)
        .then((res) => (audioURL = res.data.upload_url))
        .catch((err) => console.error(err));

      await assembly
        .post("/transcript", {
          audio_url: audioURL,
          sentiment_analysis: true,
          filter_profanity: profanityFilter,
        })
        .then((res) => (transcriptId = res.data.id))
        .catch((err) => console.error(err));

      await assembly
        .get(`/transcript/${transcriptId}`)
        .then((res) => (status = res.data.staus));

      while (status !== "completed") {
        await sleep(2000);
        await assembly.get(`/transcript/${transcriptId}`).then((res) => {
          status = res.data.status;
          if (status === "completed") {
            console.log(res.data);
          }
        });
      }
    });
  });
