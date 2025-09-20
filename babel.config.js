module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // 'react-native-reanimated/plugin' - Removed for Android build compatibility
      // 'react-native-worklets/plugin' - Removed to fix Android build
    ],
  };
};
