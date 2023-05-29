import { getPreferenceValues } from "@raycast/api";

import { Languages } from "dictcc";

export const getPreferences = () =>
  getPreferenceValues<{
    sourceLanguage: Languages;
    targetLanguage: Languages;
  }>();

export const SUPPORTED_LANGUAGES = {
  [Languages.sq]: "Albanian 🇦🇱",
  [Languages.bs]: "Bosnian 🇧🇦",
  [Languages.bg]: "Bulgarian 🇧🇬",
  [Languages.hr]: "Croatian 🇭🇷",
  [Languages.cs]: "Czech 🇨🇿",
  [Languages.da]: "Danish 🇩🇰",
  [Languages.nl]: "Dutch 🇳🇱",
  [Languages.en]: "English 🇬🇧",
  [Languages.eo]: "Esperanto",
  [Languages.fi]: "Finnish 🇫🇮",
  [Languages.fr]: "French 🇫🇷",
  [Languages.de]: "German 🇩🇪",
  [Languages.el]: "Greek 🇬🇷",
  [Languages.hu]: "Hungarian 🇭🇺",
  [Languages.is]: "Icelandic 🇮🇸",
  [Languages.it]: "Italian 🇮🇹",
  [Languages.la]: "Latin",
  [Languages.no]: "Norwegian 🇳🇴",
  [Languages.pl]: "Polish 🇵🇱",
  [Languages.pt]: "Portuguese 🇵🇹",
  [Languages.ro]: "Romanian 🇷🇴",
  [Languages.ru]: "Russian 🇷🇺",
  [Languages.sk]: "Serbian 🇷🇸",
  [Languages.sq]: "Slovakian 🇸🇰",
  [Languages.sr]: "Spanish 🇪🇸",
  [Languages.sv]: "Swedish 🇸🇪",
  [Languages.tr]: "Turkish 🇹🇷",
};
