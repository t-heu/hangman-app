import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { generateTheme } from "@/utils/generateTheme";
import { checkLetter, normalize } from "@/utils/normalizeLetter";
import { generateUidLocal, saveInRanking } from "@/utils/ranking";

import { useCountdownTimer } from '../../hooks/useCountdownTimer';

import Button from '../../components/Button';
import Keyboard from '../../components/Keyboard';
import Letter from '../../components/Letter';

interface Theme {
  selectedWord: {
    name: string;
    dica: string;
  }
  wordArray: string[]
}

interface GameProps {
  lang: {
    time_is_over_text: string;
    winner_solo_text: string;
    game_over_solo_text: string;
    letter_already_used_text: string;
  };
  changeComponent: (component: string) => void;
  indexTheme: number;
  mode: React.RefObject<string>;
}

export default function Game({lang, changeComponent, indexTheme, mode}: GameProps) {
  const isCompetitive = mode.current === 'competitive';

  const [gameState, setGameState] = useState<Theme>({
    selectedWord: { name: '', dica: '' },
    wordArray: []
  });
  const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
  const [countErrors, setCountErrors] = useState(0);
  const [existLetter, setExistLetter] = useState('');
  const [gameStatus, setGameStatus] = useState<'play' | 'gameover'>('play');
  const [finalMessage, setFinalMessage] = useState('');
  const {
    time: timeRemaining,
    start,
    stop,
    reset,
    increase,
    getTime
  } = useCountdownTimer(30, () => {
    setGameStatus('gameover');
    setFinalMessage(lang.time_is_over_text);
  });

  const handleVictory = useCallback(async () => {
    setGameStatus('gameover');
    setFinalMessage(lang.winner_solo_text);
    const {uid, name} = await generateUidLocal();
    const tempoFinal = getTime()
    
    if (name) await saveInRanking(uid, name, tempoFinal);

    stop()
  }, [lang]);

  const handleIncorrectGuess = useCallback(() => {
    setCountErrors(prev => {
      const updated = prev + 1;
      if (updated >= 6) {
        setGameStatus('gameover');
        setFinalMessage(lang.game_over_solo_text);
        stop();
      }
      return updated;
    });
  }, [countErrors, lang]);

  const handleSelectLetter = useCallback((letter: string) => {
    if (!selectedLetters.includes(letter)) {
      setSelectedLetters([...selectedLetters, letter]);

      const matches = checkLetter(gameState.selectedWord.name, letter);
      const newWordName = gameState.selectedWord.name.split('').map((char, index) => matches[index] ? char : gameState.wordArray[index]);

      const wordComplete = newWordName.every((char) => char !== '');
      if (wordComplete ) {
        handleVictory();
      }

      const normalizedWordName = newWordName.map(normalize);
      const normalizedLetter = normalize(letter);

      if (!normalizedWordName.includes(normalizedLetter)) {
        handleIncorrectGuess();
      } else {
        // modo offline
        increase(2);
      }

      setGameState(prevState => ({
        ...prevState,
        wordArray: newWordName
      }));
    } else {
      setExistLetter(`${letter} ${lang.letter_already_used_text}`)
    }
  }, [selectedLetters, gameState.selectedWord.name, gameState.wordArray, handleVictory, handleIncorrectGuess]);

  const startOffGame = useCallback(async () => {
    const themeId = indexTheme ?? 4;
    const { selectedWord, wordArray } = await generateTheme(themeId);

    setGameState({
      selectedWord,
      wordArray
    });
    setSelectedLetters([]);
    setCountErrors(0);
    setExistLetter('');
    setGameStatus('play');

    if (!isCompetitive) {
      reset();
      start();
    }
  }, [indexTheme])

  const restartGame = useCallback(() => {
    startOffGame();
  }, [startOffGame]);

  useEffect(() => {
    startOffGame();
  }, [startOffGame]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#262632' }}>
      <View style={styles.main}>

        {/* Palavra do oponente */}
        {isCompetitive && (
          <>
            <View style={styles.infoHeader}>
              <Text style={[styles.guideText, { color: '#f55' }]}>
                Erros do oponente: 1
              </Text>
            </View>

            <View style={styles.opponentSection}>
              <Text style={[styles.guideText, { color: '#aaa', marginBottom: 4 }]}>Oponente: Eva</Text>
              <View style={styles.letterContainer}>
                {gameState.wordArray.map((item, i) => {
                  const displayLetter = item ? '#' : item;

                  return (
                    <Letter
                      key={`op-${i}`}
                      item={displayLetter}
                      handleSelectLetter={() => {}}
                    />
                  );
                })}
              </View>
            </View>
          </>
        )}

        {/* Palavra do jogador */}
        <View style={styles.infoHeader}>
          <Text style={[styles.guideText, { color: '#e2584d' }]}>
            Errors: {countErrors}
          </Text>

          <Text style={[styles.guideText, { width: 110 }]}>
            {existLetter}
          </Text>

          {!isCompetitive && (
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>
                {timeRemaining < 10 ? `00:0${timeRemaining}` : `00:${timeRemaining}`}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.mySection}>
          {isCompetitive && (<Text style={[styles.guideText, { color: '#eee', marginBottom: 4 }]}>Você</Text>)}
          <View style={styles.letterContainer}>
            {gameState.wordArray.map((item, i) => (
              <Letter key={`me-${i}`} item={item} handleSelectLetter={() => {}} />
            ))}
          </View>
        </View>

        <Text style={[styles.guideText, { color: '#eee', marginTop: 10 }]}>
          {gameState.selectedWord.dica ? `Dica: ${gameState.selectedWord.dica}` : null}
        </Text>

        {gameStatus === 'play' && (
          <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {'QWERTYUIOP'.split('').map((item, i) => (
                <Keyboard key={i} item={item} handleSelectLetter={handleSelectLetter} />
              ))}
            </View>

            <View style={{ flexDirection: 'row', marginTop: 6 }}>
              {'ASDFGHJKL'.split('').map((item, i) => (
                <Keyboard key={i} item={item} handleSelectLetter={handleSelectLetter} />
              ))}
            </View>

            <View style={{ flexDirection: 'row', marginTop: 6 }}>
              {'ZXCVBNM'.split('').map((item, i) => (
                <Keyboard key={i} item={item} handleSelectLetter={handleSelectLetter} />
              ))}
            </View>
          </View>
        )}

        {gameStatus === 'gameover' && (
          <View style={{alignItems: 'center'}}>
            <Text style={styles.guideText}>{finalMessage}</Text>
            {(!(gameState.wordArray.every((char: any) => char !== ''))) ? (
              <Text style={styles.guideText}>A Palavra era: {gameState.selectedWord.name}</Text>
            ) : null}
            <Button press={restartGame} text='JOGAR NOVAMENTE' />
            <Button press={() => changeComponent('Home')} text='SAIR' />
          </View>
        )}

        {mode.current === 'solo' && (<Text style={[styles.guideText, { marginTop: 8, color: '#eee' }]}>Dica extra: A cada acerto você ganha +2s</Text>)}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  letterContainer: {
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 5,
    marginTop: 10,
  },
  infoHeader: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginTop: 15,
    width: '100%',
  },
  guideText: {
    color: '#FDE767',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 5,
    paddingVertical: 2,
    paddingHorizontal: 10,
    fontFamily: 'SourceCode'
  },
  timeContainer: {
    borderWidth: 3,
    borderColor: '#fff',
    backgroundColor: '#f5f5fa',
    width: 65,
    height: 32,
    justifyContent: 'center',
  },
  timeText: {
    backgroundColor: '#f5f5fa',
    textAlign: 'center',
    paddingTop: 2,
    fontSize: 14,
    borderWidth: 2.6,
    borderColor: '#ddd',
    color: '#000',
    fontFamily: 'SourceCode'
  },
  main: {
    flex: 1,
    paddingHorizontal: 16,
  },
  opponentSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  mySection: {
    alignItems: 'center',
    marginBottom: 16,
  },
});
