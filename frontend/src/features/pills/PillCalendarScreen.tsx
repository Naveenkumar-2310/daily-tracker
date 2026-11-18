import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { AppCard } from '../../components/common/AppCard';
import { AppButton } from '../../components/common/AppButton';
import { ApiService } from '../../services/api';
import { useGlobalUi } from '../../context/GlobalUiContext';
import { RootNavigationProp } from '../../navigation/types';

export const PillCalendarScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp>();
  const theme = useTheme();
  const { showLoader, hideLoader, showError, showSuccess } = useGlobalUi();

  const [currentMonth, setCurrentMonth] = useState('2026-11');
  const [calendarData, setCalendarData] = useState<Record<string, any>>({});
  const [selectedDay, setSelectedDay] = useState(new Date().toISOString().slice(0, 10));

  const loadMonthData = async (month: string, silent = false) => {
    if (!silent) showLoader('Loading calendar matrix...');
    try {
      const data = await ApiService.getCalendarMonth(month);
      setCalendarData(data);
    } catch (e: any) {
      showError(e.message || 'Failed to fetch calendar');
    } finally {
      if (!silent) hideLoader();
    }
  };

  useEffect(() => {
    loadMonthData(currentMonth);
  }, [currentMonth]);

  const daysInMonth = 30; // November
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => {
    const dayNum = String(i + 1).padStart(2, '0');
    return `${currentMonth}-${dayNum}`;
  });

  const selectedDayInfo = calendarData[selectedDay];
  const isTaken = selectedDayInfo?.allTaken;

  const handleToggleDay = async () => {
    const meds = await ApiService.getMedicines();
    if (meds.length === 0) {
      showError('Please configure at least one prescription in the Directory first.');
      return;
    }

    const nextStatus = isTaken ? 'MISSED' : 'TAKEN';
    showLoader(nextStatus === 'TAKEN' ? 'Recording dose...' : 'Updating record...');
    try {
      await ApiService.markPill(meds[0].id, selectedDay, nextStatus);
      await loadMonthData(currentMonth, true);
      showSuccess(`Date ${selectedDay} updated to ${nextStatus}!`);
    } catch (e: any) {
      showError(e.message || 'Failed to update date');
    } finally {
      hideLoader();
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Clean Month Header without duplicate inside back button */}
      <View style={styles.topBar}>
        <Text variant="headlineSmall" style={styles.monthTitle}>
          November 2026
        </Text>
        <Text variant="bodySmall" style={styles.monthSubtitle}>
          Tap any date below to inspect or record doses
        </Text>
      </View>

      <AppCard title="Monthly Adherence Grid" subtitle="🟢 Taken  •  🔴 Missed  •  ⚪ Scheduled">
        {/* Calendar Grid */}
        <View style={styles.grid}>
          {daysArray.map((dateStr) => {
            const dayNum = parseInt(dateStr.slice(-2), 10);
            const dayRecord = calendarData[dateStr];
            const taken = dayRecord?.allTaken;
            const hasLog = Boolean(dayRecord && dayRecord.logs?.length > 0);
            const isSelected = selectedDay === dateStr;

            return (
              <TouchableOpacity
                key={dateStr}
                style={[
                  styles.dayCell,
                  isSelected && styles.selectedCell,
                  taken && styles.takenCell,
                  hasLog && !taken && styles.missedCell,
                ]}
                onPress={() => setSelectedDay(dateStr)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.dayText,
                    taken && styles.takenDayText,
                    hasLog && !taken && styles.missedDayText,
                    isSelected && styles.selectedDayText,
                  ]}
                >
                  {dayNum}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </AppCard>

      {/* Selected Day Status Card */}
      <AppCard
        title={`Log for ${selectedDay}`}
        subtitle={isTaken ? '✓ Doses completed on this day' : 'Pending or skipped'}
        style={{ marginTop: 14 }}
      >
        <Text style={styles.infoText}>
          {isTaken
            ? 'Adherence verified. You fulfilled your scheduled medication intake.'
            : 'Did you take your tablets on this date? Tap below to record retroactively.'}
        </Text>
        <AppButton
          mode={isTaken ? 'outlined' : 'contained'}
          icon={isTaken ? 'close' : 'check'}
          onPress={handleToggleDay}
          style={{ marginTop: 12 }}
        >
          {isTaken ? 'Mark as Missed' : 'Mark as Taken on this Date'}
        </AppButton>
      </AppCard>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 18,
    paddingBottom: 40,
  },
  topBar: {
    marginBottom: 14,
  },
  monthTitle: {
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  monthSubtitle: {
    color: '#64748B',
    marginTop: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-start',
    marginTop: 10,
  },
  dayCell: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCell: {
    borderWidth: 2,
    borderColor: '#4F46E5',
  },
  takenCell: {
    backgroundColor: '#059669',
  },
  missedCell: {
    backgroundColor: '#E11D48',
  },
  dayText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  takenDayText: {
    color: '#FFFFFF',
  },
  missedDayText: {
    color: '#FFFFFF',
  },
  selectedDayText: {
    fontWeight: '900',
  },
  infoText: {
    color: '#64748B',
    fontSize: 13,
    lineHeight: 18,
  },
});
