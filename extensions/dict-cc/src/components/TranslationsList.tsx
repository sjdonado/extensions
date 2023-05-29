import { useEffect, useState, useCallback } from "react";

import { Action, ActionPanel, Icon, List, showToast, Clipboard } from "@raycast/api";

import translate, { Translations } from "dictcc";
import { getListSubtitle, joinStringsWithDelimiter, playAudio, getDirectionTitles } from "../utils";

import { Direction, getPreferences } from "../preferences";

import { ListWithEmptyView } from "./ListWithEmptyView";

interface ITranslationsListProps {
  isSearchFromClipboard?: boolean;
}

const { sourceLanguage, targetLanguage } = getPreferences();
const directionTitles = getDirectionTitles(sourceLanguage, targetLanguage);

export function TranslationsList({ isSearchFromClipboard }: ITranslationsListProps) {
  const [direction, setDirection] = useState<Direction>();
  const [loading, setLoading] = useState(false);

  const [translations, setTranslations] = useState<Translations[] | undefined>();
  const [url, setUrl] = useState<string | undefined>();

  const [searchText, setSearchText] = useState("");

  const fetchTranslations = useCallback(
    async (term: string) => {
      setSearchText(term);
      setLoading(true);

      try {
        const { data, error, url } = await translate({ sourceLanguage, targetLanguage, term });

        if (error) {
          throw error;
        }

        setTranslations(data);
        setUrl(url);
      } catch (error) {
        if (error instanceof Error) {
          showToast({
            title: "Error",
            message: error.message,
          });
        }
      }

      setLoading(false);
    },
    [setTranslations, setUrl, setLoading]
  );

  useEffect(() => {
    if (isSearchFromClipboard) {
      (async () => {
        const clipboardText = await Clipboard.readText();

        if (clipboardText && clipboardText !== searchText) {
          fetchTranslations(clipboardText);
        }
      })();
    }
  }, [isSearchFromClipboard, fetchTranslations, searchText]);

  return (
    <List
      isLoading={loading}
      searchText={searchText}
      onSearchTextChange={(text) => fetchTranslations(text)}
      navigationTitle="Search dict.cc"
      searchBarPlaceholder="Search term (e.g. 'Haus')"
      searchBarAccessory={
        <List.Dropdown
          tooltip="Search direction"
          defaultValue={Direction.LTR}
          storeValue
          onChange={(newValue) => setDirection(newValue as Direction)}
        >
          {Object.entries(Direction).map(([, value]) => (
            <List.Dropdown.Item key={value} title={directionTitles[value]} value={value} />
          ))}
        </List.Dropdown>
      }
      throttle
    >
      <ListWithEmptyView loading={loading} showNoResultsFound={!!searchText.length} />

      <List.Section title="Results" subtitle={getListSubtitle(loading, translations?.length)}>
        {translations?.map((translation, index) => (
          <List.Item
            key={index}
            title={translation.targetTranslation.text}
            subtitle={translation.sourceTranslation.text}
            accessories={[
              { text: joinStringsWithDelimiter(translation.targetTranslation.meta.abbreviations) },
              { text: joinStringsWithDelimiter(translation.targetTranslation.meta.comments) },
              { text: joinStringsWithDelimiter(translation.targetTranslation.meta.wordClassDefinitions) },
            ]}
            actions={
              <ActionPanel>
                <Action.CopyToClipboard
                  title="Copy Text"
                  content={translation.targetTranslation.text}
                  shortcut={{ modifiers: ["cmd"], key: "." }}
                />
                <Action
                  title="Play audio"
                  icon={Icon.Play}
                  onAction={() => playAudio(translation.targetTranslationAudioUrl)}
                />
                {url && <Action.OpenInBrowser url={url} />}
              </ActionPanel>
            }
          />
        ))}
      </List.Section>
    </List>
  );
}
