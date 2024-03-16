import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useFonts } from 'expo-font';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

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
  const {code, currentPlayerUID, indexTheme} = route.params;
  const [word, setWord] = useState<Theme>({name: '', dica: ''});
  const [wordName, setWordName] = useState<string[]>([]);
  const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
  const [countErrors, setCountErrors] = useState(0);
  const [existLetter, setExistLetter] = useState('');
  const [existElement, setExistElement] = useState(false);
  const [status, setStatus] = useState('');
  const [players, setPlayers] = useState<any>({});
  const [playerTurn, setPlayerTurn] = useState('');
  const [winnerMessage, setWinnerMessage] = useState('VOÇE PERDEU!');

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(code);
  };

  useEffect(() => {
    if (code) {
      onValue(ref(database, 'hangman/' + code), (snapshot) => {
        const data = snapshot.val();

        if (data.newGame && (data.p1.active && data.p2.active) && !(data.p1.gameover || data.p2.gameover || data.p1.victory || data.p2.victory)) {
          setWordName(data.wordArray);
          setSelectedLetters(data.selectedLetters);
          setExistElement(true)
          setWord(data.selectedWord);
          setPlayerTurn(data.turn)
          setPlayers({
            p1: data.p1,
            p2: data.p2
          });
        }

        if (data.p1.restartGame && data.p2.restartGame) {
          const {selectedWord, wordArray} = generateTheme(data.indexTheme);

          const updates: any = {};
          updates['hangman/' + code + '/p1/restartGame'] = false;
          updates['hangman/' + code + '/p2/restartGame'] = false;
          updates['hangman/' + code + '/selectedLetters'] = Array('-');
          updates['hangman/' + code + '/selectedWord'] = selectedWord;
          updates['hangman/' + code + '/wordArray'] = wordArray;
          updates['hangman/' + code + '/newGame'] = true;
          
          update(ref(database), updates);
        }

        // Verificar se é a vez do jogador atual
        if ((data.turn === 'p1' && data.p1.uid === currentPlayerUID) || (data.turn === 'p2' && data.p2.uid === currentPlayerUID)) {
          setExistElement(false);
        }

        // Verificar se o jogo acabou por gameover ou vitória
        if (data.newGame && (data.p1.gameover || data.p2.gameover || data.p1.victory || data.p2.victory)) {
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
      const updates: any = {};
      setSelectedLetters([...selectedLetters, letter]);
  
      const newWordName = word.name.split('').map((char, index) => {
        return char === letter ? char : wordName[index];
      });

      if (code) {
        updates['hangman/' + code + '/selectedLetters'] = [...selectedLetters, letter];;
        updates['hangman/' + code + '/wordArray'] = newWordName;
        updates['hangman/' + code + '/turn'] = players.p1.uid === currentPlayerUID ? 'p1' : 'p2';
      }  

      const isNotEmpty = newWordName.every((char) => char !== '');
      if (isNotEmpty) {
        handleVictory();
      }

      if (newWordName.indexOf(letter) === -1) {
        handleIncorrectGuess();
      }

      if (code) update(ref(database), updates);
      setWordName(newWordName);
    } else {
      setExistLetter(`Jà existe essa letra: ${letter}`)
    }
  };

  const handleGameEnd = (data: any) => {
    setExistElement(false);
    setStatus('gameover');
    setWinnerMessage('VOÇES PERDERAM!');
  
    if (data.p1.victory || data.p2.victory) {
      const winner = data.p1.victory ? data.p1 : data.p2;
      setWinnerMessage(`${winner.name} ganhou!`);
    }

    const updates: any = {};
    updates['hangman/' + code + '/newGame'] = false;
    update(ref(database), updates);
  };

  const handleVictory = () => {
    setExistElement(false);
    setStatus('victory');
    setWinnerMessage('VOCÊ GANHOU!');
  
    const updates: any = {};
    if (code && players.p1.uid === currentPlayerUID) {
      updates['hangman/' + code + '/p1/victory'] = true;
    } else if (code && players.p2.uid === currentPlayerUID) {
      updates['hangman/' + code + '/p2/victory'] = true;
    }
    update(ref(database), updates);
  };

  const handleIncorrectGuess = () => {
    setCountErrors(countErrors + 1);
    
    if (countErrors === 5) {
      setExistElement(false);
      setStatus('gameover');
      setWinnerMessage('VOCÊ PERDEU!');
      
      const updates: any = {};
      if (code && players.p1.uid === currentPlayerUID) {
        updates['hangman/' + code + '/p1/gameover'] = true;
        update(ref(database), updates);
      } else if (code && players.p2.uid === currentPlayerUID) {
        updates['hangman/' + code + '/p2/gameover'] = true;
        update(ref(database), updates);
      }
    }
  };

  async function restartGameInDatabase() {
    if (code && players.p1.uid === currentPlayerUID) {
      const updates: any = {};
      updates['hangman/' + code + '/p1'+ '/gameover'] = false;
      updates['hangman/' + code + '/p1'+ '/victory'] = false;
      updates['hangman/' + code + '/p1' + '/restartGame'] = true;

      await update(ref(database), updates);
    } else if (code && players.p2.uid === currentPlayerUID) {
      const updates: any = {};
      updates['hangman/' + code + '/p2'+ '/gameover'] = false;
      updates['hangman/' + code + '/p2'+ '/victory'] = false;
      updates['hangman/' + code + '/p2' + '/restartGame'] = true;

      await update(ref(database), updates);
    } else {
      const {selectedWord, wordArray} = generateTheme(indexTheme || 3);

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
    setCountErrors(0);
    setExistLetter('');
    setStatus('');
    setWinnerMessage('VOÇE PERDEU!');
    setSelectedLetters([]);
    setWord({name: '', dica: ''});
    setWordName([]);
    restartGameInDatabase();
  };

  const RenderItemLetters = ({ item, index }: any) => (
    <CharacterDisplay
      key={index}
      style={{shadowOffset: { width: 0, height: 2 }, shadowColor: '#000', shadowOpacity: 0.5, elevation: 4, backgroundColor: '#000', borderColor: '#000'}}
      onPress={() => handleSelectLetter(item)}>
      <LetterBoxWrapper>
        <LetterText>{item}</LetterText>
      </LetterBoxWrapper>
    </CharacterDisplay>
  );

  const RenderItemWord = ({ item, index }: any) => (
    <CharacterDisplay key={index} style={{shadowOffset: { width: 0, height: 2 }, shadowColor: '#000', shadowOpacity: 0.5}}>
      <LetterText>{item}</LetterText>
    </CharacterDisplay>
  );

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
            <RenderItemWord key={index} item={item} />
          ))}
      </LetterContainer>

      <GuideText style={{width: 300}}>{word.dica ? `Dica: ${word.dica}` : null}</GuideText>

      {existElement ? (
        <LetterContainer style={{marginVertical: 10}}>
          {Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ').map((item, index) => (
            <RenderItemLetters key={index} item={item} />
          ))}
        </LetterContainer>
      ) : (
        <>
          {
            status ? (
              <>
                <GuideText style={{color: '#FDE767'}}>{winnerMessage}</GuideText>
                {!(wordName.every((char) => char !== '')) ? (<GuideText style={{color: '#FDE767'}}>A Palavra era: {word.name}</GuideText>) : null}
                <Button press={restartGame} text='JOGAR NOVAMENTE' />
                <Button text='SAIR' />
              </>
            ) : (
              <>
              {
                !playerTurn ? (
                  <GuideText style={{color: '#FDE767'}}>AGUARDANDO JOGADOR ENTRAR...</GuideText>
                ) : (
                  <GuideText style={{color: '#d68f54'}}>AGUARDANDO JOGADOR JOGAR...</GuideText>
                )
              }
              </>
            )
          }
        </>
      )}
      {
        code ? (
          <>
            <GuideText style={{color: '#eee'}}>Compartilhe código com seu colega: {code}</GuideText>
            <TouchableOpacity onPress={() => copyToClipboard()} style={{marginTop: 5 }}>
              <Feather name="copy" size={24} color="#eee" />
            </TouchableOpacity>
          </>
        ) : null
      }
    </Main>
    </ScrollView>
  );
}
