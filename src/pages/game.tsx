import React, { useState, useEffect } from 'react';
import { ScrollView } from 'react-native';
import { useFonts } from 'expo-font';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { type StackNavigation } from "../../App";

import { database, ref, update, onValue } from '../api/firebase'

import {
  Main,
  InfoHeader,
  GuideText,
  LetterContainer,
  CharacterDisplay,
  LetterBoxWrapper,
  LetterText
} from './style';

import Header from '../components/header';
import Button from '../components/button';

import generateTheme from '../utils/generateTheme';

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

export default function Game() {
  const [fontsLoaded, fontError] = useFonts({
    'YanoneKaffeesatz': require('../../assets/fonts/yanone/YanoneKaffeesatz-SemiBold.ttf'),
    'sourceCodePro': require('../../assets/fonts/sourceCodePro/SourceCodePro-SemiBold.ttf')
  });
  const route = useRoute<RouteProp<ParamList, 'Detail'>>();
  const { navigate } = useNavigation<StackNavigation>();
  const {code, currentPlayerUID, indexTheme} = route.params;
  const [word, setWord] = useState<Theme>({name: '', dica: ''});
  const [wordName, setWordName] = useState<string[]>([]);
  const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
  const [countErrors, setCountErrors] = useState(0);
  const [existLetter, setExistLetter] = useState('');
  const [existElement, setExistElement] = useState(false);
  const [status, setStatus] = useState('');
  const [players, setPlayers] = useState<any>({});
  //const [playerTurn, setPlayerTurn] = useState('');
  const [winnerMessage, setWinnerMessage] = useState('');

  useEffect(() => {
    if (code) {
      onValue(ref(database, 'hangman/' + code), (snapshot) => {
        const data = snapshot.val();

        if (data.gameInProgress && (data.players.p1.active && data.players.p2.active) && !(data.players.p1.gameover || data.players.p2.gameover || data.players.p1.victory || data.players.p2.victory)) {
          setWordName(data.wordArray);
          setSelectedLetters(data.selectedLetters);
          setExistElement(true)
          setWord(data.selectedWord);

          setPlayers({
            p1: data.players.p1,
            p2: data.players.p2
          });
        }

        // Verificar se é a vez do jogador atual
        if ((data.turn === 'p1' && data.players.p1.uid === currentPlayerUID) || (data.turn === 'p2' && data.players.p2.uid === currentPlayerUID)) {
          setExistElement(false);
        }

        // Verificar se o jogo acabou por gameover ou vitória
        if (data.gameInProgress && (data.players.p1.gameover || data.players.p2.gameover || data.players.p1.victory || data.players.p2.victory)) {
          handleGameEnd(data)
        }
      });
    } else {
      setExistElement(true)
      setWord(route.params.selectedWord);
      setWordName(route.params.wordArray);
    }
  }, []);

  const handleSelectLetter = (letter: string) => {
    if (!selectedLetters.includes(letter)) {
      setSelectedLetters([...selectedLetters, letter]);
  
      const newWordName = word.name.split('').map((char, index) => char === letter ? char : wordName[index]);

      const isNotEmpty = newWordName.every((char) => char !== '');
      if (isNotEmpty) {
        handleVictory();
      }

      if (newWordName.indexOf(letter) === -1) {
        handleIncorrectGuess();
      }

      if (code) {
        const updates: any = {};
        updates['hangman/' + code + '/selectedLetters'] = [...selectedLetters, letter];;
        updates['hangman/' + code + '/wordArray'] = newWordName;
        updates['hangman/' + code + '/turn'] = players.p1.uid === currentPlayerUID ? 'p1' : 'p2';
        update(ref(database), updates);
      }  

      setWordName(newWordName);
    } else {
      setExistLetter(`Jà existe essa letra: ${letter}`)
    }
  };

  const handleGameEnd = (data: any) => {
    setExistElement(false);
    setStatus('gameover');
    setWinnerMessage('VOÇES PERDERAM!');
  
    if (data.players.p1.victory || data.players.p2.victory) {
      const winner = data.players.p1.victory ? data.players.p1 : data.players.p2;
      setWinnerMessage(`${winner.name} ganhou!`);
    }

    const updates: any = {};
    updates['hangman/' + code + '/gameInProgress'] = false;
    update(ref(database), updates);
  };

  const handleVictory = () => {
    setExistElement(false);
    setStatus('victory');
    setWinnerMessage('VOCÊ GANHOU!');
  
    if (code) {
      const updates: any = {};
      console.log(players.p1.uid, currentPlayerUID)
      if (players.p1.uid === currentPlayerUID) {
        updates['hangman/' + code + '/players/p1/victory'] = true;
        updates['hangman/' + code + '/players/p2/gameover'] = true;
      } else if (players.p2.uid === currentPlayerUID) {
        updates['hangman/' + code + '/players/p2/victory'] = true;
        updates['hangman/' + code + '/players/p1/gameover'] = true;
      }
      update(ref(database), updates);
    }
  };

  const handleIncorrectGuess = () => {
    setCountErrors(countErrors + 1);
    
    if (countErrors === 5) {
      setExistElement(false);
      setStatus('gameover');
      setWinnerMessage('VOCÊ PERDEU!');
      
      if (code) {
        const updates: any = {};
        if (players.p1.uid === currentPlayerUID) {
          updates['hangman/' + code + '/players/p1/gameover'] = true;
          updates['hangman/' + code + '/players/p2/gameover'] = true;
        } else if (players.p2.uid === currentPlayerUID) {
          updates['hangman/' + code + '/players/p2/gameover'] = true;
          updates['hangman/' + code + '/players/p1/gameover'] = true;
        }
        update(ref(database), updates);
      }
    }
  };

  async function restartGameInDatabase() {
    if (code) {
      const updates: any = {};
      if (players.p1.uid === currentPlayerUID) {
        updates[`hangman/${code}/players/p1/gameover`] = false;
        updates[`hangman/${code}/players/p1/victory`] = false;
      } else if (players.p2.uid === currentPlayerUID) {
        updates[`hangman/${code}/players/p2/gameover`] = false;
        updates[`hangman/${code}/players/p2/victory`] = false;
      }
      await update(ref(database), updates);
    } else {
      const {selectedWord, wordArray} = generateTheme(indexTheme === undefined ? 4 : indexTheme);

      setExistElement(true);
      setWord(selectedWord);
      setWordName(wordArray);
      setSelectedLetters([]);
      setCountErrors(0);
      setExistLetter('');
      setStatus('');
    }
  }

  const restartGame = () => {
    restartGameInDatabase();
    navigate("Lobby",  { code, currentPlayerUID })
  };

  const RenderItemLetters = ({ item, index, aa }: any) => {
    const ab = aa ? {shadowOffset: { width: 0, height: 2 }, shadowColor: '#000', shadowOpacity: 0.5, elevation: 4, backgroundColor: '#000', borderColor: '#000'} 
    : {shadowOffset: { width: 0, height: 2 }, shadowColor: '#000', shadowOpacity: 0.5}
    
    return (
      <CharacterDisplay
        key={index}
        style={ab}
        onPress={() => handleSelectLetter(item)}>
        {aa ? (
          <LetterBoxWrapper>
            <LetterText>{item}</LetterText>
          </LetterBoxWrapper>
        ) : (
          <LetterText>{item}</LetterText>
        )}
      </CharacterDisplay>
    )
  }

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#262632'}}>
    <Main>
      <Header />

      <InfoHeader>
        <GuideText style={{color: '#e2584d'}}>Errors: {countErrors}</GuideText>
        <GuideText style={{color: '#FDE767'}}>{existLetter}</GuideText>
      </InfoHeader>

      <LetterContainer style={{marginVertical: 10}}>
        {wordName.map((item, index) => (
            <RenderItemLetters key={index} item={item} aa={false} />
          ))}
      </LetterContainer>

      <GuideText style={{width: 300}}>{word.dica ? `Dica: ${word.dica}` : null}</GuideText>

      {existElement ? (
        <LetterContainer style={{marginVertical: 10}}>
          {Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ').map((item, index) => (
            <RenderItemLetters key={index} item={item} aa={true} />
          ))}
        </LetterContainer>
      ) : (
        <>
          {status ? (
            <>
              <GuideText style={{color: '#FDE767'}}>{winnerMessage}</GuideText>
              {!(wordName.every((char) => char !== '')) ? (<GuideText style={{color: '#FDE767'}}>A Palavra era: {word.name}</GuideText>) : null}
              <Button press={restartGame} text='JOGAR NOVAMENTE' />
              <Button text='SAIR' />
            </>
          ) : (
            <GuideText style={{color: '#FDE767'}}>AGUARDANDO JOGADOR JOGAR...</GuideText>
          )}
        </>
      )}
    </Main>
    </ScrollView>
  );
}
