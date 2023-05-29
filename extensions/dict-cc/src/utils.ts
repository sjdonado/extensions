import * as fs from "fs";
import * as https from "https";

import { temporaryFile } from "tempy";
import * as sound from "sound-play";

import { Direction, SUPPORTED_LANGUAGES } from "./preferences";

import { Languages } from "dictcc";

const TEMP_FILE_PATH = temporaryFile({ extension: "mp3" });

export const getListSubtitle = (loading: boolean, totalCount = 0) => {
  return loading ? "Loading..." : `${totalCount.toString()} results`;
};

export const joinStringsWithDelimiter: (values: (string | null | undefined)[], delimiter?: string) => string = (
  values,
  delimiter = ", "
): string => (values ? values.filter(Boolean).join(delimiter) : "");

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
