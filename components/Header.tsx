import { StyleSheet, Text, View } from 'react-native';

interface HeaderCompProps {
  mode: string
}

export default function HeaderComp({mode}: HeaderCompProps) {
  return (
    <View style={styles.header}>
      <Text style={styles.titleHeader}>Hangman</Text>
      <Text style={styles.fontSmall}>{!mode ? 'game' : mode}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#f5f5fa',
    padding: 30,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    flexDirection: 'row',
    textAlign: 'center',
  },
  titleHeader: {
    color: '#25272E',
    fontWeight: 'bold',
    fontSize: 36,
    textAlignVertical: 'center', // vertical-align não existe, usamos textAlignVertical para Android
  },
  fontSmall: {
    color: '#e2584d',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'SourceCode'
  }
});
