import 'react-native-get-random-values';
import { FlatList, TouchableOpacity, View } from 'react-native';
import { useState, useEffect } from 'react';
import { useFonts } from 'expo-font';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

import { type StackNavigation } from "../../App";
import { database, ref, update, onValue } from '../api/firebase'

import generateTheme from '../utils/generateTheme';

import Header from '../components/header'
import Button from '../components/button'

import { 
  Theme, 
  Main, 
  Title,
  TextNameTheme,
  GuideText
} from './style'

interface Theme {
  name: string;
  dica: string;
}

type ParamList = {
  Detail: {
    selectedWord?: any;
    wordArray?: any;
    code: string;
    currentPlayerUID?: string;
    indexTheme?: number;
  };
};

export default function Lobby() {
  const { navigate } = useNavigation<StackNavigation>();
  const route = useRoute<RouteProp<ParamList, 'Detail'>>();
  const [code, setCode] = useState('');
  const [players, setPlayers] = useState('');
  //const [gameCreated, setGameCreated] = useState(false);

  const [fontsLoaded, fontError] = useFonts({
    'YanoneKaffeesatz': require('../../assets/fonts/yanone/YanoneKaffeesatz-SemiBold.ttf'),
    'sourceCodePro': require('../../assets/fonts/sourceCodePro/SourceCodePro-SemiBold.ttf')
  });

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(code);
  };

  function createGame(codeRoom: string, indexTheme: number) {
    const {selectedWord, wordArray} = generateTheme(indexTheme);
    const updates: any = {};
        
    updates['hangman/' + codeRoom + '/selectedLetters'] = Array('-');
    updates['hangman/' + codeRoom + '/selectedWord'] = selectedWord;
    updates['hangman/' + codeRoom + '/wordArray'] = wordArray;
    updates['hangman/' + codeRoom + '/newGame'] = true;
      
    update(ref(database), updates);
  }

  useEffect(() => {
    const minPlayers = 2;
    const codeRoom = route.params.code;
    setCode(route.params.code)
    
    onValue(ref(database, 'hangman/' + codeRoom), (snapshot) => {
      const data = snapshot.val();
      let playersArray: any = Object.values(data.players);
      setPlayers(playersArray)
    
      if (Object.keys(data.players).length >= minPlayers) {
        if (!data.newGame && !(data.players.p1.gameover || data.players.p2.gameover || data.players.p1.victory || data.players.p2.victory)) {
          createGame(codeRoom, data.indexTheme)

          setTimeout(() => {
            navigate("Game",  { code: codeRoom, currentPlayerUID: route.params.currentPlayerUID })
          }, 6000);
        }
      }
    })
  }, [])

  const renderThemes = (data: any, index: any) => (
    <Theme>
      <TextNameTheme>{data.name}</TextNameTheme>
    </Theme>
  );

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <Main>
      <Header />

      <Title>Aguardando mais jogadores entrar:</Title>

      <FlatList
        data={players}
        renderItem={({ item, index }) => renderThemes(item, index)}
        keyExtractor={(_, index) => index.toString()}
        style={{marginBottom: 15, height: 200}}
        numColumns={2}
      />

      <Button text='SAIR' />

      <View style={{height: 500, alignItems: 'center', width: '100%'}}>
        {code ? (
          <>
            <GuideText style={{color: '#eee'}}>Compartilhe código com seu colega: {code}</GuideText>
            <TouchableOpacity onPress={() => copyToClipboard()} style={{marginTop: 5 }}>
              <Feather name="copy" size={24} color="#eee" />
            </TouchableOpacity>
          </>
        ) : null}
      </View>
    </Main>
  );
}

