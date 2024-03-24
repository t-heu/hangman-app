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
  const [playerTurn, setPlayerTurn] = useState('');
  const [winnerMessage, setWinnerMessage] = useState('');

  useEffect(() => {
    if (code) {
      onValue(ref(database, 'hangman/rooms/' + code), (snapshot) => {
        const data = snapshot.val();
        const playersObject = data.players || {};
        const playersArray: any = Object.values(playersObject);
        const numPlayers = Object.keys(data.players).length;
        const allPlayersReady = playersArray.every((player: any) =>  player.active && !player.gameover && !player.victory );

        if (data.gameInProgress && allPlayersReady) {
          setWordName(data.wordArray);
          setSelectedLetters(data.selectedLetters);
          setExistElement(currentPlayerUID === isCurrentPlayerTurn(data))
          setWord(data.selectedWord);
          setPlayerTurn(data.turn)

          const allPlayers: any = {};

          // Popula o objeto com os jogadores existentes
          for (let i = 1; i <= numPlayers; i++) {
            allPlayers['p' + i] = data.players['p' + i];
          }

          setPlayers(allPlayers);
        }

        // Verifica se algum jogador acabou o jogo ou alcançou a vitória
        const anyPlayerGameOverOrVictory = playersArray.every((player: any) => player.gameover || player.victory);
        if (data.gameInProgress && anyPlayerGameOverOrVictory) {
          handleGameEnd(data)
        }
      });
    } else {
      setExistElement(true)
      setWord(route.params.selectedWord);
      setWordName(route.params.wordArray);
    }
  }, []);

  const isCurrentPlayerTurn = (data: any) => {
    for (const key in data.players) {
      if (key === data.turn) {
        return data.players[key].uid; // Retorna o objeto encontrado
      }
    }
    return false
  };

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
        const numPlayers = Object.keys(players).length;
        const playerNumber = parseInt(playerTurn.replace(/\D/g, ''), 10);

        updates['hangman/rooms/' + code + '/selectedLetters'] = [...selectedLetters, letter];;
        updates['hangman/rooms/' + code + '/wordArray'] = newWordName;

        const nextPlayerIndex = playerNumber + 1;
        const nextPlayer = 'p' + nextPlayerIndex;

        updates['hangman/rooms/' + code + '/turn'] = playerNumber >= numPlayers ? 'p1' : nextPlayer
        update(ref(database), updates);
      }  

      setWordName(newWordName);
    } else {
      setExistLetter(`Jà existe essa letra: ${letter}`)
    }
  };

  function getWinnerMessage(playersData: any) {
    for (const key in playersData) {
      if (playersData[key].victory) {
        return `${playersData[key].name} ganhou!`;
      }
    }
    return null;
  }

  const handleGameEnd = (data: any) => {
    setExistElement(false);
    setStatus('gameover');

    const winnerMessage = getWinnerMessage(data.players);

    if (winnerMessage) {
      setWinnerMessage(winnerMessage);
    } else {
      setWinnerMessage('VOÇES PERDERAM!');
    }

    const updates: any = {};
    updates['hangman/rooms/' + code + '/gameInProgress'] = false;
    update(ref(database), updates);
  };

  const handleVictory = () => {
    setExistElement(false);
    setStatus('victory');
    setWinnerMessage('VOCÊ GANHOU!');

    if (code) {
      const updates: any = {};
  
      // Adicione verificações para todos os jogadores existentes
      for (let i = 1; i <= Object.keys(players).length; i++) {
        const currentPlayer = players['p' + i];
          
        if (currentPlayer && currentPlayer.uid === currentPlayerUID) {
          updates['hangman/rooms/' + code + '/players/p' + i + '/victory'] = true;
              
          // Define todos os outros jogadores como "gameover"
          for (let j = 1; j <= Object.keys(players).length; j++) {
            if (j !== i) {
              updates['hangman/rooms/' + code + '/players/p' + j + '/gameover'] = true;
            }
          }
              
          break; // Interrompe o loop após encontrar o jogador atual
        }
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
    
        // Adicione verificações para todos os jogadores existentes
        for (let i = 1; i <= Object.keys(players).length; i++) {
          const currentPlayer = players['p' + i];
            
          if (currentPlayer && currentPlayer.uid === currentPlayerUID) {
            updates['hangman/rooms/' + code + '/players/p' + i + '/gameover'] = true;
                
            // Define todos os outros jogadores como "gameover"
            for (let j = 1; j <= Object.keys(players).length; j++) {
              if (j !== i) {
                updates['hangman/rooms/' + code + '/players/p' + j + '/gameover'] = true;
              }
            }
                
            break; // Interrompe o loop após encontrar o jogador atual
          }
        }
        
        update(ref(database), updates);
      } 
    }
  };

  function getPlayerUid(uid: string) {
    for (const key in players) {
      if (players[key].uid === uid) {
        return key // Retorna o uid se o nome do jogador for encontrado
      }
    }
    return null; // Retorna null se o jogador não for encontrado
  }

  async function restartGameInDatabase() {
    if (code) {
      const updates: any = {};
      const playerIs = getPlayerUid(currentPlayerUID as string);

      if (playerIs) {
        updates[`hangman/rooms/${code}/players/${playerIs}/gameover`] = false;
        updates[`hangman/rooms/${code}/players/${playerIs}/victory`] = false;
        updates[`hangman/rooms/${code}/players/${playerIs}/ready`] = false;
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
        onPress={aa ? () => handleSelectLetter(item) : () => {}}>
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
        {wordName.map((item, index) => <RenderItemLetters key={index} item={item} aa={false} />)}
      </LetterContainer>

      <GuideText style={{width: 300}}>{word.dica ? `Dica: ${word.dica}` : null}</GuideText>

      {existElement ? (
        <LetterContainer style={{marginVertical: 10}}>
          {Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ').map((item, index) => <RenderItemLetters key={index} item={item} aa={true} />)}
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
