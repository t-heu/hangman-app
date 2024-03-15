import { StyleSheet, Text, View} from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function Header() {
  return (
    <>
    <StatusBar style="auto" />
    <View style={styles.header}>
      <Text style={styles.title}>Hangman</Text>
      <Text style={styles.fontSmall}>game</Text>
    </View>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#f5f5fa",
    padding: 30,
    justifyContent: "center",
    alignItems: "center",
    width: '100%',
    flexDirection: 'row'
  },
  title: {
    color: "#25272E",
    fontFamily: "sans-serif",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 36
  },
  fontSmall: {
    color: "#e2584d",
    fontSize: 12,
    fontWeight: "bold",
  }
});
