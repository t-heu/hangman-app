import { StyleSheet, Text, View } from 'react-native';
import { RadioButton } from 'react-native-paper';

import { IThemeData } from '@/data';

interface ThemeOptionProps {
  theme: IThemeData; 
  index: number
  checked: number
  setChecked: React.Dispatch<React.SetStateAction<number>>
}

export default function ThemeOption({ theme, index, checked, setChecked }: ThemeOptionProps) {
  return (
    <View key={index} style={styles.themeOptionContainer}>
      <RadioButton
        value={index.toString()}
        color='#eee'
        status={checked === index ? 'checked' : 'unchecked'}
        onPress={() => setChecked(index)}
      />
      <Text style={styles.themeOptionText}>{theme.name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  themeOptionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginLeft: 10,
    marginRight: 10,
    maxWidth: 180,
  },
  themeOptionText: {
    color: '#fff',
    fontSize: 16,
    width: 140,
    fontFamily: 'SourceCode'
  },
});
