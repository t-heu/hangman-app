import { FlatList, View, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { RadioButton } from 'react-native-paper';
import { useFonts } from 'expo-font';
import { useNavigation, NavigationAction } from '@react-navigation/native';

import { type StackNavigation } from "../../App";
import { database, set, ref, update, get, child } from '../api/firebase'
import DataTheme from '../data/themes.json';

import generateTheme from '../utils/generateTheme';

import Header from '../components/header'
import Button from '../components/button'

import { 
  RoomDiv, 
  Input, 
  Theme, 
  Main, 
  Title,
  TextNameTheme,
  OnlineRoomDiv
} from './style'

export default function Home() {
  const {navigate} = useNavigation<StackNavigation>();
  const [fontsLoaded, fontError] = useFonts({
    'YanoneKaffeesatz': require('../../assets/fonts/yanone/YanoneKaffeesatz-SemiBold.ttf'),
    'sourceCodePro': require('../../assets/fonts/sourceCodePro/SourceCodePro-SemiBold.ttf')
  });
  const [checked, setChecked] = useState(4);
  const [code, setCode] = useState('');
  const [nameP1, setNameP1] = useState('');
  const [nameP2, setNameP2] = useState('');

  function generateRandomWord(length: number) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let randomWord = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomWord += characters.charAt(randomIndex);
    }
    return randomWord;
  }

  async function createGame(stauts: boolean) {
    try {
      if (stauts) {
        const uuid = generateRandomWord(6);

        await set(ref(database, 'hangman/rooms/' + uuid), {
          players: {
            p1: {
              name: nameP1 ? nameP1 : 'P1',
              gameover: false,
              victory: false,
              uid: 1,
              active: true,
              ready: false,
              owner: true
            },
          },
          turn: 'p1',
          indexTheme: checked,
          gameInProgress: false,
          selectedLetters: Array('-'),
          wordArray: Array('-'),
          selectedWord: {name: '', dica: ''}
        });
  
        navigate("Lobby",  { code: uuid, currentPlayerUID: 1 })
      } else {
        const {selectedWord, wordArray} = generateTheme(checked);
        navigate("Game",  { selectedWord, wordArray, code, indexTheme: checked })
      }
    } catch (e) {
      console.log(e)
    }
  }

  function play() {
    const updates: any = {};

    if (code) {
      get(child(ref(database), 'hangman/rooms/' + code)).then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const playersObject = data.players || {};
          const numPlayers = Object.keys(playersObject).length;

          if (!data.gameInProgress && numPlayers < 8) {
            const nextPlayer = (numPlayers + 1); // Determina o próximo jogador a ser criado

            updates['hangman/rooms/' + code + '/players' +  '/p' + nextPlayer] = {
              name: nameP2 ? nameP2 : 'P' + nextPlayer,
              gameover: false,
              victory: false,
              uid: numPlayers + 1,
              active: true,
              ready: false,
              owner: false
            }
            update(ref(database), updates);
        
            navigate("Lobby",  { code, currentPlayerUID: nextPlayer })
          } else {
            Alert.alert('Error', 'Ja foi iniciado a partida ou sala cheia')
          }
        } else {
          Alert.alert('Error', 'Código inválido')
        }
      }).catch((error) => {
        console.error(error);
        Alert.alert('Error', 'Tente novamente')
      });
    } else {
      const updates: any = {};
  
      // Buscar todas as salas no banco de dados
      get(child(ref(database), 'hangman/rooms')).then((snapshot) => {
        if (snapshot.exists()) {
          const rooms = snapshot.val();
          
          Object.keys(rooms).some((roomKey) => {
            const room = rooms[roomKey];
            const playersObject = room.players || {};
            const numPlayers = Object.keys(playersObject).length;
            
            // Verificar se a sala atende aos critérios
            if (!room.gameInProgress && numPlayers < 8) {
              const nextPlayer =  (numPlayers + 1); // Determinar o próximo jogador a ser criado
    
              updates['hangman/rooms/' + roomKey + '/players' + '/p' + nextPlayer] = {
                name: nameP2 ? nameP2 : 'P' + nextPlayer,
                gameover: false,
                victory: false,
                uid: nextPlayer,
                active: true,
                ready: false,
                owner: false
              };
              update(ref(database), updates);
              navigate("Lobby",  { code: roomKey, currentPlayerUID: nextPlayer });
              return true
            }
          });
    
          // Se nenhuma sala disponível for encontrada, criar uma nova
          if (!Object.keys(updates).length) {
            createGame(true);
          }
        } else {
          // Se não houver salas no banco de dados, criar uma nova
          createGame(true);
        }
      }).catch((error) => {
        console.error(error);
        Alert.alert('Error', 'Tente novamente');
      });
    }
  }

  const renderThemes = (item: any, index: any) => (
    <Theme>
      <RadioButton
        value={index}
        color='#eee'
        status={ checked === index ? 'checked' : 'unchecked' }
        onPress={() => setChecked(index)}
      />
      <TextNameTheme>{item.name}</TextNameTheme>
    </Theme>
  );

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <Main>
      <Header />

      <Title>Escolha seu tema favorito:</Title>

      <FlatList
        data={DataTheme.themes}
        renderItem={({ item, index }) => renderThemes(item, index)}
        keyExtractor={(_, index) => index.toString()}
        style={{marginBottom: 15}}
        numColumns={2}
      />

      <Button text='JOGAR OFFLINE' press={() => createGame(false)} />

      <View style={{height: 300, alignItems: 'center', width: '100%'}}>
        <Title>JOGUE COM SEU COLEGA:</Title>

        <OnlineRoomDiv>
          <RoomDiv>
            <Input placeholderTextColor="#888" value={nameP1} onChangeText={(text) => setNameP1(text)} placeholder='Seu nome' />
            <Button text='CRIAR SALA' press={() => createGame(true)} />
          </RoomDiv>

          <RoomDiv>
            <Input placeholderTextColor="#888" value={nameP2} onChangeText={(text) => setNameP2(text)} placeholder='Seu nome' />
            <Input placeholderTextColor="#888" value={code} onChangeText={(text) => setCode(text)} placeholder='Code' />
            <Button text='JOGAR' press={() => play()} />
          </RoomDiv>
        </OnlineRoomDiv>
      </View>
    </Main>
  );
}

