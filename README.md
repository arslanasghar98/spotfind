# Spotify Song Recommender Bot

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Overview

The Spotify Song Recommender Bot is an AI-powered bot that provides personalized song recommendations using the Spotify API. It offers a seamless and interactive experience by suggesting songs based on user interests, specific artists, and languages.

## Features

- Personalized Song Recommendations: Get song recommendations tailored to your interests or specific conditions like workout, study, or party.
- Artist-Based Recommendations: Receive curated song lists from your favorite artists.
- Language-Based Recommendations: Explore songs based on your preferred language.
- Interactive Chat Interface: Engage with the bot through a real-time chat interface for personalized recommendations.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

## Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/yourusername/spotfind.git
   ```
2. Navigate to the project directory:
   ```sh
   cd spotfind
   ```
3. Install dependencies:
   ```sh
   npm install
   ```
4. Set up environment variables:
   - Create a `.env` file in the root directory.
   - Add your Spotify and OpenAI API keys:
     ```env
     SPOTIFY_CLIENT_API_KEY=your_spotify_client_api_key
     SPOTIFY_SECRET_API_KEY=your_spotify_secret_api_key
     OPENAI_API_KEY=your_openai_api_key
     ```

## How It Works

- The bot uses the OpenAI GPT-3.5-turbo model to understand user queries and generate responses.
- Depending on the user’s input, the bot calls the appropriate Spotify API endpoints to fetch song recommendations.
- The bot provides recommendations in three main categories:
  - **Song Recommendations Based on Interests**: Fetches songs based on user-provided genres or activities.
  - **Artist-Based Recommendations**: Fetches songs from a specific artist.
  - **Language-Based Recommendations**: Fetches songs in a specific language.
- The bot interacts with users through a real-time chat interface, displaying recommendations and links to the songs on Spotify.
- The bot makes HTTP requests to the Spotify API endpoints using an access token obtained via Spotify’s OAuth2 authentication.
