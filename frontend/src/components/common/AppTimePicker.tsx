import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import {
  Text,
  Portal,
  Dialog,
  Button,
  Chip,
  useTheme,
} from "react-native-paper";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

export interface AppTimePickerProps {
  label: string;
  value: string; // "HH:mm" (24-hour format, e.g. "21:30")
  onChange: (timeStr: string) => void;
  helperText?: string;
}

const HOURS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const MINUTES = [
  "00",
  "05",
  "10",
  "15",
  "20",
  "25",
  "30",
  "35",
  "40",
  "45",
  "50",
  "55",
];

export const AppTimePicker: React.FC<AppTimePickerProps> = ({
  label,
  value,
  onChange,
  helperText,
}) => {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);

  // Parse 24h string into 12h + AM/PM
  const parseTime = (timeStr: string) => {
    const [hStr, mStr] = (timeStr || "21:30").split(":");
    let h = parseInt(hStr, 10) || 9;
    const m = mStr ? mStr.padStart(2, "0") : "00";
    const period = h >= 12 ? "PM" : "AM";
    h = h % 12;
    if (h === 0) h = 12;
    return { hour: h, minute: m, period };
  };

  const parsed = parseTime(value);
  const [selectedHour, setSelectedHour] = useState(parsed.hour);
  const [selectedMinute, setSelectedMinute] = useState(parsed.minute);
  const [selectedPeriod, setSelectedPeriod] = useState<"AM" | "PM">(
    parsed.period as any,
  );

  const openModal = () => {
    const p = parseTime(value);
    setSelectedHour(p.hour);
    setSelectedMinute(p.minute);
    setSelectedPeriod(p.period as any);
    setVisible(true);
  };

  const handleConfirm = () => {
    let h24 = selectedHour;
    if (selectedPeriod === "PM" && h24 < 12) h24 += 12;
    if (selectedPeriod === "AM" && h24 === 12) h24 = 0;
    const hh = String(h24).padStart(2, "0");
    const mm = selectedMinute.padStart(2, "0");
    onChange(`${hh}:${mm}`);
    setVisible(false);
  };

  const applyPreset = (presetH24: string) => {
    onChange(presetH24);
    setVisible(false);
  };

  // Format display string in 12-hour Clock format
  const formatDisplay = (timeStr: string) => {
    const p = parseTime(timeStr);
    const hh = String(p.hour).padStart(2, "0");
    return `${hh}:${p.minute} ${p.period}`;
  };

  return (
    <View style={styles.container}>
      <Text variant="labelMedium" style={styles.label}>
        {label}
      </Text>

      <TouchableOpacity
        style={[
          styles.timeButton,
          { borderColor: "#E2E8F0", backgroundColor: "#FFFFFF" },
        ]}
        onPress={openModal}
        activeOpacity={0.8}
      >
        <View style={styles.buttonInner}>
          <MaterialCommunityIcons
            name="clock-time-four-outline"
            size={22}
            color="#4F46E5"
          />
          <Text variant="bodyLarge" style={styles.timeText}>
            {value ? formatDisplay(value) : "Select Time"}
          </Text>
        </View>
      </TouchableOpacity>

      {helperText && (
        <Text variant="bodySmall" style={styles.helperText}>
          {helperText}
        </Text>
      )}

      <Portal>
        <Dialog
          visible={visible}
          onDismiss={() => setVisible(false)}
          style={styles.dialog}
        >
          <Dialog.Title style={styles.dialogTitle}>
            Select Reminder Time
          </Dialog.Title>
          <Dialog.Content style={styles.dialogContent}>
            {/* Quick Presets */}
            <View style={styles.presetsRow}>
              <Chip
                compact
                onPress={() => applyPreset("08:00")}
                style={styles.presetChip}
                textStyle={styles.presetText}
              >
                Morning 8:00 AM
              </Chip>
              <Chip
                compact
                onPress={() => applyPreset("13:30")}
                style={styles.presetChip}
                textStyle={styles.presetText}
              >
                Afternoon 1:30 PM
              </Chip>
              <Chip
                compact
                onPress={() => applyPreset("21:30")}
                style={styles.presetChip}
                textStyle={styles.presetText}
              >
                Night 9:30 PM
              </Chip>
            </View>

            {/* AM / PM Toggle */}
            <View style={styles.periodRow}>
              <TouchableOpacity
                onPress={() => setSelectedPeriod("AM")}
                style={[
                  styles.periodBtn,
                  selectedPeriod === "AM" && styles.periodBtnActive,
                ]}
              >
                <Text
                  style={[
                    styles.periodText,
                    selectedPeriod === "AM" && styles.periodTextActive,
                  ]}
                >
                  AM
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setSelectedPeriod("PM")}
                style={[
                  styles.periodBtn,
                  selectedPeriod === "PM" && styles.periodBtnActive,
                ]}
              >
                <Text
                  style={[
                    styles.periodText,
                    selectedPeriod === "PM" && styles.periodTextActive,
                  ]}
                >
                  PM
                </Text>
              </TouchableOpacity>
            </View>

            {/* Hours Grid */}
            <Text style={styles.subLabel}>Hour:</Text>
            <View style={styles.numberGrid}>
              {HOURS.map((h) => {
                const isSelected = selectedHour === h;
                return (
                  <TouchableOpacity
                    key={h}
                    onPress={() => setSelectedHour(h)}
                    style={[
                      styles.numberCell,
                      isSelected && styles.numberCellActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.numberText,
                        isSelected && styles.numberTextActive,
                      ]}
                    >
                      {h}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Minutes Grid */}
            <Text style={[styles.subLabel, { marginTop: 12 }]}>Minute:</Text>
            <View style={styles.numberGrid}>
              {MINUTES.map((m) => {
                const isSelected = selectedMinute === m;
                return (
                  <TouchableOpacity
                    key={m}
                    onPress={() => setSelectedMinute(m)}
                    style={[
                      styles.numberCell,
                      isSelected && styles.numberCellActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.numberText,
                        isSelected && styles.numberTextActive,
                      ]}
                    >
                      {m}
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
            <Button
              onPress={handleConfirm}
              mode="contained"
              style={styles.confirmBtn}
            >
              Confirm ({selectedHour}:{selectedMinute} {selectedPeriod})
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
  timeButton: {
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
  timeText: {
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
  helperText: {
    color: "#64748B",
    marginTop: 4,
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
  },
  dialogContent: {
    paddingHorizontal: 16,
  },
  presetsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 12,
  },
  presetChip: {
    backgroundColor: "#F1F5F9",
  },
  presetText: {
    color: "#334155",
    fontSize: 11,
    fontWeight: "600",
  },
  periodRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  periodBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
  },
  periodBtnActive: {
    backgroundColor: "#4F46E5",
  },
  periodText: {
    fontWeight: "700",
    color: "#475569",
  },
  periodTextActive: {
    color: "#FFFFFF",
  },
  subLabel: {
    fontWeight: "700",
    color: "#0F172A",
    fontSize: 12,
    marginBottom: 6,
  },
  numberGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  numberCell: {
    width: 44,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
  },
  numberCellActive: {
    backgroundColor: "#4F46E5",
    borderColor: "#4F46E5",
  },
  numberText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1E293B",
  },
  numberTextActive: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  confirmBtn: {
    backgroundColor: "#4F46E5",
  },
});
