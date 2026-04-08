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

## Technical notes (assessment)

### How Reanimated 3+ was used

The brief asks for **Reanimated 3+**; this project targets **React Native 0.84** with the **New Architecture**, so it uses **Reanimated 4.x** (same mental model as v3: shared values, worklets, UI-thread animation).

- **Shared values** (`useSharedValue`) drive swipe translation, reply-icon reveal, and the emoji reaction bar open/close animation.
- **Worklets** run on the **UI thread** via `useAnimatedStyle`, `withSpring`, `withTiming`, and `measure` (for positioning the reaction bar from the pressed bubble).
- **Babel**: `react-native-worklets/plugin` is listed **last** in `babel.config.js` (required for Reanimated 4).

Heavy interaction code lives mainly in `src/screens/ChatThreadScreen.tsx` (swipe-to-reply, reactions). Only small bridges use `runOnJS` when Redux or React state must update from a gesture.

### Gesture handling approach

- **Library**: `react-native-gesture-handler` — imported **first** in `index.js`; root wrapped in **`GestureHandlerRootView`** in `App.tsx`.
- **Swipe-to-reply**: `Gesture.Pan()` on each message bubble; translation is clamped (incoming: right; outgoing: left). On release, `withSpring` resets position; crossing a threshold triggers reply via `runOnJS`. Updates run as **worklets** on the UI thread.
- **Reactions**: `Gesture.LongPress()` combined with pan via `Gesture.Simultaneous`; long-press uses Reanimated **`measure()`** on an animated ref to place the emoji bar.
- **Why UI thread**: Pan/long-press updates and spring animations stay off the JS thread for smooth frames; JS runs only for state updates (reply target, reactions, etc.).

### State management choice (Redux)

**Redux Toolkit** (`@reduxjs/toolkit` + `react-redux`) is used for predictable, inspectable global state.

- **Normalized chat model**: `state.chat.chats` holds thread metadata and **`messageIds` only**; **`state.chat.messages`** is a map of message id → message entity. Lists render by walking `messageIds` and looking up entities (see `src/store/chat/selectors.ts`).
- **Why not Zustand / Context**: Redux fits multi-screen flows (list → thread), time-travel debugging, and clear action boundaries for messages, reactions, and AI feedback. Context would re-render broadly; Zustand would also work but Redux matches common team patterns for this assessment.

Seed data for threads and messages: `src/data/initialChatList.ts`.

### React Native New Architecture

Enabled in `android/gradle.properties` (`newArchEnabled=true`). Reanimated 4 expects Fabric; this matches the assessment stack.

---
