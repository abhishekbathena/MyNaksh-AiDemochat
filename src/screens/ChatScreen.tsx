import { StyleSheet, Text, View } from 'react-native';

/**
 * Deprecated placeholder screen (kept temporarily).
 */
export function ChatScreen() {
  return (
    <View style={styles.root}>
      <Text style={styles.title}>MyNaksh</Text>
      <Text style={styles.sub}>Loading…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 8,
  },
  sub: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
  },
});
