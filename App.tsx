//import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationProp } from '@react-navigation/native';

import HomeScreen from './src/pages/home'
import GameScreen from './src/pages/game'

interface ThemeParams {
  selectedWord?: any; // Adjust the type according to your data structure
  code: string;
  wordArray?: any
  currentPlayerUID?: string;
  indexTheme?: number;
}

export type ScreenNames = ["Home", "Game"] // type these manually
export type RootStackParamList = Record<ScreenNames[number], ThemeParams>;
export type StackNavigation = NavigationProp <RootStackParamList>;

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home" screenOptions={{
        headerShown: false
      }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Game" component={GameScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
