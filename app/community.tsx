import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowRight } from 'lucide-react-native';
import { Card } from '../src/components/Card';
import { colors } from '../src/theme/colors';
import { typography } from '../src/theme/typography';

const communityStories = [
  {
    id: '1',
    title: 'قصة أمل',
    author: 'أمل محمد',
    excerpt: 'رحلتي في التغلب على الصعاب وتحقيق أحلامي...',
    date: '2025-01-15'
  },
  {
    id: '2',
    title: 'تجربتي مع الأمومة',
    author: 'فاطمة أحمد',
    excerpt: 'كيف غيرت الأمومة حياتي وعلمتني معنى الحب الحقيقي...',
    date: '2025-01-14'
  },
  {
    id: '3',
    title: 'النجاح بعد الفشل',
    author: 'نورا حسن',
    excerpt: 'قصتي مع الفشل وكيف تحول إلى نجاح باهر...',
    date: '2025-01-13'
  }
];

export default function CommunityScreen() {
  const router = useRouter();

  const renderStory = ({ item }: { item: typeof communityStories[0] }) => (
    <Card>
      <Text style={styles.storyTitle}>{item.title}</Text>
      <Text style={styles.storyAuthor}>بقلم: {item.author}</Text>
      <Text style={styles.storyExcerpt}>{item.excerpt}</Text>
      <Text style={styles.storyDate}>
        {new Date(item.date).toLocaleDateString('ar-EG')}
      </Text>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowRight size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>قصص المجتمع</Text>
      </View>

      <FlatList
        data={communityStories}
        renderItem={renderStory}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  backButton: {
    padding: 8
  },
  headerTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.xl,
    color: colors.text,
    marginRight: 12
  },
  listContent: {
    padding: 8
  },
  storyTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.lg,
    color: colors.text,
    marginBottom: 8,
    textAlign: 'right'
  },
  storyAuthor: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    marginBottom: 8,
    textAlign: 'right'
  },
  storyExcerpt: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.base,
    color: colors.textLight,
    lineHeight: typography.fontSize.base * typography.lineHeight.normal,
    textAlign: 'right',
    marginBottom: 12
  },
  storyDate: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    textAlign: 'right'
  }
});
