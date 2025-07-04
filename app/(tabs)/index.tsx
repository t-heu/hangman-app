import Constants from 'expo-constants';
import * as Localization from 'expo-localization';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import Header from '@/components/Header';

import Game from '@/components/ui/Game';
import Home from '@/components/ui/Home';
import Lobby from '@/components/ui/Lobby';

import { getDictionary } from '@/utils/dictionaries';

const isExpoGo = Constants.executionEnvironment === 'storeClient';
const isDev = __DEV__ || isExpoGo;

let BannerAd: any;
let BannerAdSize: any;
let TestIds: any;

if (!isDev) {
  const ads = require('react-native-google-mobile-ads');
  BannerAd = ads.BannerAd;
  BannerAdSize = ads.BannerAdSize;
  TestIds = ads.TestIds;
}

export default function HomeScreen() {
  const [componentToRender, setComponentToRender] = useState('');
  const [selectedThemeId, setSelectedThemeId] = useState(1);
  const [currentPlayerUID, setCurrentPlayerUID] = useState('');
  const [codeRoom, setCodeRoom] = useState('');
  const [lang, setLang] = useState<any>(null);
  const mode = useRef('')

  useEffect(() => {
    const locales = Localization.getLocales();
    const languageTag = locales.length > 0 ? locales[0].languageTag.toLowerCase() : 'en';

    const supportedLanguages = ['pt-br', 'pt', 'pt-pt', 'en'];
    const defaultLanguage = 'en';
    const selectedLanguage = supportedLanguages.includes(languageTag) ? languageTag : defaultLanguage;

    const dict = getDictionary(selectedLanguage);
    setLang(dict);
    setComponentToRender('Home');
  }, []);
  
  const changeComponent = (component: string) => setComponentToRender(component);

  return (
    <>
      <Header mode={mode.current} />
      {componentToRender === 'Game' && <Game changeComponent={changeComponent} indexTheme={selectedThemeId} code={codeRoom} currentPlayerUID={currentPlayerUID} />}
      {componentToRender === 'Lobby' && <Lobby code={codeRoom} currentPlayerUID={currentPlayerUID} changeComponent={changeComponent} mode={mode} />}
      {componentToRender === 'Home' && <Home codeRoom={codeRoom} currentPlayerUID={setCurrentPlayerUID} setCodeRoom={setCodeRoom} changeComponent={changeComponent} selectedThemeId={selectedThemeId} setSelectedThemeId={setSelectedThemeId} mode={mode} />}
      
      {!isDev && BannerAd && (
        <View style={styles.container}>
          <BannerAd
            unitId={__DEV__ ? TestIds.BANNER : 'ca-app-pub-7158647172444246/9751048659'}
            size={BannerAdSize.FULL_BANNER}
            requestOptions={{
              requestNonPersonalizedAdsOnly: true,
            }}
          />
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
  },
})
