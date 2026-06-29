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

export default function TeacherScreen({ onBack }: Props) {
  const [questionText, setQuestionText] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('A');

  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getActiveQuestion();
    getAnswers();

    const questionChannel = supabase
      .channel('teacher-questions-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'questions' },
        () => {
          getActiveQuestion();
        }
      )
      .subscribe();

    const answerChannel = supabase
      .channel('teacher-answers-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'answers' },
        () => {
          getAnswers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(questionChannel);
      supabase.removeChannel(answerChannel);
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

  const getAnswers = async () => {
    const { data, error } = await supabase
      .from('answers')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) {
      setAnswers((data || []) as Answer[]);
    }
  };

  const resetForm = () => {
    setQuestionText('');
    setOptionA('');
    setOptionB('');
    setOptionC('');
    setOptionD('');
    setCorrectAnswer('A');
  };

  const broadcastQuestion = async () => {
    if (!questionText.trim() || !optionA.trim() || !optionB.trim() || !optionC.trim() || !optionD.trim()) {
      Alert.alert('Data belum lengkap', 'Soal dan semua pilihan jawaban wajib diisi.');
      return;
    }

    setLoading(true);

    await supabase
      .from('questions')
      .update({ is_active: false })
      .eq('is_active', true);

    const { data, error } = await supabase
      .from('questions')
      .insert([
        {
          question_text: questionText,
          option_a: optionA,
          option_b: optionB,
          option_c: optionC,
          option_d: optionD,
          correct_answer: correctAnswer,
          is_active: true,
        },
      ])
      .select()
      .single();

    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    setActiveQuestion(data as Question);
    setAnswers([]);
    resetForm();

    Alert.alert('Berhasil', 'Soal berhasil dibroadcast ke mahasiswa.');
  };

  const deleteAllAnswers = async () => {
    const { error } = await supabase.from('answers').delete().neq('id', 0);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    setAnswers([]);
    Alert.alert('Berhasil', 'Semua jawaban mahasiswa dihapus.');
  };

  const filteredAnswers = activeQuestion
    ? answers.filter((item) => item.question_id === activeQuestion.id)
    : [];

  const totalMahasiswa = filteredAnswers.length;
  const totalBenar = filteredAnswers.filter((item) => item.is_correct).length;
  const totalSalah = totalMahasiswa - totalBenar;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.hero}>
          <Pressable onPress={onBack} style={styles.backButton}>
            <Text style={styles.backText}>← Kembali</Text>
          </Pressable>

          <Text style={styles.badge}>👨‍🏫 Mode Dosen</Text>
          <Text style={styles.title}>Dashboard Dosen</Text>
          <Text style={styles.subtitle}>
            Broadcast soal quiz dan pantau jawaban mahasiswa secara realtime tanpa reload.
          </Text>
        </View>

        <View style={styles.statRow}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>👥</Text>
            <Text style={styles.statNumber}>{totalMahasiswa}</Text>
            <Text style={styles.statLabel}>Menjawab</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statIcon}>✅</Text>
            <Text style={[styles.statNumber, styles.greenText]}>{totalBenar}</Text>
            <Text style={styles.statLabel}>Benar</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statIcon}>❌</Text>
            <Text style={[styles.statNumber, styles.redText]}>{totalSalah}</Text>
            <Text style={styles.statLabel}>Salah</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>📝 Buat Soal Quiz</Text>
          <Text style={styles.cardDesc}>
            Isi soal, pilihan jawaban, lalu tekan Broadcast Soal.
          </Text>

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Tulis soal quiz..."
            value={questionText}
            onChangeText={setQuestionText}
            multiline
          />

          <TextInput
            style={styles.input}
            placeholder="Pilihan A"
            value={optionA}
            onChangeText={setOptionA}
          />

          <TextInput
            style={styles.input}
            placeholder="Pilihan B"
            value={optionB}
            onChangeText={setOptionB}
          />

          <TextInput
            style={styles.input}
            placeholder="Pilihan C"
            value={optionC}
            onChangeText={setOptionC}
          />

          <TextInput
            style={styles.input}
            placeholder="Pilihan D"
            value={optionD}
            onChangeText={setOptionD}
          />

          <Text style={styles.label}>Jawaban Benar</Text>

          <View style={styles.answerRow}>
            {['A', 'B', 'C', 'D'].map((item) => (
              <Pressable
                key={item}
                style={[
                  styles.answerButton,
                  correctAnswer === item && styles.answerButtonActive,
                ]}
                onPress={() => setCorrectAnswer(item)}
              >
                <Text
                  style={[
                    styles.answerButtonText,
                    correctAnswer === item && styles.answerButtonTextActive,
                  ]}
                >
                  {item}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            style={styles.primaryButton}
            onPress={broadcastQuestion}
            disabled={loading}
          >
            <Text style={styles.primaryButtonText}>
              {loading ? 'Mengirim Soal...' : '🚀 Broadcast Soal'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>📌 Soal Aktif</Text>

          {activeQuestion ? (
            <View style={styles.activeQuestionBox}>
              <Text style={styles.question}>{activeQuestion.question_text}</Text>

              <View style={styles.optionBox}>
                <Text style={styles.option}>A. {activeQuestion.option_a}</Text>
                <Text style={styles.option}>B. {activeQuestion.option_b}</Text>
                <Text style={styles.option}>C. {activeQuestion.option_c}</Text>
                <Text style={styles.option}>D. {activeQuestion.option_d}</Text>
              </View>

              <Text style={styles.correct}>
                Jawaban Benar: {activeQuestion.correct_answer}
              </Text>
            </View>
          ) : (
            <Text style={styles.emptyText}>Belum ada soal aktif.</Text>
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.cardTitle}>📊 Jawaban Mahasiswa</Text>
              <Text style={styles.cardDesc}>
                Jawaban akan muncul otomatis saat mahasiswa mengirim.
              </Text>
            </View>

            <Pressable onPress={deleteAllAnswers}>
              <Text style={styles.deleteText}>Hapus</Text>
            </Pressable>
          </View>

          {filteredAnswers.length === 0 ? (
            <Text style={styles.emptyText}>Belum ada mahasiswa menjawab.</Text>
          ) : (
            filteredAnswers.map((item) => (
              <View key={item.id} style={styles.answerItem}>
                <View style={styles.avatarBox}>
                  <Text style={styles.avatarText}>
                    {item.student_name.charAt(0).toUpperCase()}
                  </Text>
                </View>

                <View style={styles.answerContent}>
                  <Text style={styles.studentName}>{item.student_name}</Text>
                  <Text style={styles.studentAnswer}>
                    Jawaban: {item.selected_answer}
                  </Text>
                </View>

                <View style={styles.scoreBox}>
                  <Text
                    style={[
                      styles.scoreText,
                      item.is_correct ? styles.trueText : styles.falseText,
                    ]}
                  >
                    {item.is_correct ? 'Benar' : 'Salah'}
                  </Text>
                  <Text style={styles.scoreNumber}>{item.score}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#eaf2ff' },
  container: { padding: 16, gap: 16 },
  hero: {
    backgroundColor: '#0f172a',
    borderRadius: 26,
    padding: 22,
  },
  backButton: { marginBottom: 14 },
  backText: { color: '#bfdbfe', fontWeight: '800' },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#1d4ed8',
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
    color: '#cbd5e1',
    marginTop: 8,
    lineHeight: 22,
  },
  statRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  statIcon: { fontSize: 22 },
  statNumber: {
    fontSize: 26,
    fontWeight: '900',
    color: '#2563eb',
    marginTop: 6,
  },
  statLabel: { color: '#64748b', fontSize: 13 },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
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
    borderColor: '#cbd5e1',
    borderRadius: 14,
    padding: 13,
    marginBottom: 10,
    backgroundColor: '#f8fafc',
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  label: {
    fontWeight: '800',
    color: '#334155',
    marginBottom: 8,
  },
  answerRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  answerButton: {
    flex: 1,
    padding: 11,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2563eb',
    alignItems: 'center',
  },
  answerButtonActive: {
    backgroundColor: '#2563eb',
  },
  answerButtonText: {
    color: '#2563eb',
    fontWeight: '900',
  },
  answerButtonTextActive: {
    color: '#ffffff',
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 16,
  },
  activeQuestionBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 14,
  },
  question: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 10,
  },
  optionBox: {
    gap: 6,
  },
  option: {
    color: '#334155',
    fontWeight: '600',
  },
  correct: {
    marginTop: 12,
    fontWeight: '900',
    color: '#16a34a',
  },
  emptyText: {
    color: '#64748b',
    marginTop: 10,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  deleteText: {
    color: '#dc2626',
    fontWeight: '900',
  },
  answerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 16,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  avatarBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontWeight: '900',
    color: '#2563eb',
    fontSize: 18,
  },
  answerContent: {
    flex: 1,
  },
  studentName: {
    fontWeight: '900',
    color: '#0f172a',
  },
  studentAnswer: {
    color: '#64748b',
    marginTop: 3,
  },
  scoreBox: {
    alignItems: 'flex-end',
  },
  scoreText: {
    fontWeight: '900',
  },
  trueText: { color: '#16a34a' },
  falseText: { color: '#dc2626' },
  scoreNumber: {
    marginTop: 4,
    fontWeight: '900',
    color: '#0f172a',
  },
  greenText: { color: '#16a34a' },
  redText: { color: '#dc2626' },
});