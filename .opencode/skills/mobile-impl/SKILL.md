---
name: mobile-impl
description: Implement mobile UI with React Native and Expo - screens, navigation, native modules, cross-platform behavior
compatibility: opencode
metadata:
  audience: developers
  workflow: implementation
---
## What I do
- Create React Native / Expo screens and components
- Implement navigation (React Navigation, Expo Router)
- Wire native modules and platform-specific APIs (camera, GPS, push, haptics)
- Handle cross-platform differences (iOS vs Android) with `Platform.select`
- Implement responsive, touch-first layouts (SafeArea, touch targets, keyboard avoidance)
- Manage async data fetching, offline state, and background tasks
- Configure Expo (config plugins, EAS build profiles) and native dependencies

## When to use me
Use this skill when implementing mobile UI with React Native or Expo. Refer to the [Code Standards Index](../../standards/README.md) (TypeScript section) for naming, types, and async rules. For web UI work, use `frontend-impl` instead.

## Guidelines
- Prefer Expo over bare React Native unless the project already uses bare RN.
- Use TypeScript with strict props typing on every component.
- Touch targets >= 44x44pt; respect `SafeAreaView`/`useSafeAreaInsets`.
- Avoid absolute pixel values — use flex, percentages, and `useWindowDimensions`.
- Handle keyboard: `KeyboardAvoidingView` or expo-keyboard for iOS/Android differences.
- Gate platform-specific code with `Platform.OS` / `Platform.select`; keep shared logic in a `shared/` module.
- Use `useMemo`/`useCallback` and `FlatList` (with `getItemLayout`) for list performance.
- Verify on both iOS and Android simulators (or `npx expo start` web for quick layout checks) before reporting done.
- Never hardcode secrets; use `expo-secure-store` for sensitive values.
