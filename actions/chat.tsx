"use server";

import { ReactNode } from "react";
import { createAI, getMutableAIState, streamUI } from "ai/rsc";
import { AIState, UIState } from "../types/ChatAiApp";
import { openai } from "@ai-sdk/openai";
import { BotMessage } from "../src/components/llm/message";
import { Loader2 } from "lucide-react";
import { CoreMessage } from "ai";
import { env } from "@/env";

import { z } from "zod";
import SppotifyComponent from "@/components/spotify";

async function getAccessToken() {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(
          env.SPOTIFY_CLIENT_API_KEY + ":" + env.SPOTIFY_SECERET_API_KEY
        ).toString("base64"),
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch access token");
  }

  const data = await response.json();
  return data.access_token;
}

async function fetchWebApi(endpoint: string, method: string, body?: any) {
  const token = await getAccessToken();
  const res = await fetch(`https://api.spotify.com/${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    method,
    body: JSON.stringify(body),
  });
  return await res.json();
}

async function getSongRecommendations(interests: string) {
  console.log(interests);
  const query = interests
    .split(",")
    .map((interest) => `genre:${interest.trim()}`)
    .join(" ");
  console.log(query);
  const endpoint = `v1/search?q=${encodeURIComponent(
    query
  )}&type=track&limit=10`;
  const response = await fetchWebApi(endpoint, "GET");
  // console.log(response);

  return response.tracks.items.map((track: any) => ({
    name: track.name,
    artist: track.artists[0].name,
    url: track.external_urls.spotify,
    imageUrl: track.album.images[0]?.url || "",
    uri: track.href,
  }));
}

async function getArtistSongs(artist: string) {
  // Construct the query with the artist filter
  const query = `artist:${encodeURIComponent(artist)}`;
  const endpoint = `v1/search?q=${query}&type=track&limit=10`;

  const response = await fetchWebApi(endpoint, "GET");
  return response.tracks.items.map((track: any) => ({
    name: track.name,
    artist: track.artists[0].name,
    url: track.external_urls.spotify,
    imageUrl: track.album.images[0]?.url || "",
    uri: track.href,
  }));
}

async function getLanguageRecommendations(language: string) {
  console.log(language);
  const endpoint = `v1/search?q=language:${encodeURIComponent(
    language
  )}&type=track&limit=10`;
  const response = await fetchWebApi(endpoint, "GET");
  return response.tracks.items.map((track: any) => ({
    name: track.name,
    artist: track.artists[0].name,
    url: track.external_urls.spotify,
    imageUrl: track.album.images[0]?.url || "",
    uri: track.href,
  }));
}

export async function sendMessage(message: string): Promise<{
  id: number;
  role: "user" | "assistant";
  display: ReactNode;
}> {
  const history = getMutableAIState<typeof AI>();
  history.update([
    ...history.get(),
    {
      role: "user",
      content: message,
    },
  ]);
  const reply = await streamUI({
    model: openai("gpt-3.5-turbo"),
    messages: [
      {
        role: "system",
        content,
        toolInvocations: [],
      },
      ...history.get(),
    ] as CoreMessage[],
    initial: (
      <BotMessage className="items-center flex shrink-0 select-none justify-center">
        <Loader2 className="h-5 w-5 animate-spin stroke-zinc-900" />
      </BotMessage>
    ),
    text: ({ content, done }) => {
      if (done)
        history.done([...history.get(), { role: "assistant", content }]);

      return <BotMessage>{content}</BotMessage>;
    },
    tools: {
      get_song_recommendations: {
        description:
          "Get song recommendations based on user interests using the Spotify API.",
        parameters: z.object({
          interests: z
            .string()
            .describe(
              "A comma-separated list of user interests, genres, or specific conditions (e.g., workout, study, party)."
            ),
        }),
        generate: async function* ({ interests }: { interests: string }) {
          yield (
            <BotMessage>
              Fetching song recommendations based on your interests...
            </BotMessage>
          );
          console.log("ok");
          const tracks = await getSongRecommendations(interests);
          // console.log(tracks);
          history.done([
            ...history.get(),
            {
              role: "assistant",
              name: "get_song_recommendations",
              content: `[Recommended Songs based on interests: ${interests}]`,
            },
          ]);

          return (
            <BotMessage>
              Here are some song recommendations for you:
              <ul>
                {tracks.map((track: any) => (
                  <li key={track.url} style={{ padding: "10px" }}>
                    <a
                      href={track.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {track.name} by {track.artist}
                    </a>

                    <SppotifyComponent uri={track.url} />
                  </li>
                ))}
              </ul>
            </BotMessage>
          );
        },
      },
      get_artist_songs: {
        description:
          "Get song recommendations based on a specific artist using the Spotify API.",
        parameters: z.object({
          artist: z.string().describe("The name of the artist."),
        }),
        generate: async function* ({ artist }: { artist: string }) {
          yield (
            <BotMessage>Fetching songs by the specified artist...</BotMessage>
          );
          const tracks = await getArtistSongs(artist);
          return (
            <BotMessage>
              Here are some songs by {artist}:
              <ul>
                {tracks.map((track: any) => (
                  <li key={track.url}>
                    <a
                      href={track.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src={track.imageUrl}
                        alt={`${track.name} album cover`}
                        width="50"
                        height="50"
                      />
                      {track.name} by {track.artist}
                    </a>

                    <SppotifyComponent uri={track.url} />
                  </li>
                ))}
              </ul>
            </BotMessage>
          );
        },
      },
      get_language_recommendations: {
        description:
          "Get song recommendations based on a specific language using the Spotify API.",
        parameters: z.object({
          language: z.string().describe("The language of the songs."),
        }),
        generate: async function* ({ language }: { language: string }) {
          yield (
            <BotMessage>
              Fetching song recommendations based on the specified language...
            </BotMessage>
          );
          const tracks = await getLanguageRecommendations(language);
          return (
            <BotMessage>
              Here are some song recommendations for you:
              <ul>
                {tracks.map((track: any) => (
                  <li key={track.url}>
                    <a
                      href={track.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src={track.imageUrl}
                        alt={`${track.name} album cover`}
                        width="50"
                        height="50"
                      />
                      {track.name} by {track.artist}
                    </a>

                    <SppotifyComponent uri={track.url} />
                  </li>
                ))}
              </ul>
            </BotMessage>
          );
        },
      },
    },
  });
  return {
    id: Date.now(),
    role: "assistant",
    display: <div>{reply.value}</div>,
  };
}

export const AI = createAI({
  initialAIState: [] as AIState,
  initialUIState: [] as UIState,
  actions: {
    sendMessage,
  },
});

const content = `
You are a song recommender bot and you can help users get personalized song recommendations using the Spotify API.

Messages inside [ ] mean that it's a UI element or a user event. For example:
- "[Recommend songs based on my interests]" means that the user wants song recommendations based on their interests or genres, including specific conditions or environments like workout, study, or party.
- "[Suggest a song]" means that the user wants a specific song suggestion.
- "[Recommend songs by artist]" means that the user wants song recommendations based on a specific artist.
- "[Recommend songs by language]" means that the user wants song recommendations based on a specific language.

If the user wants song recommendations, call 'get_song_recommendations' to provide recommendations.
If the user wants song recommendations by artist, call 'get_artist_songs' to provide recommendations.
If the user wants song recommendations by language, call 'get_language_recommendations' to provide recommendations.
If the user wants a song suggestion, call 'get_song_suggestion' to provide a specific song suggestion.
If the user wants anything else unrelated to the function calls, respond that you are a demo and cannot do that.
`;
