module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // Reanimated 4: worklets run on the UI thread; plugin must be listed last.
    'react-native-worklets/plugin',
  ],
};
