import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import {
  Text,
  Portal,
  Dialog,
  Button,
  useTheme,
  Chip,
  IconButton,
} from "react-native-paper";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

export interface AppDatePickerProps {
  label: string;
  value: string; // YYYY-MM-DD
  onChange: (dateStr: string) => void;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAYS_HEADER = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export const AppDatePicker: React.FC<AppDatePickerProps> = ({
  label,
  value,
  onChange,
}) => {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);

  // Parse initial selected date
  const parseDate = (dStr: string) => {
    const parts = (dStr || new Date().toISOString().slice(0, 10)).split("-");
    if (parts.length === 3) {
      return {
        year: parseInt(parts[0], 10),
        month: parseInt(parts[1], 10) - 1,
        day: parseInt(parts[2], 10),
      };
    }
    const today = new Date();
    return {
      year: today.getFullYear(),
      month: today.getMonth(),
      day: today.getDate(),
    };
  };

  const initial = parseDate(value);
  const [currentYear, setCurrentYear] = useState(initial.year);
  const [currentMonth, setCurrentMonth] = useState(initial.month);
  const [selectedDateStr, setSelectedDateStr] = useState(
    value || new Date().toISOString().slice(0, 10),
  );

  const openPicker = () => {
    const parsed = parseDate(value);
    setCurrentYear(parsed.year);
    setCurrentMonth(parsed.month);
    setSelectedDateStr(value || new Date().toISOString().slice(0, 10));
    setVisible(true);
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const mm = String(currentMonth + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    const dateStr = `${currentYear}-${mm}-${dd}`;
    setSelectedDateStr(dateStr);
    onChange(dateStr);
    setVisible(false);
  };

  const setQuickDate = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const dateStr = d.toISOString().slice(0, 10);
    setSelectedDateStr(dateStr);
    onChange(dateStr);
    setVisible(false);
  };

  // Calendar Grid Calculation
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday

  const calendarDays: Array<number | null> = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(d);
  }

  // Check if a day is currently selected
  const isSelected = (day: number) => {
    const mm = String(currentMonth + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    return selectedDateStr === `${currentYear}-${mm}-${dd}`;
  };

  const todayStr = new Date().toISOString().slice(0, 10);
  const isToday = (day: number) => {
    const mm = String(currentMonth + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    return todayStr === `${currentYear}-${mm}-${dd}`;
  };

  return (
    <View style={styles.container}>
      <Text variant="labelMedium" style={styles.label}>
        {label}
      </Text>
      <TouchableOpacity
        style={[
          styles.dateButton,
          { borderColor: "#E2E8F0", backgroundColor: "#FFFFFF" },
        ]}
        onPress={openPicker}
        activeOpacity={0.8}
      >
        <View style={styles.buttonInner}>
          <MaterialCommunityIcons
            name="calendar-month-outline"
            size={20}
            color="#4F46E5"
          />
          <Text variant="bodyLarge" style={styles.dateText}>
            {value || "Select Date"}
          </Text>
        </View>
      </TouchableOpacity>

      <Portal>
        <Dialog
          visible={visible}
          onDismiss={() => setVisible(false)}
          style={styles.dialog}
        >
          <Dialog.Title style={styles.dialogTitle}>Select Date</Dialog.Title>
          <Dialog.Content style={styles.dialogContent}>
            {/* Quick Chips */}
            <View style={styles.quickButtonsRow}>
              <Chip
                compact
                onPress={() => setQuickDate(0)}
                style={styles.quickChip}
                textStyle={styles.quickChipText}
              >
                Today
              </Chip>
              <Chip
                compact
                onPress={() => setQuickDate(-1)}
                style={styles.quickChip}
                textStyle={styles.quickChipText}
              >
                Yesterday
              </Chip>
              <Chip
                compact
                onPress={() => setQuickDate(-2)}
                style={styles.quickChip}
                textStyle={styles.quickChipText}
              >
                2 Days Ago
              </Chip>
            </View>

            {/* Month & Year Navigation Header */}
            <View style={styles.navRow}>
              <IconButton
                icon="chevron-left"
                size={22}
                iconColor="#0F172A"
                onPress={handlePrevMonth}
              />
              <Text variant="titleMedium" style={styles.monthTitle}>
                {MONTH_NAMES[currentMonth]} {currentYear}
              </Text>
              <IconButton
                icon="chevron-right"
                size={22}
                iconColor="#0F172A"
                onPress={handleNextMonth}
              />
            </View>

            {/* Days of week header */}
            <View style={styles.weekHeaderRow}>
              {DAYS_HEADER.map((d, idx) => (
                <Text key={idx} style={styles.weekDayHeader}>
                  {d}
                </Text>
              ))}
            </View>

            {/* Interactive Calendar Days Grid */}
            <View style={styles.grid}>
              {calendarDays.map((day, idx) => {
                if (day === null) {
                  return <View key={idx} style={styles.emptyCell} />;
                }
                const selected = isSelected(day);
                const today = isToday(day);
                return (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => handleSelectDay(day)}
                    style={[
                      styles.dayCell,
                      today && styles.todayCell,
                      selected && styles.selectedCell,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        today && styles.todayText,
                        selected && styles.selectedText,
                      ]}
                    >
                      {day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Dialog.Content>

          <Dialog.Actions>
            <Button onPress={() => setVisible(false)} textColor="#64748B">
              Cancel
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
    width: "100%",
  },
  label: {
    marginBottom: 6,
    color: "#0F172A",
    fontWeight: "700",
    fontSize: 13,
  },
  dateButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.2,
  },
  buttonInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dateText: {
    fontWeight: "700",
    color: "#0F172A",
  },
  chooseChip: {
    backgroundColor: "#EEF2FF",
    height: 26,
  },
  chooseChipText: {
    color: "#4F46E5",
    fontWeight: "700",
    fontSize: 11,
  },
  dialog: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingBottom: 4,
  },
  dialogTitle: {
    fontWeight: "800",
    color: "#0F172A",
    fontSize: 18,
    paddingBottom: 4,
  },
  dialogContent: {
    paddingHorizontal: 16,
  },
  quickButtonsRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 12,
  },
  quickChip: {
    backgroundColor: "#F1F5F9",
  },
  quickChipText: {
    color: "#334155",
    fontSize: 11,
    fontWeight: "600",
  },
  navRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  monthTitle: {
    fontWeight: "800",
    color: "#0F172A",
  },
  weekHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingBottom: 6,
  },
  weekDayHeader: {
    width: 38,
    textAlign: "center",
    fontWeight: "700",
    fontSize: 12,
    color: "#94A3B8",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  emptyCell: {
    width: "14.28%",
    height: 38,
  },
  dayCell: {
    width: "14.28%",
    height: 38,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 19,
    marginVertical: 2,
  },
  dayText: {
    fontSize: 14,
    color: "#1E293B",
    fontWeight: "600",
  },
  todayCell: {
    borderWidth: 1.5,
    borderColor: "#4F46E5",
  },
  todayText: {
    color: "#4F46E5",
    fontWeight: "800",
  },
  selectedCell: {
    backgroundColor: "#4F46E5",
  },
  selectedText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
});
