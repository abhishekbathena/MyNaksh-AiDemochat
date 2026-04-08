/**
 * MyNaksh technical assessment — chat experience shell.
 *
 * @format
 */

import { StatusBar, StyleSheet, useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RootScreen } from './src/screens/RootScreen';
import { store } from './src/store/store';
import { safeAreaBackground } from './src/theme/colors';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const barStyle = isDarkMode ? 'light-content' : 'dark-content';
  const androidStatusBg = isDarkMode ? '#1A1D26' : safeAreaBackground;

  return (
    <GestureHandlerRootView style={[styles.root, { backgroundColor: androidStatusBg }]}>
      <Provider store={store}>
        <SafeAreaProvider>
          <StatusBar
            barStyle={barStyle}
            backgroundColor={androidStatusBg}
            translucent={false}
          />
          <RootScreen />
        </SafeAreaProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export default App;
