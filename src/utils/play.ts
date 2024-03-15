import { useNavigation } from '@react-navigation/native';
import { type StackNavigation } from "../../App";
import { database, set, ref, update, get, child } from '../firebase'
import DataTheme from '../data/themes.json';

export async function playAgain(checked: number, code: string) {
  const { navigate } = useNavigation<StackNavigation>();

  const scheme = DataTheme.themes[checked].words;
  const num = scheme.length - 1;
  const randomIndex = Math.round(Math.random() * num);
  
  const selectedWord = scheme[randomIndex];
  const wordArray = Array(selectedWord.name.length).fill('');

  const updates = {
    p1: {
      gameover: false,
      victory: false,
      active: true
    },
    p2: {
      gameover: false,
      victory: false,
      active: true
    },
    turn: 'p1',
    selectedLetters: Array('-'),
    wordArray,
    selectedWord
  };
  
  await update(ref(database, 'hangman/' + code), updates);
  navigate("Game",  { selectedWord, wordArray, code })
}