import { useFonts } from 'expo-font';
import { useNavigation } from '@react-navigation/native';

import { type StackNavigation } from "../../App";
import {ButtonText, ButtonWrapper, Button} from '../pages/style'

interface PropsButton {
  text: string;
  press?: any;
  widthD?: number;
}

export default function BackButton({text, press, widthD}: PropsButton) {
  const { goBack } = useNavigation<StackNavigation>();
  const [fontsLoaded, fontError] = useFonts({
    'YanoneKaffeesatz': require('../../assets/fonts/yanone/YanoneKaffeesatz-SemiBold.ttf'),
    'sourceCodePro': require('../../assets/fonts/sourceCodePro/SourceCodePro-SemiBold.ttf')
  });

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <>
    {
      press ? (
        <Button style={{width: widthD ? widthD : 140}} onPress={() => press()}>
          <ButtonWrapper style={{width: widthD ? widthD : 140}}>
            <ButtonText>{text}</ButtonText>
          </ButtonWrapper>
        </Button>
      ) : (
        <Button style={{backgroundColor: '#ab473f', borderColor: '#ab473f'}} onPress={() => goBack()}>
          <ButtonWrapper style={{backgroundColor: "#e2584d", borderColor: '#e2584d'}}>
            <ButtonText>{text}</ButtonText>
          </ButtonWrapper>
        </Button>
      )
    }
    </>
  )
}
