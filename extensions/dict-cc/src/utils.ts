import * as fs from "fs";
import * as https from "https";

import { temporaryFile } from "tempy";
import * as sound from "sound-play";

import { Direction, Languages } from "dictcc";

import { SUPPORTED_LANGUAGES } from "./preferences";

const TEMP_FILE_PATH = temporaryFile({ extension: "mp3" });

export const getLanguageTitle = (language: Languages) => {
  return SUPPORTED_LANGUAGES[language as keyof typeof SUPPORTED_LANGUAGES];
};

export const getDirectionTitles = (sourceLanguage: Languages, targetLanguage: Languages) => {
  const sourceLanguageKey = sourceLanguage as keyof typeof SUPPORTED_LANGUAGES;
  const targetLanguageKey = targetLanguage as keyof typeof SUPPORTED_LANGUAGES;

  const directionTitles = {
    [Direction.LTR]: `${sourceLanguage}${targetLanguage} - ${SUPPORTED_LANGUAGES[sourceLanguageKey]} -> ${SUPPORTED_LANGUAGES[targetLanguageKey]}`,
    [Direction.RTL]: `${targetLanguage}${sourceLanguage} - ${SUPPORTED_LANGUAGES[targetLanguageKey]} -> ${SUPPORTED_LANGUAGES[sourceLanguageKey]}`,
  };

  return directionTitles;
};

export const playAudio = (url: string) => {
  https.get(url, (response) => {
    const writeStream = fs.createWriteStream(TEMP_FILE_PATH);

    response.pipe(writeStream);

    writeStream.on("finish", () => {
      sound.play(TEMP_FILE_PATH);
    });
  });
};
