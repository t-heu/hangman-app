import styled from 'styled-components/native';

export const Title = styled.Text`
  color: #fff;
  font-family: sourceCodePro;
  font-size: 18px;
  margin: 20px 0;
`;

export const Input = styled.TextInput`
  border-color: #444;
  border-width: 2px;
  border-radius: 5px;
  color: #777;
  font-family: sourceCodePro;
  padding: 5px 10px;
  height: 40px;
  width: 140px;
  margin-bottom: 5px;
`;

export const OnlineRoomDiv = styled.View`
  justify-content: space-between;
  flex-direction: row;
  width: 100%;
  //border: solid 1px #eee;
`;

export const RoomDiv = styled.View`
  align-items: center;
  justify-content: center;
  width: 50%;
`;

export const Theme = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
`;

export const TextNameTheme = styled.Text`
  color: #fff;
  font-family: sourceCodePro;
  font-size: 16px;
  width: 120px;
`;

export const Button = styled.TouchableOpacity`
  height: 35px;
  background-color: #008000;
  border-width: 2px;
  margin-top: 16px;
  border-color: #008000;
  border-radius: 5px;
  padding: 6px 4px;
  width: 140px;
  justify-content: center;
  align-items: center;
  align-content: center;
`;

export const ButtonWrapper = styled.View`
  height: 35px;
  width: 140px;
  border-radius: 5px;
  background-color: #36AA4D;
  position: absolute;
  bottom: 5px;
  left: -2px;
  justify-content: center;
`;

export const ButtonText = styled.Text`
  color: #eee;
  text-transform: uppercase;
  font-family: YanoneKaffeesatz;
  font-size: 20px;
  text-align: center;
`;

export const Main = styled.View`
  background-color: #262632;
  align-items: center;
  flex: 1;
`;

// Game
export const LetterContainer = styled.View`
  justify-content: center;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
`;

export const CharacterDisplay = styled.TouchableOpacity`
  border-radius: 2px;
  border: 2px solid #444;
  background-color: #222;
  padding: 10px;
  height: 60px;
  width: 60px;
  margin: 1px;
`;

export const LetterBoxWrapper = styled.View`
  padding: 10px;
  height: 60px;
  width: 60px;
  border-radius: 2px;
  border: 2px solid #444;
  background-color: #222;
  position: absolute;
  bottom: -2px;
  left: 0;
`;

export const LetterText = styled.Text`
  color: #eee;
  font-family: sourceCodePro;
  font-size: 24px;
  text-align: center;
`;

export const InfoHeader = styled.View`
  justify-content: space-around;
  flex-direction: row;
  width: 100%;
  margin-top: 10px;
`;

export const GuideText = styled.Text`
  color: #eee;
  font-family: sourceCodePro;
  font-size: 14px;
  text-align: center;
  margin-top: 5px;
  margin-bottom: 5px;
`;
