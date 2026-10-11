import { StatusBar, StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <Text style={styles.message}>Hello World 👋</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    color: '#0F172A',
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
  },
});
