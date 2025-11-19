import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import { ArrowRight } from 'lucide-react-native';
import { addDays, format, differenceInDays, differenceInWeeks } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Input } from '../src/components/Input';
import { Button } from '../src/components/Button';
import { colors } from '../src/theme/colors';
import { typography } from '../src/theme/typography';
import { useStore } from '../src/store/useStore';

export default function HealthScreen() {
  const router = useRouter();
  const { healthData, updateHealthData } = useStore();
  const [activeTab, setActiveTab] = useState<'period' | 'pregnancy' | 'feeding'>('period');
  const [lastPeriod, setLastPeriod] = useState(healthData.lastPeriodDate || '');
  const [cycleLength, setCycleLength] = useState(healthData.cycleLength.toString());
  const [pregnancyStart, setPregnancyStart] = useState(healthData.pregnancyStartDate || '');

  const calculateNextPeriod = () => {
    if (!lastPeriod) return null;
    const lastDate = new Date(lastPeriod);
    const nextDate = addDays(lastDate, parseInt(cycleLength) || 28);
    return format(nextDate, 'dd MMMM yyyy', { locale: ar });
  };

  const calculateOvulation = () => {
    if (!lastPeriod) return null;
    const lastDate = new Date(lastPeriod);
    const ovulationStart = addDays(lastDate, (parseInt(cycleLength) || 28) - 14 - 2);
    const ovulationEnd = addDays(lastDate, (parseInt(cycleLength) || 28) - 14 + 2);
    return `${format(ovulationStart, 'dd/MM', { locale: ar })} - ${format(ovulationEnd, 'dd/MM', { locale: ar })}`;
  };

  const calculatePregnancyWeeks = () => {
    if (!pregnancyStart) return 0;
    const startDate = new Date(pregnancyStart);
    const today = new Date();
    return differenceInWeeks(today, startDate);
  };

  const handleSavePeriodData = () => {
    updateHealthData({
      lastPeriodDate: lastPeriod,
      cycleLength: parseInt(cycleLength) || 28
    });
  };

  const handleSavePregnancyData = () => {
    updateHealthData({
      pregnancyStartDate: pregnancyStart
    });
  };

  const handleFeedingRecord = () => {
    const now = new Date().toISOString();
    updateHealthData({
      lastFeedingTime: now,
      feedingCount: healthData.feedingCount + 1
    });
  };

  const getTimeSinceLastFeeding = () => {
    if (!healthData.lastFeedingTime) return 'لم يتم التسجيل بعد';
    const lastTime = new Date(healthData.lastFeedingTime);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - lastTime.getTime()) / 60000);
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return `${hours} ساعة و ${minutes} دقيقة`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowRight size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>الصحة والمتابعة</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'period' && styles.activeTab]}
          onPress={() => setActiveTab('period')}
        >
          <Text style={[styles.tabText, activeTab === 'period' && styles.activeTabText]}>
            الدورة الشهرية
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'pregnancy' && styles.activeTab]}
          onPress={() => setActiveTab('pregnancy')}
        >
          <Text style={[styles.tabText, activeTab === 'pregnancy' && styles.activeTabText]}>
            الحمل
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'feeding' && styles.activeTab]}
          onPress={() => setActiveTab('feeding')}
        >
          <Text style={[styles.tabText, activeTab === 'feeding' && styles.activeTabText]}>
            الرضاعة
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'period' && (
          <View>
            <Input
              label="تاريخ آخر دورة"
              placeholder="YYYY-MM-DD"
              value={lastPeriod}
              onChangeText={setLastPeriod}
            />
            <Input
              label="طول الدورة (بالأيام)"
              placeholder="28"
              value={cycleLength}
              onChangeText={setCycleLength}
              keyboardType="numeric"
            />
            <Button 
              title="حفظ البيانات" 
              onPress={handleSavePeriodData}
              style={styles.saveButton}
            />

            {lastPeriod && (
              <View style={styles.resultsCard}>
                <Text style={styles.resultTitle}>التوقعات</Text>
                <View style={styles.resultRow}>
                  <Text style={styles.resultValue}>{calculateNextPeriod()}</Text>
                  <Text style={styles.resultLabel}>الدورة القادمة المتوقعة:</Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={styles.resultValue}>{calculateOvulation()}</Text>
                  <Text style={styles.resultLabel}>نافذة الإباضة:</Text>
                </View>
              </View>
            )}
          </View>
        )}

        {activeTab === 'pregnancy' && (
          <View>
            <Input
              label="تاريخ بداية الحمل (آخر دورة)"
              placeholder="YYYY-MM-DD"
              value={pregnancyStart}
              onChangeText={setPregnancyStart}
            />
            <Button 
              title="حفظ البيانات" 
              onPress={handleSavePregnancyData}
              style={styles.saveButton}
            />

            {pregnancyStart && (
              <View style={styles.resultsCard}>
                <Text style={styles.resultTitle}>حالة الحمل</Text>
                <View style={styles.weekContainer}>
                  <Text style={styles.weekNumber}>{calculatePregnancyWeeks()}</Text>
                  <Text style={styles.weekLabel}>أسبوع من الحمل</Text>
                </View>
              </View>
            )}
          </View>
        )}

        {activeTab === 'feeding' && (
          <View>
            <Button 
              title="تسجيل رضعة جديدة" 
              onPress={handleFeedingRecord}
              style={styles.feedingButton}
            />

            <View style={styles.resultsCard}>
              <Text style={styles.resultTitle}>إحصائيات اليوم</Text>
              <View style={styles.resultRow}>
                <Text style={styles.resultValue}>{healthData.feedingCount}</Text>
                <Text style={styles.resultLabel}>عدد الرضعات:</Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultValue}>{getTimeSinceLastFeeding()}</Text>
                <Text style={styles.resultLabel}>منذ آخر رضعة:</Text>
              </View>
            </View>
          </View>
        )}
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
  tabs: {
    flexDirection: 'row-reverse',
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent'
  },
  activeTab: {
    borderBottomColor: colors.primary
  },
  tabText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.sm,
    color: colors.textMuted
  },
  activeTabText: {
    color: colors.primary,
    fontFamily: typography.fontFamily.bold
  },
  content: {
    flex: 1,
    padding: 16
  },
  saveButton: {
    marginBottom: 24
  },
  feedingButton: {
    marginBottom: 24
  },
  resultsCard: {
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border
  },
  resultTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.lg,
    color: colors.text,
    textAlign: 'right',
    marginBottom: 16
  },
  resultRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  resultLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.base,
    color: colors.text
  },
  resultValue: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.base,
    color: colors.primary
  },
  weekContainer: {
    alignItems: 'center',
    paddingVertical: 24
  },
  weekNumber: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize['4xl'],
    color: colors.primary,
    marginBottom: 8
  },
  weekLabel: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.lg,
    color: colors.text
  }
});
