import 'react-native-get-random-values';
import { FlatList, View, Alert } from 'react-native';
import { useState } from 'react';
import { RadioButton } from 'react-native-paper';
import { useFonts } from 'expo-font';
import { v4 } from 'uuid';
import { useNavigation } from '@react-navigation/native';
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
  const { navigate } = useNavigation<StackNavigation>();
  const [fontsLoaded, fontError] = useFonts({
    'YanoneKaffeesatz': require('../../assets/fonts/yanone/YanoneKaffeesatz-SemiBold.ttf'),
    'sourceCodePro': require('../../assets/fonts/sourceCodePro/SourceCodePro-SemiBold.ttf')
  });
  const [checked, setChecked] = useState(0);
  const [code, setCode] = useState('');
  const [nameP1, setNameP1] = useState('');
  const [nameP2, setNameP2] = useState('');

  async function play(stauts: boolean) {
    try {
      if (stauts) {
        const uuid = v4();
        const uid = v4();

        await set(ref(database, 'hangman/' + uuid), {
          p1: {
            name: nameP1 ? nameP1 : 'P1',
            gameover: false,
            victory: false,
            uid: uid,
            active: true,
            restartGame: true
          },
          p2: {
            name: 'P2',
            gameover: false,
            victory: false,
            uid: '',
            active: false,
            restartGame: false
          },
          turn: 'p1',
          indexTheme: checked,
          newGame: true,
          selectedLetters: Array('-'),
          wordArray: Array('-'),
          selectedWord: {name: '', dica: ''}
        });
  
        navigate("Game",  { code: uuid, currentPlayerUID: uid })
      } else {
        const {selectedWord, wordArray} = generateTheme(checked);
        navigate("Game",  { selectedWord, wordArray, code, indexTheme: checked })
      }
    } catch (e) {
      console.log(e)
    }
  }

  function enterRoom() {
    const uid = v4();
    const updates: any = {};

    if (code) {
      get(child(ref(database), 'hangman/' + code)).then((snapshot) => {
        if (snapshot.exists()) {
          updates['hangman/' + code + '/p2' + '/uid'] = uid;
          updates['hangman/' + code + '/p2' + '/name'] = nameP2 ? nameP2 : 'P2';
          updates['hangman/' + code + '/p2' + '/active'] = true;
          updates['hangman/' + code + '/p2' + '/restartGame'] = true;
          update(ref(database), updates);
      
          navigate("Game",  { code, currentPlayerUID: uid})
        } else {
          Alert.alert('Error', 'Código inválido')
        }
      }).catch((error) => {
        console.error(error);
        Alert.alert('Error', 'Tente novamente')
      });
    } else {
      Alert.alert('Error', 'Preencha código')
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
        keyExtractor={(item, index) => index.toString()}
        style={{marginBottom: 15}}
        numColumns={2}
      />

      <Button text='JOGAR OFFLINE' press={() => play(false)} />

      <View style={{height: 300, alignItems: 'center'}}>

        <Title>JOGUE COM SEU COLEGA:</Title>

        <OnlineRoomDiv>
          <RoomDiv>
            <Input placeholderTextColor="#888" value={nameP1} onChangeText={(text) => setNameP1(text)} placeholder='Seu nome' />

            <Button text='CRIAR SALA' press={() => play(true)} />
          </RoomDiv>

          <RoomDiv>
            <Input placeholderTextColor="#888" value={nameP2} onChangeText={(text) => setNameP2(text)} placeholder='Seu nome' />
            <Input placeholderTextColor="#888" value={code} onChangeText={(text) => setCode(text)} placeholder='Code' />
            <Button text='ENTRAR NA SALA' press={() => enterRoom()} />
          </RoomDiv>
        </OnlineRoomDiv>
      </View>
    </Main>
  );
}

