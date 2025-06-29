import AsyncStorage from '@react-native-async-storage/async-storage';
import { database, get, push, ref, set, update } from '../api/firebase';

/**
 * Atualiza o ranking do jogador ou cria um novo.
 * @param uid UID do jogador (pode ser gerado por `push().key`)
 * @param name Nome do jogador
 * @param tempo Tempo (em segundos) da última vitória
 */
export async function saveInRanking(uid: string, name: string, tempo: number) {
  const playerRef = ref(database, `hangman/rankings/${uid}`);
  const snapshot = await get(playerRef);

  if (snapshot.exists()) {
    const dados = snapshot.val();
    await update(playerRef, {
      victories: dados.victories + 1,
      totalTime: dados.totalTime + tempo,
    });
  } else {
    await set(playerRef, {
      name,
      victories: 1,
      totalTime: tempo,
    });
  }
}

export async function generateUidLocal() {
  const uid = await AsyncStorage.getItem('local_uid');
  const name = await AsyncStorage.getItem('local_user');

  if (uid) {
    return { uid: `p${uid}`, name };
  }

  const key = push(ref(database, 'dummy')).key;
  await AsyncStorage.setItem('local_uid', key);

  return { uid: `p${key}`, name };
}
