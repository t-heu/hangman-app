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
  const {code, currentPlayerUID} = route.params
  const [players, setPlayers] = useState<any>({});

  const [fontsLoaded, fontError] = useFonts({
    'YanoneKaffeesatz': require('../../assets/fonts/yanone/YanoneKaffeesatz-SemiBold.ttf'),
    'sourceCodePro': require('../../assets/fonts/sourceCodePro/SourceCodePro-SemiBold.ttf')
  });

  const copyToClipboard = async () => await Clipboard.setStringAsync(code);

  function createGame(codeRoom: string, indexTheme: number) {
    const {selectedWord, wordArray} = generateTheme(indexTheme);
    const updates: any = {};
        
    updates['hangman/rooms/' + codeRoom + '/selectedLetters'] = Array('-');
    updates['hangman/rooms/' + codeRoom + '/selectedWord'] = selectedWord;
    updates['hangman/rooms/' + codeRoom + '/wordArray'] = wordArray;
    updates['hangman/rooms/' + codeRoom + '/gameInProgress'] = true;
      
    update(ref(database), updates);
  }

  function getPlayerUid(uid: string) {
    for (const key in players) {
      if (players[key].uid === uid) {
        return {
          key: key,
          data: players[key]
        }
      }
    }
    return null;
  }

  function playReady() {
    const updates: any = {};

    const key = 'p' + (1 + Number(getPlayerUid(currentPlayerUID as string)?.key))
    updates[`hangman/rooms/${code}/players/${key}/ready`] = players[Number(getPlayerUid(currentPlayerUID as string)?.key)].ready ? false : true
    update(ref(database), updates);
  }

  useEffect(() => {
    const minPlayers = 2;
    const maxPlayers = 8;

    onValue(ref(database, 'hangman/rooms/' + code), (snapshot) => {
      const data = snapshot.val();
      const playersObject = data.players || {};
      const numPlayers = Object.keys(playersObject).length;
      const playersArray: any = Object.values(playersObject);
      setPlayers(playersArray)

      if (numPlayers >= minPlayers && numPlayers <= maxPlayers) {
        const allPlayersReady = playersArray.every((player: any) => player.ready && !player.gameover && !player.victory);

        if (allPlayersReady && !data.gameInProgress) {
          createGame(code, data.indexTheme);
          navigate("Game", { code: code, currentPlayerUID: currentPlayerUID });
        }
      }
    });
  }, []);

  const renderThemes = (data: any, index: any) => (
    <Theme style={{marginLeft: 10, marginRight: 10, maxWidth: 150, minWidth: 'auto'}}>
      <GuideText>{data.owner ? '👑 ' : null}</GuideText>
      <TextNameTheme style={{width: 'auto', paddingRight: 10}}>{data.name}</TextNameTheme>
      {data.uid === route.params.currentPlayerUID ? 
        null : (
        <GuideText style={{color: data.ready ? '#36AA4D' : '#e2584d'}}>{data.ready ? 'READY' : 'PREPARING'}</GuideText>
      )}
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
        style={{marginBottom: 15, height: 300}}
        numColumns={2}
      />

      {getPlayerUid(currentPlayerUID as string) ? (
        <Button widthD={100} press={() => playReady()} text={!getPlayerUid(currentPlayerUID as string)?.data.ready ? 'READY' : 'CANCEL'} />
      ) : null}
      <Button text='SAIR' />

      <View style={{marginTop: 30, height: 300, alignItems: 'center', width: '100%'}}>
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

