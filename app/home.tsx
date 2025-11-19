import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, Book, Users, Sparkles, Calendar, MessageCircle, Image as ImageIcon, Video } from 'lucide-react-native';
import { Header } from '../src/components/Header';
import { Card } from '../src/components/Card';
import { colors } from '../src/theme/colors';
import { typography } from '../src/theme/typography';
import { supabase } from '../src/lib/supabase';
import { useStore } from '../src/store/useStore';

const sections = [
  { id: 'feelings', title: 'المشاعر', subtitle: 'شاركي مشاعرك وأفكارك', icon: Heart, color: colors.primary },
  { id: 'fiqh', title: 'فقه النساء', subtitle: 'أحكام وفتاوى نسائية', icon: Book, color: '#9c27b0' },
  { id: 'health', title: 'الصحة', subtitle: 'متابعة الدورة والحمل', icon: Calendar, color: '#e91e63' },
  { id: 'community', title: 'المجتمع', subtitle: 'قصص وتجارب ملهمة', icon: Users, color: '#f06292' },
  { id: 'poems', title: 'الشعر', subtitle: 'قصائد وخواطر', icon: Sparkles, color: '#ec407a' },
  { id: 'stories', title: 'القصص', subtitle: 'حكايات نسائية', icon: MessageCircle, color: '#ad1457' },
  { id: 'images', title: 'الصور', subtitle: 'معرض الصور', icon: ImageIcon, color: '#c2185b' },
  { id: 'videos', title: 'الفيديوهات', subtitle: 'محتوى مرئي', icon: Video, color: '#880e4f' }
];

export default function HomeScreen() {
  const router = useRouter();
  const { setPosts, setLoading } = useStore();

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setPosts(data);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSectionPress = (sectionId: string) => {
    if (sectionId === 'health') {
      router.push('/health');
    } else if (sectionId === 'community') {
      router.push('/community');
    } else {
      router.push(`/section/${sectionId}`);
    }
  };

  const handleAdminAccess = () => {
    router.push('/admin/login');
  };

  const renderSection = ({ item }: { item: typeof sections[0] }) => {
    const Icon = item.icon;
    return (
      <Card onPress={() => handleSectionPress(item.id)} style={styles.sectionCard}>
        <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
          <Icon size={32} color={item.color} />
        </View>
        <View style={styles.sectionContent}>
          <Text style={styles.sectionTitle}>{item.title}</Text>
          <Text style={styles.sectionSubtitle}>{item.subtitle}</Text>
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header 
        title="رِقّة" 
        showHeart 
        onHeartLongPress={handleAdminAccess}
      />
      <FlatList
        data={sections}
        renderItem={renderSection}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  listContent: {
    padding: 8
  },
  sectionCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    padding: 20
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16
  },
  sectionContent: {
    flex: 1,
    alignItems: 'flex-end'
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.lg,
    color: colors.text,
    marginBottom: 4
  },
  sectionSubtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    color: colors.textMuted
  }
});
