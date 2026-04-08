This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# MyNaksh — Intelligent Chat (Technical Assessment)

## How to run

Prerequisites: Node ≥ 22, Android Studio (Android) or Xcode (iOS), per [React Native environment setup](https://reactnative.dev/docs/set-up-your-environment).

```sh
cd MyNakshChat   # if you cloned the parent folder only
npm install
npm start -- --reset-cache
```

In another terminal:

```sh
npm run android
# or (macOS) after: cd ios && pod install && cd ..
npm run ios
```

## Stack notes (for reviewers)

- **React Native New Architecture** — Enabled in `android/gradle.properties` (`newArchEnabled=true`). **Reanimated 4.x** requires Fabric; it aligns with the assessment’s “New Architecture + Reanimated 3+” intent (v4 is the current line for recent RN versions).
- **Reanimated** — Animations use shared values and worklets on the **UI thread** (via `react-native-worklets`). Babel: `react-native-worklets/plugin` is listed **last** in `babel.config.js` (required for Reanimated 4).
- **Gesture handling** — `react-native-gesture-handler` is imported first in `index.js`. The app root is wrapped in `GestureHandlerRootView` in `App.tsx`. Pan/long-press logic will use `Gesture` APIs with Reanimated `useSharedValue` / `useAnimatedStyle` so gesture updates stay off the JS thread where appropriate.
- **State** — **Redux Toolkit** with a **normalized** shape: `state.chat.chats` stores threads with `messageIds` only, and `state.chat.messages` stores message entities keyed by id. Initial payload comes from `src/data/initialMessages.ts`.

---
