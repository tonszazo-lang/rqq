import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, Image, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Video } from 'expo-av';
import { ArrowRight, Heart, MessageCircle, Share2 } from 'lucide-react-native';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { useStore } from '../../src/store/useStore';
import { supabase } from '../../src/lib/supabase';

export default function PostDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { likePost, addComment } = useStore();
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState('');
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    loadPost();
    loadComments();
  }, [id]);

  const loadPost = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (data) setPost(data);
    } catch (error) {
      console.error('Error loading post:', error);
    }
  };

  const loadComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setComments(data);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleLike = async () => {
    if (!post) return;
    
    try {
      const newLikes = isLiked ? post.likes - 1 : post.likes + 1;
      
      const { error } = await supabase
        .from('posts')
        .update({ likes: newLikes })
        .eq('id', id);

      if (error) throw error;
      
      setIsLiked(!isLiked);
      setPost({ ...post, likes: newLikes });
      likePost(id as string);
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert([{
          post_id: id,
          text: commentText,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      
      if (data) {
        setComments([data, ...comments]);
        addComment(data);
        setCommentText('');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء إضافة التعليق');
    }
  };

  const handleShare = async () => {
    if (!post) return;
    
    try {
      await Share.share({
        message: `${post.title}\n\n${post.content}\n\nمن تطبيق رِقّة`
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (!post) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>جاري التحميل...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowRight size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>التفاصيل</Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.title}>{post.title}</Text>
        <Text style={styles.date}>
          {new Date(post.created_at).toLocaleDateString('ar-EG')}
        </Text>

        {post.file_url && post.type === 'image' && (
          <Image source={{ uri: post.file_url }} style={styles.image} resizeMode="cover" />
        )}

        {post.file_url && post.type === 'video' && (
          <Video
            source={{ uri: post.file_url }}
            style={styles.video}
            useNativeControls
            resizeMode="contain"
          />
        )}

        <Text style={styles.contentText}>{post.content}</Text>

        <View style={styles.actions}>
          <TouchableOpacity 
            style={[styles.actionButton, isLiked && styles.actionButtonActive]} 
            onPress={handleLike}
          >
            <Heart 
              size={24} 
              color={isLiked ? colors.primary : colors.textMuted} 
              fill={isLiked ? colors.primary : 'transparent'}
            />
            <Text style={[styles.actionText, isLiked && styles.actionTextActive]}>
              {post.likes}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <MessageCircle size={24} color={colors.textMuted} />
            <Text style={styles.actionText}>{comments.length}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Share2 size={24} color={colors.textMuted} />
            <Text style={styles.actionText}>مشاركة</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>التعليقات ({comments.length})</Text>
          
          <View style={styles.commentInputContainer}>
            <Input
              placeholder="اكتبي تعليقك..."
              value={commentText}
              onChangeText={setCommentText}
              multiline
              style={styles.commentInput}
            />
            <Button 
              title="إضافة" 
              onPress={handleComment}
              style={styles.commentButton}
            />
          </View>

          {comments.map((comment) => (
            <View key={comment.id} style={styles.comment}>
              <Text style={styles.commentText}>{comment.text}</Text>
              <Text style={styles.commentDate}>
                {new Date(comment.created_at).toLocaleDateString('ar-EG')}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
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
  content: {
    flex: 1,
    padding: 16
  },
  title: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize['2xl'],
    color: colors.text,
    marginBottom: 8,
    textAlign: 'right'
  },
  date: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    marginBottom: 16,
    textAlign: 'right'
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    marginBottom: 16
  },
  video: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    marginBottom: 16
  },
  contentText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.base,
    color: colors.text,
    lineHeight: typography.fontSize.base * typography.lineHeight.relaxed,
    textAlign: 'right',
    marginBottom: 24
  },
  actions: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    marginBottom: 24
  },
  actionButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8
  },
  actionButtonActive: {
    opacity: 1
  },
  actionText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.sm,
    color: colors.textMuted
  },
  actionTextActive: {
    color: colors.primary
  },
  commentsSection: {
    marginBottom: 24
  },
  commentsTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.lg,
    color: colors.text,
    marginBottom: 16,
    textAlign: 'right'
  },
  commentInputContainer: {
    marginBottom: 16
  },
  commentInput: {
    minHeight: 80
  },
  commentButton: {
    marginTop: 8
  },
  comment: {
    backgroundColor: colors.white,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12
  },
  commentText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.base,
    color: colors.text,
    textAlign: 'right',
    marginBottom: 8
  },
  commentDate: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    textAlign: 'right'
  },
  loadingText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.base,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 40
  }
});
