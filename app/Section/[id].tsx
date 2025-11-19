import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowRight } from 'lucide-react-native';
import { Card } from '../../src/components/Card';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { useStore } from '../../src/store/useStore';
import { supabase } from '../../src/lib/supabase';

export default function SectionScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { posts, setPosts, setLoading } = useStore();
  const [sectionPosts, setSectionPosts] = useState<any[]>([]);

  useEffect(() => {
    loadSectionPosts();
  }, [id]);

  const loadSectionPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('section', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setSectionPosts(data);
    } catch (error) {
      console.error('Error loading section posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSectionTitle = () => {
    const titles: Record<string, string> = {
      feelings: 'المشاعر',
      fiqh: 'فقه النساء',
      health: 'الصحة',
      community: 'المجتمع',
      poems: 'الشعر',
      stories: 'القصص',
      images: 'الصور',
      videos: 'الفيديوهات'
    };
    return titles[id as string] || 'القسم';
  };

  const renderPost = ({ item }: { item: any }) => (
    <Card onPress={() => router.push(`/post/${item.id}`)}>
      <Text style={styles.postTitle}>{item.title}</Text>
      <Text style={styles.postContent} numberOfLines={3}>
        {item.content}
      </Text>
      <View style={styles.postMeta}>
        <Text style={styles.postDate}>
          {new Date(item.created_at).toLocaleDateString('ar-EG')}
        </Text>
        <Text style={styles.postLikes}>
          {item.likes} إعجاب
        </Text>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowRight size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{getSectionTitle()}</Text>
      </View>
      <FlatList
        data={sectionPosts}
        renderItem={renderPost}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>لا توجد منشورات بعد</Text>
          </View>
        }
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
  postTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.lg,
    color: colors.text,
    marginBottom: 8,
    textAlign: 'right'
  },
  postContent: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.base,
    color: colors.textLight,
    lineHeight: typography.fontSize.base * typography.lineHeight.normal,
    textAlign: 'right',
    marginBottom: 12
  },
  postMeta: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  postDate: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    color: colors.textMuted
  },
  postLikes: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.sm,
    color: colors.primary
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center'
  },
  emptyText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.base,
    color: colors.textMuted
  }
});
