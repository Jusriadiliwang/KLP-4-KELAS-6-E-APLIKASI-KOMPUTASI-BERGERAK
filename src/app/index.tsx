import { useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import StudentScreen from '../screens/StudentScreen';
import TeacherScreen from '../screens/TeacherScreen';

export default function Index() {
  const [role, setRole] = useState<string | null>(null);

  if (role === 'teacher') {
    return <TeacherScreen onBack={() => setRole(null)} />;
  }

  if (role === 'student') {
    return <StudentScreen onBack={() => setRole(null)} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <HomeScreen onSelectRole={setRole} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});