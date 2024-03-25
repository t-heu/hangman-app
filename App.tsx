//import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationProp } from '@react-navigation/native';

import HomeScreen from './src/pages/home'
import GameScreen from './src/pages/game'
import LobbyScreen from './src/pages/lobby'

interface ThemeParams {
  selectedWord?: any; // Adjust the type according to your data structure
  code: string;
  wordArray?: any
  currentPlayerUID?: number;
  indexTheme?: number;
}

export type ScreenNames = "Home"| "Game" | "Lobby"
// Defina o tipo de navegação para cada tela
export type RootStackParamList = {
  Home: undefined; // Tela "Home" sem parâmetros
  Game: ThemeParams; // Tela "Game" com parâmetros de ThemeParams
  Lobby: ThemeParams; // Tela "Lobby" com parâmetros de ThemeParams
};
export type StackNavigation = NavigationProp<RootStackParamList>;

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home" screenOptions={{
        headerShown: false
      }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Lobby" component={LobbyScreen} />
        <Stack.Screen name="Game" component={GameScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
