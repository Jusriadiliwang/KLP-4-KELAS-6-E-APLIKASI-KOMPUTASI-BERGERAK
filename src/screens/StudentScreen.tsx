import { useEffect, useState } from 'react';
import {
    Alert,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { supabase } from '../supabase';

type Props = {
  onBack: () => void;
};

type Question = {
  id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  is_active: boolean;
  created_at: string;
};

type Answer = {
  id: number;
  question_id: number;
  student_name: string;
  selected_answer: string;
  is_correct: boolean;
  score: number;
  created_at: string;
};

export default function StudentScreen({ onBack }: Props) {
  const [studentName, setStudentName] = useState('');
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [myAnswer, setMyAnswer] = useState<Answer | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getActiveQuestion();

    const questionChannel = supabase
      .channel('student-question-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'questions' },
        () => {
          getActiveQuestion();
          setSelectedAnswer('');
          setMyAnswer(null);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(questionChannel);
    };
  }, []);

  const getActiveQuestion = async () => {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error) {
      setActiveQuestion(data as Question | null);
    }
  };

  const submitAnswer = async () => {
    if (!studentName.trim()) {
      Alert.alert('Nama belum diisi', 'Masukkan nama mahasiswa terlebih dahulu.');
      return;
    }

    if (!activeQuestion) {
      Alert.alert('Belum ada soal', 'Tunggu dosen melakukan broadcast soal.');
      return;
    }

    if (!selectedAnswer) {
      Alert.alert('Jawaban belum dipilih', 'Pilih salah satu jawaban A, B, C, atau D.');
      return;
    }

    setLoading(true);

    const isCorrect = selectedAnswer === activeQuestion.correct_answer;
    const score = isCorrect ? 100 : 0;

    const { data, error } = await supabase
      .from('answers')
      .insert([
        {
          question_id: activeQuestion.id,
          student_name: studentName,
          selected_answer: selectedAnswer,
          is_correct: isCorrect,
          score,
        },
      ])
      .select()
      .single();

    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    setMyAnswer(data as Answer);

    Alert.alert(
      'Jawaban Terkirim',
      isCorrect ? 'Jawaban kamu benar. Skor 100.' : 'Jawaban kamu salah. Skor 0.'
    );
  };

  const renderOption = (label: string, text: string) => {
    return (
      <Pressable
        style={[
          styles.optionButton,
          selectedAnswer === label && styles.optionButtonActive,
        ]}
        onPress={() => setSelectedAnswer(label)}
      >
        <View style={styles.optionCircle}>
          <Text
            style={[
              styles.optionCircleText,
              selectedAnswer === label && styles.optionCircleTextActive,
            ]}
          >
            {label}
          </Text>
        </View>

        <Text
          style={[
            styles.optionText,
            selectedAnswer === label && styles.optionTextActive,
          ]}
        >
          {text}
        </Text>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.hero}>
          <Pressable onPress={onBack} style={styles.backButton}>
            <Text style={styles.backText}>← Kembali</Text>
          </Pressable>

          <Text style={styles.badge}>🧑‍🎓 Mode Mahasiswa</Text>
          <Text style={styles.title}>Dashboard Mahasiswa</Text>
          <Text style={styles.subtitle}>
            Terima soal quiz dari dosen, pilih jawaban, dan lihat skor otomatis.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>👤 Nama Mahasiswa</Text>
          <Text style={styles.cardDesc}>
            Nama ini akan tampil di dashboard dosen.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Masukkan nama mahasiswa"
            value={studentName}
            onChangeText={setStudentName}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>📌 Soal Aktif</Text>

          {activeQuestion ? (
            <View>
              <View style={styles.questionBox}>
                <Text style={styles.question}>{activeQuestion.question_text}</Text>
              </View>

              {renderOption('A', activeQuestion.option_a)}
              {renderOption('B', activeQuestion.option_b)}
              {renderOption('C', activeQuestion.option_c)}
              {renderOption('D', activeQuestion.option_d)}

              <Pressable
                style={styles.primaryButton}
                onPress={submitAnswer}
                disabled={loading}
              >
                <Text style={styles.primaryButtonText}>
                  {loading ? 'Mengirim Jawaban...' : '✅ Kirim Jawaban'}
                </Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.waitingBox}>
              <Text style={styles.waitingIcon}>⏳</Text>
              <Text style={styles.waitingTitle}>Belum Ada Soal</Text>
              <Text style={styles.emptyText}>
                Tunggu dosen melakukan broadcast soal. Soal akan muncul otomatis.
              </Text>
            </View>
          )}
        </View>

        {myAnswer && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>🎯 Hasil Jawaban</Text>

            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Nama</Text>
              <Text style={styles.resultValue}>{myAnswer.student_name}</Text>
            </View>

            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Jawaban</Text>
              <Text style={styles.resultValue}>{myAnswer.selected_answer}</Text>
            </View>

            <View style={styles.resultStatusBox}>
              <Text
                style={[
                  styles.resultStatus,
                  myAnswer.is_correct ? styles.trueText : styles.falseText,
                ]}
              >
                {myAnswer.is_correct ? 'BENAR' : 'SALAH'}
              </Text>
              <Text style={styles.resultScore}>Skor: {myAnswer.score}</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#ecfdf5' },
  container: { padding: 16, gap: 16 },
  hero: {
    backgroundColor: '#064e3b',
    borderRadius: 26,
    padding: 22,
  },
  backButton: { marginBottom: 14 },
  backText: { color: '#bbf7d0', fontWeight: '800' },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#16a34a',
    color: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    fontWeight: '800',
    marginBottom: 12,
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    color: '#ffffff',
  },
  subtitle: {
    color: '#d1fae5',
    marginTop: 8,
    lineHeight: 22,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: '#0f172a',
  },
  cardDesc: {
    color: '#64748b',
    marginTop: 4,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#a7f3d0',
    borderRadius: 14,
    padding: 13,
    backgroundColor: '#f8fafc',
  },
  questionBox: {
    backgroundColor: '#f0fdf4',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  question: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
    lineHeight: 25,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#16a34a',
    padding: 13,
    borderRadius: 16,
    marginBottom: 10,
    backgroundColor: '#ffffff',
  },
  optionButtonActive: {
    backgroundColor: '#16a34a',
  },
  optionCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionCircleText: {
    color: '#16a34a',
    fontWeight: '900',
  },
  optionCircleTextActive: {
    color: '#ffffff',
  },
  optionText: {
    color: '#166534',
    fontWeight: '800',
    flex: 1,
  },
  optionTextActive: {
    color: '#ffffff',
  },
  primaryButton: {
    backgroundColor: '#16a34a',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 16,
  },
  waitingBox: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  waitingIcon: {
    fontSize: 42,
    marginBottom: 8,
  },
  waitingTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 6,
  },
  emptyText: {
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 21,
  },
  resultCard: {
    backgroundColor: '#ffffff',
    padding: 18,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#86efac',
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 12,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 14,
    marginBottom: 8,
  },
  resultLabel: {
    color: '#64748b',
    fontWeight: '700',
  },
  resultValue: {
    color: '#0f172a',
    fontWeight: '900',
  },
  resultStatusBox: {
    marginTop: 10,
    backgroundColor: '#f0fdf4',
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
  },
  resultStatus: {
    fontSize: 24,
    fontWeight: '900',
  },
  trueText: { color: '#16a34a' },
  falseText: { color: '#dc2626' },
  resultScore: {
    marginTop: 6,
    fontSize: 20,
    fontWeight: '900',
    color: '#0f172a',
  },
});