import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PropsButton {
  text: string;
  press?: any;
}

export default function ButtonComp({ text, press }: PropsButton) {
  const isSair = text === 'SAIR';

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isSair && { backgroundColor: '#ab473f', borderColor: '#ab473f' },
      ]}
      onPress={press}
    >
      <View
        style={[
          styles.buttonWrapper,
          isSair && { backgroundColor: '#e2584d', borderColor: '#e2584d' },
        ]}
      >
        <Text style={styles.buttonText}>{text}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 35,
    backgroundColor: '#008000',
    borderWidth: 2,
    marginTop: 16,
    borderColor: '#008000',
    borderRadius: 5,
    paddingVertical: 6,
    paddingHorizontal: 4,
    width: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonWrapper: {
    height: 35,
    width: 140,
    borderRadius: 5,
    backgroundColor: '#36AA4D',
    position: 'absolute',
    bottom: 5,
    left: -2,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#eee',
    textTransform: 'uppercase',
    fontFamily: 'SourceCode',
    fontSize: 14,
    textAlign: 'center',
  },
});
