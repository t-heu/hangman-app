import { Feather } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { database, onValue, ref, update } from '../../api/firebase';
import { generateTheme } from '../../utils/generateTheme';

import Button from '../../components/Button';

interface HomeProps {
  changeComponent: (component: string) => void;
  mode: React.RefObject<string>;
  code: string;
  currentPlayerUID: string;
}

export default function Lobby({changeComponent, mode, code, currentPlayerUID}: HomeProps) {
  const [players, setPlayers] = useState<any>([]);
  const [playerKey, setPlayerKey] = useState<any>('');

  async function createGame(codeRoom: string, indexTheme: number) {
    const {selectedWord} = await generateTheme(indexTheme);
    const updates: any = {};
        
    updates['hangman/rooms/' + codeRoom + '/selectedWord'] = selectedWord;
    updates['hangman/rooms/' + codeRoom + '/gameInProgress'] = true;
      
    update(ref(database), updates);
  }

  function playReady() {
    update(ref(database), { [`hangman/rooms/${code}/players/p${players[playerKey].uid}/ready`]: players[playerKey].ready ? false : true });
  }

  useEffect(() => {
    const minPlayers = 2;
    const maxPlayers = 2;

    onValue(ref(database, 'hangman/rooms/' + code), (snapshot: any) => {
      const data = snapshot.val();
      const playersArray: any = Object.values(data.players || {});
      const numPlayers = playersArray.length;
      
      setPlayers(playersArray);
      setPlayerKey(Object.keys(playersArray).find(key => playersArray[key].uid === currentPlayerUID))
      
      if (numPlayers >= minPlayers && numPlayers <= maxPlayers) {
        const allPlayersReady = playersArray.every((player: any) => player.ready && !player.gameover && !player.victory);
        if (allPlayersReady && !data.gameInProgress) {
          createGame(code, data.indexTheme);
          changeComponent('Game')
        }
      }
    });
  }, []);

  const copyToClipboard = async () => await Clipboard.setStringAsync(code);

  const logout = () => {
    changeComponent('Home');
  };

  const renderThemes = (data: any, index: any) => (
    <View style={styles.playerContainer}>
      <Text style={styles.playerInfo}>{data.owner ? '👑 ' : null}</Text>
      <Text style={[styles.playerName, { paddingRight: 10 }]}>{data.name}</Text>
      {data.uid === currentPlayerUID ? null : (
        <Text style={[
          styles.playerInfo,
          { color: data.ready ? '#36AA4D' : '#e2584d' }
        ]}>
          {data.ready ? 'READY' : 'NOT READY'}
        </Text>
      )}
    </View>
  );

  return (
    <View style={styles.main}>
      <Text style={styles.title}>Aguardando mais jogadores entrar:</Text>

      <FlatList
        data={players}
        renderItem={({ item, index }) => renderThemes(item, index)}
        keyExtractor={(_, index) => index.toString()}
        style={styles.flatList}
        numColumns={2}
      />

      {playerKey ? (
        <Button press={playReady} text={!players[playerKey].ready ? 'READY' : 'CANCEL'} />
      ) : null}
      <Button press={logout} text='SAIR' />

      <View style={styles.codeContainer}>
        {code ? (
          <>
            <Text style={styles.infoCode}>Clique para copiar código</Text>
            <TouchableOpacity onPress={copyToClipboard} style={styles.copyButton}>
              <Text style={styles.infoCode}>{code}</Text>
              <Feather name="copy" size={24} color="#eee" />
            </TouchableOpacity>
            <Text style={styles.infoCode}>Compartilhe código com seu colega</Text>
          </>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#262632',
    paddingHorizontal: 16,
    paddingTop: 30,
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginVertical: 15,
  },
  flatList: {
    marginBottom: 15,
    height: 200,
  },
  playerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginLeft: 10,
    marginRight: 10,
  },
  playerInfo: {
    color: '#eee',
    fontFamily: 'sourceCodePro',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 5,
    paddingVertical: 2,
    paddingHorizontal: 10,
  },
  playerName: {
    color: '#fff',
    fontFamily: 'sourceCodePro',
    fontSize: 16,
    width: 120,
  },
  infoCode: {
    color: '#fff',
    fontFamily: 'sourceCodePro',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 5,
    paddingVertical: 2,
    paddingHorizontal: 10,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
});
