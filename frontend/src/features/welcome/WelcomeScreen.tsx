import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  ScrollView,
  Animated,
  Platform,
} from 'react-native';
import { Text, Surface } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { ResponsiveContainer } from '../../components/common/ResponsiveContainer';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PillarFeature {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  icon: any;
  accentColor: string;
  secondaryColor: string;
  tags: string[];
}

const PILLARS: PillarFeature[] = [
  {
    id: 'finance',
    badge: 'NEW: FINANCE & EXPENSES',
    title: 'Smart Ledger & Bank Passbook',
    subtitle: 'Wealth & Cash Flow in Flow',
    description:
      'Track every rupee with a real-time Bank Passbook ledger, live running balance, Cr/Dr badges, 8 smart multi-sort criteria, and 1-click CSV statement export.',
    icon: 'wallet-outline',
    accentColor: '#10B981',
    secondaryColor: '#059669',
    tags: ['Bank Passbook', 'Running Balance', 'Budget Bars', 'CSV Export'],
  },
  {
    id: 'health',
    badge: 'HEALTH & PRESCRIPTIONS',
    title: 'Pill Reminders & Adherence',
    subtitle: 'Timely Care for Loved Ones',
    description:
      'Never miss critical medication doses. Scheduled alarms with loud chimes, dosage logging, and full monthly adherence calendar views.',
    icon: 'pill',
    accentColor: '#8B5CF6',
    secondaryColor: '#6D28D9',
    tags: ['Loud Alarms', 'Adherence Calendar', 'Medicine Master', 'Offline Sync'],
  },
  {
    id: 'mobility',
    badge: 'MOBILITY & MILEAGE',
    title: 'Fuel Tracking & Auto-Sync',
    subtitle: 'Vehicle Efficiency on Autopilot',
    description:
      'Monitor vehicle fuel refills, track km/L efficiency, scan odometers with camera AI, and auto-sync fuel costs directly into your expense ledger.',
    icon: 'gas-station-outline',
    accentColor: '#F59E0B',
    secondaryColor: '#D97706',
    tags: ['Camera OCR Scan', 'Auto Expense Sync', 'Mileage Analytics', 'Multi-Vehicle'],
  },
];

export const ONBOARDING_STORAGE_KEY = '@daily_flow_onboarding_completed_v1';

export const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Gentle breathing glow on the app logo
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.06,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  const handleCompleteOnboarding = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    } catch (err) {
      console.warn('Could not persist onboarding state:', err);
    }
    navigation.replace('MainTabs');
  };

  const handleNextSlide = () => {
    if (activeIndex < PILLARS.length - 1) {
      animateSlideChange(activeIndex + 1);
    } else {
      handleCompleteOnboarding();
    }
  };

  const animateSlideChange = (newIndex: number) => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.2,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
    setActiveIndex(newIndex);
  };

  const currentFeature = PILLARS[activeIndex];

  return (
    <View style={styles.outerContainer}>
      <ResponsiveContainer maxWidth={650}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Top Bar with Skip Action */}
          <View style={styles.topBar}>
            <View style={styles.versionPill}>
              <View style={styles.greenDot} />
              <Text style={styles.versionText}>Daily Flow v1.0</Text>
            </View>
            <TouchableOpacity
              onPress={handleCompleteOnboarding}
              hitSlop={{ top: 12, bottom: 12, left: 16, right: 16 }}
              activeOpacity={0.7}
            >
              <Text style={styles.skipText}>Skip to App ➔</Text>
            </TouchableOpacity>
          </View>

          {/* Hero Branding Section */}
          <View style={styles.heroSection}>
            <Animated.View
              style={[
                styles.logoHalo,
                {
                  transform: [{ scale: pulseAnim }],
                  shadowColor: currentFeature.accentColor,
                },
              ]}
            >
              <Image
                source={require('../../../assets/icon.png')}
                style={styles.logoImage}
                resizeMode="cover"
              />
            </Animated.View>

            <Text style={styles.brandTitle}>Daily Flow</Text>
            <Text style={styles.brandTagline}>
              Health • Wealth • Mobility in One Seamless Flow
            </Text>
          </View>

          {/* Interactive Feature Showcase Card */}
          <Animated.View style={[styles.featureCardWrapper, { opacity: fadeAnim }]}>
            <Surface style={[styles.featureCard, { borderColor: currentFeature.accentColor + '55' }]}>
              {/* Pillar Badge */}
              <View style={styles.cardHeaderRow}>
                <View
                  style={[
                    styles.pillarBadge,
                    { backgroundColor: currentFeature.accentColor + '22' },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={currentFeature.icon}
                    size={16}
                    color={currentFeature.accentColor}
                  />
                  <Text
                    style={[
                      styles.pillarBadgeText,
                      { color: currentFeature.accentColor },
                    ]}
                  >
                    {currentFeature.badge}
                  </Text>
                </View>
                <Text style={styles.stepCounterText}>
                  {activeIndex + 1} of {PILLARS.length}
                </Text>
              </View>

              {/* Title & Subtitle */}
              <Text style={styles.featureTitle}>{currentFeature.title}</Text>
              <Text style={[styles.featureSubtitle, { color: currentFeature.accentColor }]}>
                {currentFeature.subtitle}
              </Text>

              {/* Detailed Description */}
              <Text style={styles.featureDescription}>
                {currentFeature.description}
              </Text>

              {/* Feature Tags Grid */}
              <View style={styles.tagsContainer}>
                {currentFeature.tags.map((tag, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.tagChip,
                      { borderColor: currentFeature.accentColor + '40' },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="check-circle-outline"
                      size={13}
                      color={currentFeature.accentColor}
                    />
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </Surface>
          </Animated.View>

          {/* Carousel Step Indicators */}
          <View style={styles.dotsRow}>
            {PILLARS.map((item, idx) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => animateSlideChange(idx)}
                style={[
                  styles.dot,
                  activeIndex === idx
                    ? [styles.activeDot, { backgroundColor: item.accentColor }]
                    : styles.inactiveDot,
                ]}
              />
            ))}
          </View>

          {/* Trust Highlights */}
          <View style={styles.trustRow}>
            <View style={styles.trustItem}>
              <MaterialCommunityIcons name="shield-check" size={16} color="#10B981" />
              <Text style={styles.trustText}>100% Private</Text>
            </View>
            <View style={styles.trustDivider} />
            <View style={styles.trustItem}>
              <MaterialCommunityIcons name="lightning-bolt" size={16} color="#F59E0B" />
              <Text style={styles.trustText}>Offline Ready</Text>
            </View>
            <View style={styles.trustDivider} />
            <View style={styles.trustItem}>
              <MaterialCommunityIcons name="sync" size={16} color="#3B82F6" />
              <Text style={styles.trustText}>Cloud Synced</Text>
            </View>
          </View>

          {/* Bottom Primary Action Button */}
          <View style={styles.ctaContainer}>
            <TouchableOpacity
              style={[
                styles.ctaButton,
                { backgroundColor: currentFeature.accentColor },
              ]}
              onPress={handleNextSlide}
              activeOpacity={0.85}
            >
              <Text style={styles.ctaButtonText}>
                {activeIndex === PILLARS.length - 1
                  ? 'Get Started with Daily Flow'
                  : 'Next: Explore Features ➔'}
              </Text>
              <MaterialCommunityIcons
                name={activeIndex === PILLARS.length - 1 ? 'rocket-launch' : 'arrow-right'}
                size={20}
                color="#FFFFFF"
              />
            </TouchableOpacity>

            {activeIndex < PILLARS.length - 1 ? (
              <TouchableOpacity
                style={styles.directEnterBtn}
                onPress={handleCompleteOnboarding}
                activeOpacity={0.7}
              >
                <Text style={styles.directEnterText}>Jump straight to Dashboard</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </ScrollView>
      </ResponsiveContainer>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#0F172A', // Deep midnight slate
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 56 : 38,
    paddingBottom: 40,
    minHeight: '100%',
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  versionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 6,
  },
  greenDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  versionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.3,
  },
  skipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#818CF8',
    letterSpacing: 0.2,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoHalo: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: '#1E1B4B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#38BDF8',
    elevation: 12,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 26,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#F8FAFC',
    letterSpacing: -0.5,
    marginBottom: 6,
    textAlign: 'center',
  },
  brandTagline: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
    textAlign: 'center',
    paddingHorizontal: 10,
    lineHeight: 20,
  },
  featureCardWrapper: {
    marginBottom: 18,
  },
  featureCard: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1.5,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  pillarBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 6,
  },
  pillarBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  stepCounterText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  featureTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  featureSubtitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
  },
  featureDescription: {
    fontSize: 14,
    color: '#CBD5E1',
    lineHeight: 22,
    fontWeight: '500',
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    gap: 5,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    width: 26,
  },
  inactiveDot: {
    width: 8,
    backgroundColor: '#334155',
  },
  trustRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E293B88',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 22,
    gap: 12,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trustText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
  },
  trustDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#334155',
  },
  ctaContainer: {
    gap: 10,
    alignItems: 'center',
  },
  ctaButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 18,
    gap: 8,
    elevation: 8,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  directEnterBtn: {
    paddingVertical: 6,
  },
  directEnterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
});

