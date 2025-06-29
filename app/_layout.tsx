import Constants from 'expo-constants';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

const isExpoGo = Constants.executionEnvironment === 'storeClient';

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return null;
  }

  let AppOpenAd: React.ComponentType | null = null;
  if (!isExpoGo) {
    AppOpenAd = require('@/components/AppOpenAd').default;
  }

  return (
    <>
      {!isExpoGo && AppOpenAd && <AppOpenAd />}
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
