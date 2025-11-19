import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Heart } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

interface HeaderProps {
  title: string;
  onHeartLongPress?: () => void;
  showHeart?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ title, onHeartLongPress, showHeart = false }) => {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      {showHeart && onHeartLongPress && (
        <TouchableOpacity onLongPress={onHeartLongPress} delayLongPress={2000}>
          <Heart size={24} color={colors.primary} fill={colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  title: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize['2xl'],
    color: colors.text
  }
});
