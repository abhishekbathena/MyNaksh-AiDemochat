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

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <GestureHandlerRootView style={styles.root}>
      <Provider store={store}>
        <SafeAreaProvider>
          <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
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
