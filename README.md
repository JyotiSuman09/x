# Wishwell

A local-first wishlist and purchase planner built with Expo, React Native, and TypeScript. Wishlist data is stored on your device with SQLite; no account or backend is required.

## Requirements

- Node.js and npm
- Expo Go installed on your Android phone

## Install and run

From the project directory:

```sh
npm install
npm start
```

## Preview on your phone

Connect your phone and computer to the same Wi-Fi. Open Expo Go on Android and scan the QR code shown by `npm start`.

If your network blocks local connections, stop the server and run:

```sh
npx expo start --tunnel
```

## Build an Android APK

Sign in to your free Expo account, then run:

```sh
npx eas-cli@latest login
npx eas-cli@latest build --platform android --profile preview
```

When the cloud build finishes, download the APK from the link provided or your Expo build page and open it on your Android phone to install. The APK build profile is in `eas.json`.

The wishlist, categories, budget, and purchase history are available from the bottom tabs. Add items with a name, estimate, priority, category, and optional link or notes. Switch to **My order** to rearrange items using the arrows; priorities stay separate from that order. Tap an item to edit it or mark it purchased.
