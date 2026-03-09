# seile

This project was created with [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack), a modern TypeScript stack that combines Convex, and more.

## Features

- **TypeScript** - For type safety and improved developer experience
- **React Native** - Build mobile apps using React
- **Expo** - Tools for React Native development
- **TailwindCSS** - Utility-first CSS for rapid UI development
- **shadcn/ui** - Reusable UI components
- **Convex** - Reactive backend-as-a-service platform
- **Oxlint** - Oxlint + Oxfmt (linting & formatting)
- **Turborepo** - Optimized monorepo build system

## Getting Started

First, install the dependencies:

```bash
bun install
```

## Convex Setup

This project uses Convex as a backend. You'll need to set up Convex before running the app:

```bash
bun run dev:setup
```

Follow the prompts to create a new Convex project and connect it to your application.

Copy environment variables from `packages/backend/.env.local` to `apps/*/.env`.

For `packages/backend/.env.local`, set at least:

```bash
BETTER_AUTH_SECRET="<32+ char secret>"
SITE_URL="<your app/site URL>"
CONVEX_SITE_URL="<your Convex site URL>"
OPENROUTER_API_KEY="<your OpenRouter API key>"
PLANNER_AGENT_MODEL="openai/gpt-4o-mini"
OPENROUTER_APP_NAME="Seile Planner"
```

`PLANNER_AGENT_MODEL` can be any OpenRouter model slug, for example `anthropic/claude-3.7-sonnet`, `google/gemini-2.5-pro`, or `openai/gpt-4o-mini`.

For `apps/native/.env`, use Expo public variable names:

```bash
EXPO_PUBLIC_CONVEX_URL="<your Convex cloud URL>"
EXPO_PUBLIC_CONVEX_SITE_URL="<your Convex site URL>"
EXPO_PUBLIC_APP_HMAC_SECRET="<optional local dev secret, 32+ chars>"
```

Then, run the development server:

```bash
bun run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser to see the web application.
Use the Expo Go app to run the mobile application.
Your app will connect to the Convex cloud backend automatically.

## Git Hooks and Formatting

- Format and lint fix: `bun run check`

## Project Structure

```
seile/
├── apps/
│   ├── web/         # Frontend application ()
│   ├── native/      # Mobile application (React Native, Expo)
├── packages/
│   ├── backend/     # Convex backend functions and schema
```

## Available Scripts

- `bun run dev`: Start all applications in development mode
- `bun run build`: Build all applications
- `bun run dev:web`: Start only the web application
- `bun run dev:setup`: Setup and configure your Convex project
- `bun run check-types`: Check TypeScript types across all apps
- `bun run dev:native`: Start the React Native/Expo development server
- `bun run check`: Run Oxlint and Oxfmt
