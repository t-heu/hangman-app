import { RefreshCw } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { database, get, ref } from '../../api/firebase';

// Dados fake (exemplo com 15)
const rankingFake = [
  { nome: 'Alice', vitorias: 12, tempoMedio: 42 },
  { nome: 'Bob', vitorias: 10, tempoMedio: 37 },
  { nome: 'Carol', vitorias: 8, tempoMedio: 51 },
  { nome: 'Daniel', vitorias: 7, tempoMedio: 46 },
  { nome: 'Eva', vitorias: 6, tempoMedio: 39 },
  { nome: 'Felipe', vitorias: 5, tempoMedio: 33 },
  { nome: 'Giovana', vitorias: 5, tempoMedio: 40 },
  { nome: 'Hugo', vitorias: 4, tempoMedio: 36 },
  { nome: 'Igor', vitorias: 4, tempoMedio: 39 },
  { nome: 'Julia', vitorias: 3, tempoMedio: 50 },
  { nome: 'Lucas', vitorias: 2, tempoMedio: 48 },
  { nome: 'Matheus', vitorias: 2, tempoMedio: 44 },
  { nome: 'Natalia', vitorias: 1, tempoMedio: 60 },
  { nome: 'Otavio', vitorias: 0, tempoMedio: 0 },
];

export default function TabTwoScreen() {
  const [ranking, setRanking] = useState<any>([]);
  const meuNome = 'Matheus'; // ou resgatado do contexto/local
  const [minhaPosicao, setMinhaPosicao] = useState<number | null>(null);

  async function fetchRanking() {
    const refRanking = ref(database, 'hangman/rankings');
    const snapshot = await get(refRanking);

    if (!snapshot.exists()) {
      setRanking([]);
      return;
    }

    const dados = Object.values(snapshot.val()).map((item: any) => ({
      nome: item.name,
      vitorias: item.victories,
      tempoMedio: Math.round(item.totalTime / item.victories),
    }));

    const ordenado = dados.sort((a, b) =>
      b.vitorias === a.vitorias
        ? a.tempoMedio - b.tempoMedio
        : b.vitorias - a.vitorias
    );

    setRanking(ordenado);

    const idx = ordenado.findIndex((r) => r.nome === meuNome);
    setMinhaPosicao(idx);
  }

  useEffect(() => {
    fetchRanking();
  }, []);

  return (
    <View style={styles.container}>
       <View style={styles.headerContainer}>
          <Text style={styles.title}>🏅 Ranking semanal</Text>
          <TouchableOpacity onPress={() => fetchRanking()}>
            <RefreshCw color="#eee" size={24} />
          </TouchableOpacity>
        </View>

      <FlatList
        data={ranking.slice(0, 10)} // Top 10
        keyExtractor={(item: any, index) => `${item.nome}-${index}`}
        renderItem={({ item, index }) => (
          <View style={[styles.item, index < 3 && styles.top3]}>
            <Text style={[styles.name, index < 3 && styles.top3Text]}>
              {index + 1}. {item.nome}
            </Text>
            <Text style={[styles.stats, index < 3 && styles.top3Text]}>
              🏆 {item.vitorias} vitórias | ⏱ {item.tempoMedio}s
            </Text>
          </View>
        )}
      />

      <View style={styles.myRankContainer}>
        <Text style={styles.myTitle}>👤 Sua posição</Text>
        {minhaPosicao !== null && minhaPosicao >= 10 ? (
          <View style={[styles.item, styles.myItem]}>
            <Text style={styles.name}>
              {minhaPosicao + 1}. {ranking[minhaPosicao].nome}
            </Text>
            <Text style={styles.stats}>
              🏆 {ranking[minhaPosicao].vitorias} vitórias | ⏱ {ranking[minhaPosicao].tempoMedio}s
            </Text>
          </View>
        ) : minhaPosicao !== null ? (
          <Text style={styles.highlight}>Você está no top 10! 🎉</Text>
        ) : (
          <Text style={styles.highlight}>Você ainda não jogou 💤</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#1C1C28' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#fff'},
   headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    marginBottom: 12, marginTop: 12 
  },
  item: {
    marginBottom: 10,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#2C2C3A',
  },
  top3: {
    backgroundColor: '#713f1233',
    borderColor: '#facc15',
    borderWidth: 1,
  },
  top3Text: {
    color: '#facc15'
  },
  name: { fontSize: 18, color: '#fff' },
  stats: { fontSize: 14, color: '#bbb' },
  myRankContainer: {
    marginTop: 30,
    borderTopWidth: 1,
    borderTopColor: '#444',
    paddingTop: 16,
  },
  myTitle: {
    fontSize: 20,
    color: '#fff',
    marginBottom: 8,
    fontWeight: '600',
  },
  myItem: {
    backgroundColor: '#333',
    borderColor: '#555',
    borderWidth: 1,
  },
  highlight: {
    color: '#00FFAA',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
  },
});
