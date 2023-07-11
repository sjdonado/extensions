import { useEffect, useState, useCallback } from "react";

import { Action, ActionPanel, Icon, List, showToast, Clipboard, Cache } from "@raycast/api";

import translate, { Inflections, Translations, Direction } from "dictcc";
import { playAudio, getDirectionTitles, getLanguageTitle } from "../utils";

import { getPreferences } from "../preferences";

import { ListWithEmptyView } from "./ListWithEmptyView";

interface ITranslationsListProps {
  isSearchFromClipboard?: boolean;
}

const { sourceLanguage, targetLanguage } = getPreferences();

const directionTitles = getDirectionTitles(sourceLanguage, targetLanguage);
const defaultDirection = Direction.LTR;

const cache = new Cache();

export function TranslationsList({ isSearchFromClipboard }: ITranslationsListProps) {
  const [direction, setDirection] = useState<Direction>(defaultDirection);
  const [loading, setLoading] = useState(false);

  const [translations, setTranslations] = useState<Translations[] | undefined>();
  const [inflections, setInflections] = useState<Inflections | undefined>();

  const [url, setUrl] = useState<string | undefined>();

  const [searchText, setSearchText] = useState("");

  const fetchTranslations = useCallback(
    async (term: string, direction: Direction) => {
      setSearchText(term);
      setDirection(direction);
      setLoading(true);

      const cacheKey = `translations_${term}_${direction}`;
      const cachedTranslations = JSON.parse(cache.get(cacheKey) ?? "{}");

      if (cachedTranslations.data) {
        setTranslations(cachedTranslations.data.translations);
        setInflections(cachedTranslations.data.inflections);
        setUrl(cachedTranslations.url);
        setLoading(false);

        return;
      }

      try {
        const { data, error, url } = await translate({
          sourceLanguage,
          targetLanguage,
          direction,
          term,
        });

        if (error) {
          throw error;
        }

        setTranslations(data?.translations);
        setInflections(data?.inflections);
        setUrl(url);

        cache.set(
          cacheKey,
          JSON.stringify({
            data,
            url,
          })
        );
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
    [setTranslations, setInflections, setUrl, setLoading]
  );

  const handleOnDirectionChange = useCallback(
    (newDirection: Direction) => {
      fetchTranslations(searchText, newDirection);
    },
    [fetchTranslations, searchText, setDirection]
  );

  useEffect(() => {
    if (isSearchFromClipboard) {
      (async () => {
        const clipboardText = await Clipboard.readText();

        if (clipboardText && clipboardText !== searchText) {
          fetchTranslations(clipboardText, direction);
        }
      })();
    }
  }, [isSearchFromClipboard, fetchTranslations, searchText]);

  const firstTranslation = translations && translations.length > 0 ? translations[0] : undefined;

  return (
    <List
      isLoading={loading}
      searchText={searchText}
      onSearchTextChange={(text) => fetchTranslations(text, direction)}
      navigationTitle="Search dict.cc"
      searchBarPlaceholder="Search term (e.g. 'Haus')"
      searchBarAccessory={
        <List.Dropdown
          tooltip="Search direction"
          defaultValue={defaultDirection}
          storeValue
          onChange={(newDirection) => handleOnDirectionChange(newDirection as Direction)}
        >
          {Object.entries(Direction).map(([, value]) => (
            <List.Dropdown.Item key={value} title={directionTitles[value]} value={value} />
          ))}
        </List.Dropdown>
      }
      throttle
    >
      <ListWithEmptyView loading={loading} showNoResultsFound={!!searchText.length} />

      {inflections && inflections.text && (
        <List.Section title="Inflections">
          <List.Item
            key="repl-inflection"
            title={inflections.text}
            accessories={[{ text: inflections.headers }]}
            actions={
              firstTranslation && (
                <ActionPanel>
                  <Action.CopyToClipboard
                    title="Copy Text"
                    content={inflections.text}
                    shortcut={{ modifiers: ["cmd"], key: "." }}
                  />
                  <Action
                    title={`Play ${getLanguageTitle(sourceLanguage)} Pronuntiation`}
                    icon={Icon.Play}
                    onAction={() => playAudio(firstTranslation.sourceTranslation.audioUrl)}
                  />
                </ActionPanel>
              )
            }
          />
        </List.Section>
      )}

      <List.Section title="Translations" subtitle={loading ? "Loading..." : `${translations?.length} results`}>
        {translations?.map((translation, index) => (
          <List.Item
            key={index}
            title={translation.targetTranslation.text}
            subtitle={translation.sourceTranslation.text}
            accessories={[{ text: translation.entryType }]}
            actions={
              <ActionPanel>
                <Action.CopyToClipboard
                  title="Copy Text"
                  content={translation.targetTranslation}
                  shortcut={{ modifiers: ["cmd"], key: "." }}
                />
                <Action
                  title={`Play ${getLanguageTitle(sourceLanguage)} Pronuntiation`}
                  icon={Icon.Play}
                  onAction={() => playAudio(translation.sourceTranslation.audioUrl)}
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
