import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';
import { Picker } from '@react-native-picker/picker';
import { ArrowRight, Trash2, Sparkles } from 'lucide-react-native';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { useStore } from '../../src/store/useStore';
import { supabase } from '../../src/lib/supabase';

export default function AdminPanelScreen() {
  const router = useRouter();
  const { posts, addPost, deletePost, setLoading } = useStore();
  const [title, setTitle] = useState('');
  const [contentType, setContentType] = useState<'text' | 'image' | 'video' | 'poem' | 'story'>('text');
  const [content, setContent] = useState('');
  const [section, setSection] = useState('feelings');
  const [fileUri, setFileUri] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPosts, setAdminPosts] = useState<any[]>([]);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      loadAllPosts();
    }
  }, [isAdmin]);

  const checkAdminStatus = async () => {
    try {
      const adminStatus = await SecureStore.getItemAsync('admin_logged_in');
      if (adminStatus === 'true') {
        setIsAdmin(true);
      } else {
        Alert.alert('خطأ', 'يجب تسجيل الدخول أولاً', [
          { text: 'حسناً', onPress: () => router.replace('/admin/login') }
        ]);
      }
    } catch (error) {
      router.replace('/admin/login');
    }
  };

  const loadAllPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setAdminPosts(data);
    } catch (error) {
      console.error('Error loading posts:', error);
    }
  };

  const pickFile = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('خطأ', 'نحتاج إلى إذن الوصول للمعرض');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: contentType === 'video' 
        ? ImagePicker.MediaTypeOptions.Videos 
        : ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8
    });

    if (!result.canceled) {
      setFileUri(result.assets[0].uri);
    }
  };

  const generateAIContent = async () => {
    Alert.alert(
      'توليد محتوى AI',
      'هذه الميزة تتطلب إعداد API الخاص بـ OpenAI في الباك-إند',
      [{ text: 'حسناً' }]
    );
  };

  const handleAddPost = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('خطأ', 'يرجى ملء جميع الحقول');
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('posts')
        .insert([{
          section,
          title,
          type: contentType,
          content,
          file_url: fileUri,
          likes: 0,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        addPost(data);
        setAdminPosts([data, ...adminPosts]);
        Alert.alert('نجح', 'تم إضافة المنشور بنجاح');
        
        setTitle('');
        setContent('');
        setFileUri(null);
      }
    } catch (error) {
      console.error('Error adding post:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء إضافة المنشور');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = (postId: string) => {
    Alert.alert(
      'تأكيد الحذف',
      'هل أنت متأكدة من حذف هذا المنشور؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('posts')
                .delete()
                .eq('id', postId);

              if (error) throw error;

              deletePost(postId);
              setAdminPosts(adminPosts.filter(p => p.id !== postId));
              Alert.alert('نجح', 'تم حذف المنشور بنجاح');
            } catch (error) {
              console.error('Error deleting post:', error);
              Alert.alert('خطأ', 'حدث خطأ أثناء حذف المنشور');
            }
          }
        }
      ]
    );
  };

  if (!isAdmin) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>جاري التحميل...</Text>
      </SafeAreaView>
    );
  }

  const renderPost = ({ item }: { item: any }) => (
    <View style={styles.postItem}>
      <View style={styles.postContent}>
        <Text style={styles.postTitle}>{item.title}</Text>
        <Text style={styles.postMeta}>
          {item.section} • {new Date(item.created_at).toLocaleDateString('ar-EG')}
        </Text>
      </View>
      <TouchableOpacity onPress={() => handleDeletePost(item.id)} style={styles.deleteButton}>
        <Trash2 size={20} color={colors.error} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowRight size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>لوحة التحكم</Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>إضافة منشور جديد</Text>

        <Input
          label="عنوان البوست"
          placeholder="أدخلي عنوان المنشور"
          value={title}
          onChangeText={setTitle}
        />

        <View style={styles.pickerContainer}>
          <Text style={styles.label}>القسم</Text>
          <View style={styles.picker}>
            <Picker
              selectedValue={section}
              onValueChange={setSection}
              style={styles.pickerStyle}
            >
              <Picker.Item label="المشاعر" value="feelings" />
              <Picker.Item label="فقه النساء" value="fiqh" />
              <Picker.Item label="الشعر" value="poems" />
              <Picker.Item label="القصص" value="stories" />
              <Picker.Item label="الصور" value="images" />
              <Picker.Item label="الفيديوهات" value="videos" />
            </Picker>
          </View>
        </View>

        <View style={styles.pickerContainer}>
          <Text style={styles.label}>نوع المحتوى</Text>
          <View style={styles.picker}>
            <Picker
              selectedValue={contentType}
              onValueChange={setContentType}
              style={styles.pickerStyle}
            >
              <Picker.Item label="نص" value="text" />
              <Picker.Item label="صورة" value="image" />
              <Picker.Item label="فيديو" value="video" />
              <Picker.Item label="شعر" value="poem" />
              <Picker.Item label="قصة" value="story" />
            </Picker>
          </View>
        </View>

        <Input
          label="المحتوى"
          placeholder="اكتبي المحتوى هنا"
          value={content}
          onChangeText={setContent}
          multiline
          style={styles.contentInput}
        />

        {(contentType === 'image' || contentType === 'video') && (
          <Button 
            title={fileUri ? 'تم اختيار الملف ✓' : 'اختيار ملف'}
            onPress={pickFile}
            variant="outline"
            style={styles.fileButton}
          />
        )}

        <Button 
          title="توليد محتوى AI"
          onPress={generateAIContent}
          variant="secondary"
          style={styles.aiButton}
        />

        <Button 
          title="إضافة المنشور"
          onPress={handleAddPost}
          style={styles.addButton}
        />

        <Text style={styles.sectionTitle}>المنشورات الحالية</Text>
        <FlatList
          data={adminPosts}
          renderItem={renderPost}
          keyExtractor={item => item.id}
          scrollEnabled={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>لا توجد منشورات</Text>
          }
        />
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
  sectionTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.xl,
    color: colors.text,
    marginBottom: 16,
    marginTop: 8,
    textAlign: 'right'
  },
  pickerContainer: {
    marginBottom: 16
  },
  label: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.sm,
    color: colors.text,
    marginBottom: 8,
    textAlign: 'right'
  },
  picker: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden'
  },
  pickerStyle: {
    textAlign: 'right',
    direction: 'rtl'
  },
  contentInput: {
    minHeight: 120
  },
  fileButton: {
    marginBottom: 8
  },
  aiButton: {
    marginBottom: 8
  },
  addButton: {
    marginBottom: 24
  },
  postItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border
  },
  postContent: {
    flex: 1,
    marginLeft: 12
  },
  postTitle: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.base,
    color: colors.text,
    textAlign: 'right',
    marginBottom: 4
  },
  postMeta: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    textAlign: 'right'
  },
  deleteButton: {
    padding: 8
  },
  loadingText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.base,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 40
  },
  emptyText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.base,
    color: colors.textMuted,
    textAlign: 'center',
    padding: 24
  }
});
