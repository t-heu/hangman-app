import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { IThemeData, getThemes } from '@/data';

import Button from '@/components/Button';
import ThemeOption from '@/components/ThemeOption';

export default function Home({lang, changeComponent, mode, indexTheme}: any) {
  const [checked, setChecked] = useState(1);
  const [name, setName] = useState('');
  const [show, setShow] = useState(false);
  const [themes, setThemes] = useState<{ [key: string]: IThemeData }[]>([]);

  useEffect(() => {
    async function getStoredName() {
      const uidSalvo = await AsyncStorage.getItem('local_user');
      if (!uidSalvo) return null;
      setName(uidSalvo);
      setShow(true);
    }

    getStoredName()

    const fetchThemes = async () => {
      try {
        const data = await getThemes();
        setThemes(data.themes);
      } catch (e) {
        console.log(e)
      }
    };

    fetchThemes();
  }, []);

  async function createGame(modeGame: string) {
    try {
      changeComponent('Game')
      mode.current = modeGame;
      indexTheme(checked)
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

    const uidSalvo = await AsyncStorage.getItem('local_user');
    if (uidSalvo) return uidSalvo;

    await AsyncStorage.setItem('local_user', name.trim());
    setShow(true)
  }

  const showAlert = (message: any) => Alert.alert(message);
  const onLayoutRootView = () => setTimeout(async () => await SplashScreen.hideAsync(), 1200);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#262632', marginTop: 10 }}>
      <View onLayout={onLayoutRootView} style={{ flex: 1, alignItems: 'center' }}>

        {show ? (
          <>
            <Text style={{ color: '#fff', fontSize: 18, marginBottom: 10, fontFamily: 'SourceCode' }}>Escolha seu tema favorito:</Text>
            <ScrollView style={{ height: 220 }}>
              {themes.length > 0 ? themes.map((data, i) => <ThemeOption checked={checked} setChecked={setChecked} key={i} index={i} theme={data[i]} />) : <Text style={{ color: '#fff' }}>....</Text>}
            </ScrollView>

            <Button text='JOGAR OFFLINE' press={() => createGame('solo')} />
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

        {/*<View style={{ marginTop: 20 }}>
          <Text style={{ color: '#fff', fontSize: 18, marginBottom: 10 }}>JOGUE COM SEU COLEGA:</Text>

          <View style={styles.onlineRoomDiv}>
            <View style={styles.roomDiv}>
              <TextInput
                placeholderTextColor="#888"
                value={codeRoom}
                onChangeText={(text) => setCodeRoom(text)}
                placeholder='Código'
                style={styles.input}
              />
              <Button text='COMPETITIVO' press={() => play('competitive')} />
            </View>

            <Text style={{ color: '#fff', fontSize: 16, marginVertical: 10, textAlign: 'center' }}>OU:</Text>

            <Button text='PVP' press={() => play('pvp')} />
          </View>
        </View>*/}
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
