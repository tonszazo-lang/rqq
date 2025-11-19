import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { useStore } from '../../src/store/useStore';

export default function AdminLoginScreen() {
  const router = useRouter();
  const { setAdmin } = useStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (username === 'zazo' && password === 'zazo010988') {
      setLoading(true);
      try {
        await SecureStore.setItemAsync('admin_logged_in', 'true');
        setAdmin(true);
        Alert.alert('نجح', 'تم تسجيل الدخول بنجاح', [
          { text: 'حسناً', onPress: () => router.replace('/admin/panel') }
        ]);
      } catch (error) {
        Alert.alert('خطأ', 'حدث خطأ أثناء حفظ بيانات الدخول');
      } finally {
        setLoading(false);
      }
    } else {
      Alert.alert('خطأ', 'اسم المستخدم أو كلمة المرور غير صحيحة');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>تسجيل دخول الأدمن</Text>
        <Text style={styles.subtitle}>أدخلي بيانات الدخول للمتابعة</Text>

        <View style={styles.form}>
          <Input
            label="اسم المستخدم"
            placeholder="أدخلي اسم المستخدم"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />

          <Input
            label="كلمة المرور"
            placeholder="أدخلي كلمة المرور"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Button 
            title="تسجيل الدخول" 
            onPress={handleLogin}
            loading={loading}
            style={styles.loginButton}
          />

          <Button 
            title="رجوع" 
            onPress={() => router.back()}
            variant="outline"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center'
  },
  title: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize['3xl'],
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8
  },
  subtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.base,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 32
  },
  form: {
    gap: 8
  },
  loginButton: {
    marginBottom: 8
  }
});
