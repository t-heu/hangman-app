import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { IThemeData, getThemes } from '@/data';

import Button from '@/components/Button';
import ThemeOption from '@/components/ThemeOption';

interface HomeProps {
  lang: {
    copied_alert: string;
    invalid_copied_alert: string;
  };
  changeComponent: (component: string) => void;
  mode: React.RefObject<string>;
  indexTheme: (themeId: number) => void;
}

export default function Home({lang, changeComponent, mode, indexTheme}: HomeProps) {
  const [selectedThemeId, setSelectedThemeId] = useState(1);
  const [name, setName] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [themes, setThemes] = useState<{ [key: string]: IThemeData }[]>([]);
  const [codeRoom, setCodeRoom] = useState('');

  useEffect(() => {
    loadUser();
    fetchAvailableThemes();
  }, []);

  const loadUser = async () => {
    const savedUser = await AsyncStorage.getItem('local_user');
    if (savedUser) {
      setName(savedUser);
      setIsRegistered(true);
    }
  };

  const fetchAvailableThemes = async () => {
    try {
      const data = await getThemes();
      setThemes(data.themes);
    } catch (error) {
      console.error('Erro ao buscar temas:', error);
    }
  };

  async function createGame(modeGame: string) {
    try {
      mode.current = modeGame;
      indexTheme(selectedThemeId)
      changeComponent('Game')
    } catch (e) {
      console.error('❌ Erro ao criar jogo:', e);
      console.log(e);
    }
  }

  async function createUser() {
    const trimmedName = name?.trim();

    if (!trimmedName) {
      showAlert(lang.copied_alert);
      return;
    }

    const isValidName = /^[a-zA-Z\s]+$/.test(trimmedName);
    if (!isValidName) {
      showAlert(lang.invalid_copied_alert);
      return;
    }

    const alreadyRegistered = await AsyncStorage.getItem('local_user');
    if (!alreadyRegistered) {
      await AsyncStorage.setItem('local_user', trimmedName);
      setIsRegistered(true);
    }
  }

  const showAlert = (message: any) => Alert.alert(message);
  const onLayoutRootView = () => setTimeout(async () => await SplashScreen.hideAsync(), 1200);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#262632', marginTop: 10 }}>
      <View onLayout={onLayoutRootView} style={{ flex: 1, alignItems: 'center' }}>

        {isRegistered ? (
          <>
            <Text style={{ color: '#fff', fontSize: 18, marginBottom: 10, fontFamily: 'SourceCode' }}>Escolha seu tema favorito:</Text>
            <ScrollView style={{ height: 220 }}>
              {themes.length > 0 ? themes.map((data, i) => <ThemeOption checked={selectedThemeId} setChecked={setSelectedThemeId} key={i} index={i} theme={data[i]} />) : <Text style={{ color: '#fff' }}>....</Text>}
            </ScrollView>

            <Button text='JOGAR OFFLINE' press={() => createGame('solo')} />

            <View style={{ marginTop: 20 }}>
              <Text style={{ color: '#fff', fontSize: 18, marginBottom: 10 }}>JOGUE COM SEU COLEGA:</Text>

              <View style={styles.onlineRoomDiv}>
                <View style={styles.roomDiv}>
                  <TextInput
                    placeholderTextColor="#888"
                    value={codeRoom}
                    onChangeText={(text) => setCodeRoom(text)}
                    placeholder='Código da sala'
                    style={styles.input}
                  />
                  <Button text='COMPETITIVO' press={() => createGame('competitive')} />
                </View>
              </View>
            </View>
          </>
        ):(
          <>
            <Text style={{ color: '#fff', fontSize: 18, marginBottom: 10, fontFamily: 'SourceCode' }}>Escolha seu nome primeiro:</Text>
            <View style={[styles.roomDiv, { marginTop: 20 }]}>
              <TextInput
                placeholderTextColor="#888"
                value={name}
                onChangeText={(text) => setName(text)}
                placeholder='Seu nome'
                style={styles.input}
              />
              <Button text='SALVAR' press={() => createUser()} />
            </View>
          </>
        )}
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
