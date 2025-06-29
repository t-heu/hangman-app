//import NetInfo from '@react-native-community/netinfo';

import animals from './animals.json';
import color from './color.json';
import food from './food.json';
import fruits from './fruits.json';
import objects from './objects.json';
import parts_human_body from './parts_human_body.json';
import periodic_table from './periodic_table.json';
import random from './random.json';
import science_tech from './science_tech.json';
import series_and_serials from './series_and_serials.json';
import super_heroes from './super_heroes.json';
//import test from './test.json';

interface IWord {
  name: string;
  dica: string;
}

export interface IThemeData {
  name: string;
  words: IWord[];
}

export interface ITheme {
  [key: string]: () => IThemeData;
}

const localTheme: ITheme = {
  0: () => random,
  1: () => animals,
  2: () => food,
  3: () => fruits,
  4: () => objects,
  5: () => super_heroes,
  6: () => science_tech,
  7: () => series_and_serials,
  8: () => parts_human_body,
  9: () => periodic_table,
  10: () => color,
 // 11: () => test
}

const loadThemes = async (): Promise<ITheme> => {
  /*const state = await NetInfo.fetch();
  
  if (!state.isConnected) {
    return { ...localTheme };
  }*/

  return { ...localTheme };
};
 
export const getThemes = async () => {
  const themes: ITheme = await loadThemes();
  
  const allThemes = Object.keys(themes).map(locale => ({
    [locale]: themes[locale]()
  }));

  return { themes: allThemes };
};
