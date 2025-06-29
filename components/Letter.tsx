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
    //borderRadius: 2,
    //borderWidth: 2,
    borderColor: '#eee',
    //backgroundColor: '#222',
    borderBottomWidth: 2,
    padding: 10,
    height: 60,
    width: 60,
    margin: 2,
    //shadowOffset: { width: 0, height: 2 },
    //shadowColor: '#000',
    //shadowOpacity: 0.5,
    //shadowRadius: 2,
    //elevation: 3,
  },
  letterText: {
    color: '#eee',
    fontSize: 24,
    textAlign: 'center',
  },
});
