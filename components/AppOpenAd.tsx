import { useEffect, useRef } from 'react';
import { AppState, Platform } from 'react-native';
import { AdEventType, AppOpenAd, TestIds } from 'react-native-google-mobile-ads';

const adUnitId: any = __DEV__
  ? TestIds.APP_OPEN
  : Platform.select({
      android: 'ca-app-pub-7158647172444246/2605549206',
    });

const appOpenAd = AppOpenAd.createForAdRequest(adUnitId, {
  requestNonPersonalizedAdsOnly: true,
});

export default function AppOpenAdComponent() {
  const appState = useRef<string>(AppState.currentState);

  useEffect(() => {
    // Tentar carregar imediatamente ao abrir o app
    appOpenAd.load();

    const onAppStateChange = (nextAppState: string) => {
      const isReturningToApp = appState.current.match(/inactive|background/) && nextAppState === 'active';

      if (isReturningToApp) {
        if (appOpenAd.loaded) {
          appOpenAd.show();
        } else {
          appOpenAd.load(); // tenta carregar de novo
        }
      }

      appState.current = nextAppState;
    };

    const sub = AppState.addEventListener('change', onAppStateChange);

    const onError = appOpenAd.addAdEventListener(AdEventType.ERROR, (err) => {
      console.log('❌ Erro ao carregar AppOpenAd:', err);
    });

    return () => {
      sub.remove();
      onError();
    };
  }, []);

  return null;
}
