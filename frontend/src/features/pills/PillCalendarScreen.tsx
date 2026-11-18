import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { AppCard } from '../../components/common/AppCard';
import { AppButton } from '../../components/common/AppButton';
import { ApiService } from '../../services/api';
import { useGlobalUi } from '../../context/GlobalUiContext';
import { RootNavigationProp } from '../../navigation/types';

export const PillCalendarScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp>();
  const theme = useTheme();
  const { showLoader, hideLoader, showError, showSuccess } = useGlobalUi();

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const currentMonthStr = todayStr.slice(0, 7);
  const [currentMonth, setCurrentMonth] = useState(currentMonthStr);
  const [calendarData, setCalendarData] = useState<Record<string, any>>({});
  const [selectedDay, setSelectedDay] = useState(todayStr);

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

  const [yearNum, monthNum] = currentMonth.split('-').map(Number);
  const daysInMonth = new Date(yearNum, monthNum, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => {
    const dayNum = String(i + 1).padStart(2, '0');
    return `${currentMonth}-${dayNum}`;
  });

  const selectedDayInfo = calendarData[selectedDay];
  const isTaken = selectedDayInfo?.allTaken;

  const isFuture = selectedDay > todayStr;
  const isEditable = !isFuture;

  const handleToggleDay = async () => {
    if (isFuture) {
      showError('Medical Precaution: Cannot record medication intake for future dates.');
      return;
    }

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

  // Month title format: e.g. "November 2026"
  const monthTitle = new Date(yearNum, monthNum - 1, 1).toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Month Header */}
      <View style={styles.topBar}>
        <Text variant="headlineSmall" style={styles.monthTitle}>
          {monthTitle}
        </Text>
        <Text variant="bodySmall" style={styles.monthSubtitle}>
          Medical Intake Matrix (Tap any past or current date to log reports)
        </Text>
      </View>

      <AppCard
        title="Monthly Adherence Grid"
        subtitle="🟢 Taken  •  🔴 Missed  •  ⚪ Scheduled  •  🔒 Future (Locked)"
      >
        {/* Calendar Grid */}
        <View style={styles.grid}>
          {daysArray.map((dateStr) => {
            const dayNum = parseInt(dateStr.slice(-2), 10);
            const dayRecord = calendarData[dateStr];
            const taken = dayRecord?.allTaken;
            const hasLog = Boolean(dayRecord && dayRecord.logs?.length > 0);
            const isSelected = selectedDay === dateStr;
            const cellIsToday = dateStr === todayStr;
            const cellIsFuture = dateStr > todayStr;

            return (
              <TouchableOpacity
                key={dateStr}
                style={[
                  styles.dayCell,
                  cellIsToday && styles.todayCell,
                  isSelected && styles.selectedCell,
                  taken && styles.takenCell,
                  hasLog && !taken && styles.missedCell,
                  cellIsFuture && styles.futureCell,
                ]}
                onPress={() => setSelectedDay(dateStr)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.dayText,
                    cellIsToday && styles.todayDayText,
                    taken && styles.takenDayText,
                    hasLog && !taken && styles.missedDayText,
                    isSelected && styles.selectedDayText,
                    cellIsFuture && styles.futureDayText,
                  ]}
                >
                  {dayNum}
                </Text>
                {cellIsFuture && (
                  <View style={styles.cellLockBadge}>
                    <MaterialCommunityIcons name="lock" size={9} color="#94A3B8" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </AppCard>

      {/* Selected Day Status Card */}
      <AppCard
        title={`Log for ${selectedDay}`}
        subtitle={
          isFuture
            ? '🔒 Future Date (Locked)'
            : selectedDay === todayStr
            ? '⚡ Today (Active Intake Window)'
            : isTaken
            ? '✓ Taken (Adherence Logged)'
            : '🕒 Past Date Report'
        }
        style={{ marginTop: 14 }}
      >
        {isFuture ? (
          <View style={styles.precautionBanner}>
            <MaterialCommunityIcons name="shield-alert-outline" size={22} color="#D97706" />
            <Text style={styles.precautionText}>
              <Text style={{ fontWeight: '700', color: '#B45309' }}>Medical Precaution: </Text>
              Medication intake cannot be logged for future dates to prevent safety hazards, accidental double-dosing, and distorted adherence metrics.
            </Text>
          </View>
        ) : (
          <Text style={styles.infoText}>
            {isTaken
              ? `Adherence verified. You recorded taking your medication on ${selectedDay}.`
              : selectedDay === todayStr
              ? 'Did you take your tablets today? Tap below to record your intake.'
              : `Did you take your tablets on ${selectedDay}? Tap below to update your adherence report.`}
          </Text>
        )}

        {isEditable ? (
          <AppButton
            mode={isTaken ? 'outlined' : 'contained'}
            icon={isTaken ? 'close' : 'check'}
            onPress={handleToggleDay}
            style={{ marginTop: 14 }}
          >
            {isTaken ? 'Mark as Missed' : 'Mark as Taken on this Date'}
          </AppButton>
        ) : (
          <AppButton
            disabled
            mode="outlined"
            icon="lock"
            style={{ marginTop: 14, opacity: 0.6, borderColor: '#CBD5E1' }}
          >
            Intake Disabled (Future Date)
          </AppButton>
        )}
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
    fontSize: 13,
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
    position: 'relative',
  },
  todayCell: {
    borderWidth: 2,
    borderColor: '#4F46E5',
  },
  selectedCell: {
    borderWidth: 2.5,
    borderColor: '#0F172A',
    backgroundColor: '#EEF2FF',
  },
  takenCell: {
    backgroundColor: '#059669',
  },
  missedCell: {
    backgroundColor: '#E11D48',
  },
  futureCell: {
    backgroundColor: '#F8FAFC',
    opacity: 0.5,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pastLockedCell: {
    backgroundColor: '#F1F5F9',
    opacity: 0.65,
  },
  dayText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  todayDayText: {
    color: '#4F46E5',
    fontWeight: '800',
  },
  takenDayText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  missedDayText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  selectedDayText: {
    fontWeight: '900',
    color: '#0F172A',
  },
  futureDayText: {
    color: '#94A3B8',
  },
  pastLockedDayText: {
    color: '#94A3B8',
  },
  cellLockBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
  },
  infoText: {
    color: '#475569',
    fontSize: 13,
    lineHeight: 19,
  },
  precautionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    padding: 12,
    borderRadius: 10,
    gap: 10,
  },
  precautionText: {
    flex: 1,
    color: '#92400E',
    fontSize: 12,
    lineHeight: 18,
  },
  precautionBannerPast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    borderRadius: 10,
    gap: 10,
  },
  precautionTextPast: {
    flex: 1,
    color: '#475569',
    fontSize: 12,
    lineHeight: 18,
  },
});
