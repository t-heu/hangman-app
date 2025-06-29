import { StyleSheet, Text, TouchableOpacity } from 'react-native';

interface LetterProps {
  item: string;
  handleSelectLetter: (letter: string) => void;
}

export default function Letter({ item, handleSelectLetter }: LetterProps) {
  return (
    <TouchableOpacity
      style={styles.characterDisplay}
      onPress={() => handleSelectLetter(item)}
    >
      <Text style={styles.letterText}>{item}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  characterDisplay: {
    width: 33,         // 👈 tamanho reduzido
    height: 48,
    margin: 1,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#444',
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 2,
    elevation: 2,
  },
  letterText: {
    color: '#eee',
    fontSize: 20,
    textAlign: 'center',
  },
});
