import { useState } from 'react';
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

type Props = {
  onSelectRole: (role: string) => void;
};

export default function HomeScreen({ onSelectRole }: Props) {
  const [selectedRole, setSelectedRole] = useState<'teacher' | 'student' | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showLogin, setShowLogin] = useState(false);

  const openLogin = (role: 'teacher' | 'student') => {
    setSelectedRole(role);
    setUsername('');
    setPassword('');
    setShowLogin(true);
  };

  const handleLogin = () => {
    if (!selectedRole) {
      Alert.alert('Peringatan', 'Pilih role terlebih dahulu.');
      return;
    }

    if (!username.trim() || !password.trim()) {
      Alert.alert('Data belum lengkap', 'Username dan password wajib diisi.');
      return;
    }

    if (
      selectedRole === 'teacher' &&
      username.toLowerCase() === 'dosen' &&
      password === 'dosen123'
    ) {
      onSelectRole('teacher');
      return;
    }

    if (
      selectedRole === 'student' &&
      username.toLowerCase() === 'mahasiswa' &&
      password === 'mhs123'
    ) {
      onSelectRole('student');
      return;
    }

    Alert.alert(
      'Login gagal',
      'Username atau password salah. Periksa kembali akun demo yang digunakan.'
    );
  };

  const roleTitle =
    selectedRole === 'teacher'
      ? 'Login Dosen'
      : selectedRole === 'student'
      ? 'Login Mahasiswa'
      : 'Login Pengguna';

  const roleDesc =
    selectedRole === 'teacher'
      ? 'Masuk sebagai dosen untuk broadcast soal dan melihat hasil quiz.'
      : 'Masuk sebagai mahasiswa untuk menerima soal dan menjawab quiz realtime.';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.heroCard}>
          <View style={styles.topBadge}>
            <Text style={styles.topBadgeText}>Kelompok 4 • Komputasi Bergerak</Text>
          </View>

          <View style={styles.logoCircle}>
            <Text style={styles.logo}>🎓</Text>
          </View>

          <Text style={styles.title}>QuizLive Mobile</Text>

          <Text style={styles.subtitle}>
            Aplikasi quiz online realtime. Dosen mengirim soal, mahasiswa menjawab langsung,
            dan skor dihitung otomatis tanpa reload.
          </Text>

          <View style={styles.infoRow}>
            <View style={styles.infoCard}>
              <Text style={styles.infoIcon}>⚡</Text>
              <Text style={styles.infoTitle}>Realtime</Text>
              <Text style={styles.infoDesc}>Data langsung masuk</Text>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoIcon}>🔐</Text>
              <Text style={styles.infoTitle}>Login Role</Text>
              <Text style={styles.infoDesc}>Dosen & mahasiswa</Text>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoIcon}>📊</Text>
              <Text style={styles.infoTitle}>Skor</Text>
              <Text style={styles.infoDesc}>Otomatis</Text>
            </View>
          </View>

          <View style={styles.featureBox}>
            <Text style={styles.featureTitle}>Fitur Utama</Text>

            <View style={styles.featureItem}>
              <Text style={styles.checkIcon}>✓</Text>
              <Text style={styles.featureText}>Dosen bisa broadcast soal</Text>
            </View>

            <View style={styles.featureItem}>
              <Text style={styles.checkIcon}>✓</Text>
              <Text style={styles.featureText}>Mahasiswa menjawab realtime</Text>
            </View>

            <View style={styles.featureItem}>
              <Text style={styles.checkIcon}>✓</Text>
              <Text style={styles.featureText}>Jawaban diterima dosen tanpa reload</Text>
            </View>

            <View style={styles.featureItem}>
              <Text style={styles.checkIcon}>✓</Text>
              <Text style={styles.featureText}>Skor otomatis setelah menjawab</Text>
            </View>
          </View>

          {!showLogin ? (
            <View style={styles.buttonGroup}>
              <Pressable
                style={({ pressed }) => [
                  styles.roleButton,
                  styles.teacherButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={() => openLogin('teacher')}
              >
                <Text style={styles.roleIcon}>👨‍🏫</Text>
                <View style={styles.roleTextBox}>
                  <Text style={styles.roleTitle}>Masuk Sebagai Dosen</Text>
                  <Text style={styles.roleSubTitle}>Broadcast soal dan pantau hasil</Text>
                </View>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.roleButton,
                  styles.studentButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={() => openLogin('student')}
              >
                <Text style={styles.roleIcon}>🧑‍🎓</Text>
                <View style={styles.roleTextBox}>
                  <Text style={styles.roleTitle}>Masuk Sebagai Mahasiswa</Text>
                  <Text style={styles.roleSubTitle}>Jawab quiz secara realtime</Text>
                </View>
              </Pressable>
            </View>
          ) : (
            <View style={styles.loginCard}>
              <View style={styles.loginHeader}>
                <Pressable
                  style={styles.backLoginButton}
                  onPress={() => {
                    setShowLogin(false);
                    setSelectedRole(null);
                    setUsername('');
                    setPassword('');
                  }}
                >
                  <Text style={styles.backLoginText}>← Pilih role</Text>
                </Pressable>

                <Text style={styles.loginBadge}>
                  {selectedRole === 'teacher' ? '👨‍🏫 Dosen' : '🧑‍🎓 Mahasiswa'}
                </Text>
              </View>

              <Text style={styles.loginTitle}>{roleTitle}</Text>
              <Text style={styles.loginDesc}>{roleDesc}</Text>

              <Text style={styles.inputLabel}>Username</Text>
              <TextInput
                style={styles.input}
                placeholder={
                  selectedRole === 'teacher'
                    ? 'Masukkan username dosen'
                    : 'Masukkan username mahasiswa'
                }
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />

              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Masukkan password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              <Pressable
                style={[
                  styles.loginButton,
                  selectedRole === 'teacher'
                    ? styles.loginTeacherButton
                    : styles.loginStudentButton,
                ]}
                onPress={handleLogin}
              >
                <Text style={styles.loginButtonText}>Login Sekarang</Text>
              </Pressable>

              <View style={styles.demoBox}>
                <Text style={styles.demoTitle}>Akun Demo</Text>
                {selectedRole === 'teacher' ? (
                  <>
                    <Text style={styles.demoText}>Username: dosen</Text>
                    <Text style={styles.demoText}>Password: dosen123</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.demoText}>Username: mahasiswa</Text>
                    <Text style={styles.demoText}>Password: mhs123</Text>
                  </>
                )}
              </View>
            </View>
          )}

          <View style={styles.techBox}>
            <Text style={styles.techText}>React Native Expo</Text>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.techText}>Supabase</Text>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.techText}>Realtime Database</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0f172a',
  },

  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#0f172a',
  },

  heroCard: {
    backgroundColor: '#ffffff',
    borderRadius: 30,
    padding: 28,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  topBadge: {
    alignSelf: 'center',
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 999,
    marginBottom: 18,
  },

  topBadgeText: {
    color: '#1d4ed8',
    fontWeight: '900',
    fontSize: 13,
  },

  logoCircle: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#dbeafe',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  logo: {
    fontSize: 46,
  },

  title: {
    fontSize: 34,
    fontWeight: '900',
    color: '#0f172a',
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 16,
    color: '#475569',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 24,
  },

  infoRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 22,
  },

  infoCard: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  infoIcon: {
    fontSize: 24,
    marginBottom: 6,
  },

  infoTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0f172a',
    textAlign: 'center',
  },

  infoDesc: {
    marginTop: 3,
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
  },

  featureBox: {
    marginTop: 22,
    backgroundColor: '#f8fafc',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  featureTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 12,
  },

  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  checkIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#dcfce7',
    color: '#16a34a',
    textAlign: 'center',
    lineHeight: 28,
    fontWeight: '900',
    marginRight: 10,
  },

  featureText: {
    color: '#334155',
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },

  buttonGroup: {
    marginTop: 22,
    gap: 14,
  },

  roleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 17,
    borderRadius: 18,
  },

  teacherButton: {
    backgroundColor: '#2563eb',
  },

  studentButton: {
    backgroundColor: '#16a34a',
  },

  buttonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },

  roleIcon: {
    fontSize: 30,
    marginRight: 14,
  },

  roleTextBox: {
    flex: 1,
  },

  roleTitle: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '900',
  },

  roleSubTitle: {
    color: '#e0f2fe',
    fontSize: 13,
    marginTop: 3,
    fontWeight: '600',
  },

  loginCard: {
    marginTop: 22,
    backgroundColor: '#f8fafc',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },

  loginHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  backLoginButton: {
    paddingVertical: 6,
  },

  backLoginText: {
    color: '#2563eb',
    fontWeight: '900',
  },

  loginBadge: {
    backgroundColor: '#e0f2fe',
    color: '#0369a1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    fontWeight: '900',
  },

  loginTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0f172a',
    marginTop: 16,
  },

  loginDesc: {
    color: '#64748b',
    marginTop: 6,
    marginBottom: 16,
    lineHeight: 21,
  },

  inputLabel: {
    fontWeight: '900',
    color: '#334155',
    marginBottom: 6,
  },

  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 14,
    padding: 14,
    backgroundColor: '#ffffff',
    marginBottom: 12,
    color: '#0f172a',
  },

  loginButton: {
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 4,
  },

  loginTeacherButton: {
    backgroundColor: '#2563eb',
  },

  loginStudentButton: {
    backgroundColor: '#16a34a',
  },

  loginButtonText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 16,
  },

  demoBox: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  demoTitle: {
    color: '#0f172a',
    fontWeight: '900',
    marginBottom: 6,
  },

  demoText: {
    color: '#475569',
    fontWeight: '700',
    marginBottom: 3,
  },

  techBox: {
    marginTop: 22,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },

  techText: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '800',
  },

  dot: {
    color: '#94a3b8',
    fontWeight: '900',
  },
});