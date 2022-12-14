import dotenv from "dotenv";
import fs from "fs";
import axios from "axios";
import express from "express";
import ytdl from "ytdl-core";
import bodyParser from "body-parser";
import cors from "cors";
dotenv.config();
const APIKey = process.env.ASSEMBLY_API_KEY;
const audioFile = `./audio_${Math.floor(Math.random() * 1000)}.wav`;
const app = express();
let audioSource;
let profanityFilter;
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const assembly = axios.create({
    baseURL: "https://api.assemblyai.com/v2",
    headers: {
        authorization: APIKey,
        "content-type": "application/json",
        "transfer-encoding": "chunked",
    },
});
// POST method route
app.post("/", async (req, res) => {
    audioSource = req.body.link;
    profanityFilter = req.body.isFiltered;
    ytdl(audioSource, { filter: "audioonly" })
        .pipe(fs.createWriteStream(audioFile))
        .on("finish", () => {
        fs.readFile(audioFile, async (err, data) => {
            if (err)
                return console.error(err);
            let audioURL = "";
            let transcriptId = "";
            let status = "";
            // Upload audio file to AssemblyAI
            console.log("Uploading audio file to AssemblyAI...");
            assembly
                .post("/upload", data)
                .then((response) => {
                audioURL = response.data.upload_url;
                assembly
                    .post("/transcript", {
                    audio_url: audioURL,
                    content_safety: true,
                    filter_profanity: profanityFilter,
                })
                    .then((response) => {
                    transcriptId = response.data.id;
                    // Transcribe audio file
                    console.log("Transcribing audio file...");
                    assembly
                        .get(`/transcript/${transcriptId}`)
                        .then(async (response) => {
                        status = response.data.status;
                        while (status !== "completed") {
                            await sleep(2000);
                            const response = await assembly.get(`/transcript/${transcriptId}`);
                            status = response.data.status;
                            if (status === "completed") {
                                console.log("Transcription complete!");
                                fs.unlink(audioFile, (err) => {
                                    if (err)
                                        throw err;
                                    console.log(`${audioFile} was deleted`);
                                });
                                res.json(response.data);
                            }
                        }
                    });
                })
                    .catch((err) => console.error(err));
            })
                .catch((err) => console.error(err));
        });
    });
});
app.listen(3000, () => {
    console.log("Server running on port 3000");
});
