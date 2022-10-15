import dotenv from "dotenv";
import fs from "fs";
import axios from "axios";
import express from "express";
import ytdl from "ytdl-core";
dotenv.config();

const APIKey = process.env.ASSEMBLY_API_KEY;
const audioFile = `./audio_${Math.floor(Math.random() * 1000)}.wav`;
const app = express();

let audioSource: string;
let profanityFilter: boolean;

// POST method route
app.post("/", async (req, res) => {
  audioSource = req.body.link;
  profanityFilter = req.body.profanityFilter;
  res.send(await processLink(audioSource));
});

const assembly = axios.create({
  baseURL: "https://api.assemblyai.com/v2",
  headers: {
    authorization: APIKey,
    "content-type": "application/json",
    "transfer-encoding": "chunked",
  },
});

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const processLink = async (audioSource: string) => {
  ytdl(audioSource, { filter: "audioonly" })
    .pipe(fs.createWriteStream(audioFile))
    .on("finish", () => {
      fs.readFile(audioFile, async (err, data) => {
        if (err) return console.error(err);

        let audioURL = "";
        let transcriptId = "";
        let status = "";

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
          await assembly
            .get(`/transcript/${transcriptId}`)
            .then((res) => {
              status = res.data.status;
              if (status === "completed") {
                fs.unlink(audioFile, (err) => {
                  if (err) throw err;
                  console.log(`${audioFile} was deleted`);
                });

                return res.data;
              }
            })
            .catch((err) => console.error(err));
        }
      });
    });
};
