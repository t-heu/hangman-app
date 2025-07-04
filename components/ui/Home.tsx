import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { IThemeData, getThemes } from '@/data';
import { child, database, get, push, ref, set, update } from '../../api/firebase';
import { generateRandomWord } from '../../utils/generateRandomWord';

import Button from '@/components/Button';
import ThemeOption from '@/components/ThemeOption';

interface HomeProps {
  setCodeRoom: any
  codeRoom: string;
  changeComponent: (component: string) => void;
  mode: React.RefObject<string>;
  selectedThemeId: number;
  setSelectedThemeId: React.Dispatch<React.SetStateAction<number>>
  currentPlayerUID: React.Dispatch<React.SetStateAction<string>>
}

export default function Home({codeRoom, setCodeRoom, changeComponent, mode, selectedThemeId, setSelectedThemeId, currentPlayerUID}: HomeProps) {
  const [name, setName] = useState('');
  const [themes, setThemes] = useState<{ [key: string]: IThemeData }[]>([]);

  useEffect(() => {
    fetchAvailableThemes();
  }, []);

  const fetchAvailableThemes = async () => {
    try {
      const data = await getThemes();
      setThemes(data.themes);
    } catch (error) {
      console.error('Erro ao buscar temas:', error);
    }
  };

  const showAlert = (message: any) => Alert.alert(message);

  // ONLINE
  function createPlayer(roomKey: string, owner: boolean, name: string) {
    try {
      const updates: any = {};
      const playersRef = ref(database, `hangman/rooms/${roomKey}/players`);
      const newPlayerRef = push(playersRef);
      const nextPlayer = newPlayerRef.key;

      updates[`hangman/rooms/${roomKey}/players/p${nextPlayer}`] = {
        name,
        gameover: false,
        victory: false,
        uid: nextPlayer,
        active: true,
        ready: false,
        owner,
        errors: 0,
        selectedLetters: Array('-'),
        wordArray: Array('-'),
      };

      if (nextPlayer) {
        update(ref(database), updates);
        setCodeRoom(roomKey)
        currentPlayerUID(nextPlayer)
        changeComponent('Lobby')
      }
    } catch (error) {
      console.error('Erro ao criar jogador:', error);
    }
  }

  async function createGame(stauts: boolean) {
    try {
      if (stauts) {
        if (!name) {
          console.error('Erro ao criar jogo: Nome do jogador não fornecido');
          return showAlert("Error: Insira seu nome");
        }

        if (!(/^[a-zA-Z\s]*$/.test(name))) {
          console.error('Erro ao criar jogo: Nome do jogador inválido');
          return showAlert("Error: Insira nome valido!");
        }

        const roomKey = generateRandomWord(6);

        await set(ref(database, 'hangman/rooms/' + roomKey), {
          indexTheme: selectedThemeId,
          gameInProgress: false,
          selectedWord: { name: '', dica: '' }
        });

        console.info('Jogo criado com sucesso', { roomKey, playerName: name });
        createPlayer(roomKey, true, name);
        setCodeRoom(roomKey)
      } else {
        changeComponent('Game')
        console.log('Jogo offline criado com sucesso');
      }
    } catch (e) {
      console.error('Erro ao criar jogo:', e);
      console.log(e);
    }
  }

  function enterRoomCode() {
    get(child(ref(database), 'hangman/rooms/' + codeRoom)).then((snapshot: any) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const playersObject = data.players || {};
        const numPlayers = Object.keys(playersObject).length;

        if (!data.gameInProgress && numPlayers < 8) {
          createPlayer(codeRoom, false, name);
        } else {
          console.warn(`Tentativa de entrada na sala ${codeRoom} falhou: sala cheia ou partida em andamento`);
          showAlert("Error: Ja foi iniciado a partida ou sala cheia!");
        }
      } else {
        console.warn(`Tentativa de entrada na sala ${codeRoom} falhou: sala inexistente`);
        showAlert("Error: Insira código inválido!");
      }
    }).catch((error: any) => {
      console.error(`Erro ao verificar a sala ${codeRoom}: ${error.message}`);
      showAlert("Error: Tente novamente!");
    });
  }

  function joinRoom() {
    get(child(ref(database), 'hangman/rooms')).then((snapshot: any) => {
      if (snapshot.exists()) {
        const rooms = snapshot.val();
        let foundRoom = false;

        Object.keys(rooms).some((roomKey) => {
          const room = rooms[roomKey];
          const playersObject = room.players || {};
          const numPlayers = Object.keys(playersObject).length;

          if (!room.gameInProgress && numPlayers < 8) {
            createPlayer(roomKey, false, name);
            foundRoom = true;
            return true;
          }
        });

        if (!foundRoom) {
          createGame(true);
        }
      } else {
        createGame(true);
        return true;
      }
    }).catch((error: any) => {
      console.error(`Erro ao verificar as salas: ${error.message}`);
      showAlert("Error: Tente novamente!");
    });
  }

  function play() {
    if (!name) {
      return showAlert("Error: Insira seu nome");
    }

    if (!(/^[a-zA-Z\s]*$/.test(name))) {
      return showAlert("Error: Insira nome valido!");
    }

    if (!(/^[a-zA-Z\s]*$/.test(codeRoom))) {
      return showAlert("Error: Insira código inválido!");
    }

    if (codeRoom) {
      enterRoomCode();
    } else {
      joinRoom();
    }
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#262632', marginTop: 10 }}>
      <View style={{ flex: 1, alignItems: 'center' }}>
        <Text style={{ color: '#fff', fontSize: 18, marginBottom: 10, fontFamily: 'SourceCode' }}>Escolha seu tema favorito:</Text>
        <ScrollView style={{ height: 220 }}>
          {themes.length > 0 ? themes.map((data, i) => <ThemeOption checked={selectedThemeId} setChecked={setSelectedThemeId} key={i} index={i} theme={data[i]} />) : <Text style={{ color: '#fff' }}>....</Text>}
        </ScrollView>

        <Button text='JOGAR OFFLINE' press={() => createGame(false)} />

        <View style={{ marginTop: 20 }}>
          <Text style={{ color: '#fff', fontSize: 18, marginBottom: 10 }}>JOGUE COM SEU COLEGA:</Text>

          <View style={styles.onlineRoomDiv}>
            <View style={styles.roomDiv}>
              <TextInput
                placeholderTextColor="#888"
                value={name}
                onChangeText={(text) => setName(text)}
                placeholder='Seu nome'
                style={styles.input}
              />
              <TextInput
                placeholderTextColor="#888"
                value={codeRoom}
                onChangeText={(text) => setCodeRoom(text)}
                placeholder='Código da sala'
                style={styles.input}
              />
              <Button text='COMPETITIVO' press={() => play()} />
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  input: {
    borderColor: '#444',
    borderWidth: 2,
    borderRadius: 5,
    color: '#777',
    fontFamily: 'SourceCode',
    paddingVertical: 5,
    paddingHorizontal: 10,
    height: 40,
    width: 140,
    marginBottom: 5,
  },
  onlineRoomDiv: {
    justifyContent: 'center',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 10,
  },
  roomDiv: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
