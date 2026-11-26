import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Text } from 'react-native-paper';

const BRAND_NAME = 'DailyFlow';

export interface LaunchSplashProps {
  onFinish: () => void;
}

/**
 * Full-screen animated launch intro overlay shown on every cold start.
 * Displays the app icon with a spring entrance, types out "DailyFlow",
 * and fades smoothly into the main app.
 */
export const LaunchSplash: React.FC<LaunchSplashProps> = ({ onFinish }) => {
  const [typedLength, setTypedLength] = useState(0);
  const [cursorVisible, setCursorVisible] = useState(true);

  const containerOpacity = useRef(new Animated.Value(1)).current;
  const iconScale = useRef(new Animated.Value(0.6)).current;
  const iconOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineTranslateY = useRef(new Animated.Value(10)).current;
  const finishedRef = useRef(false);

  const dismiss = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    Animated.timing(containerOpacity, {
      toValue: 0,
      duration: 320,
      useNativeDriver: true,
    }).start(() => {
      onFinish();
    });
  };

  useEffect(() => {
    // 1. Icon spring + fade entrance
    Animated.parallel([
      Animated.spring(iconScale, {
        toValue: 1,
        friction: 6,
        tension: 70,
        useNativeDriver: true,
      }),
      Animated.timing(iconOpacity, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Typewriter effect for "DailyFlow"
    let index = 0;
    const typeTimer = setInterval(() => {
      index += 1;
      setTypedLength(index);
      if (index >= BRAND_NAME.length) {
        clearInterval(typeTimer);
        Animated.parallel([
          Animated.timing(taglineOpacity, {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
          }),
          Animated.timing(taglineTranslateY, {
            toValue: 0,
            duration: 350,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }, 80);

    // 3. Subtle blinking cursor
    const cursorTimer = setInterval(() => {
      setCursorVisible((v) => !v);
    }, 320);

    // 4. Auto-enter app after intro
    const exitTimer = setTimeout(dismiss, 1850);

    return () => {
      clearInterval(typeTimer);
      clearInterval(cursorTimer);
      clearTimeout(exitTimer);
    };
  }, []);

  return (
    <TouchableWithoutFeedback onPress={dismiss}>
      <Animated.View style={[styles.overlay, { opacity: containerOpacity }]}>
        <View style={styles.glowOuter} />
        <View style={styles.glowInner} />

        <Animated.View
          style={[
            styles.iconFrame,
            {
              opacity: iconOpacity,
              transform: [{ scale: iconScale }],
            },
          ]}
        >
          <Image
            source={require('../../../assets/icon.png')}
            style={styles.iconImage}
            resizeMode="cover"
          />
        </Animated.View>

        <View style={styles.brandRow}>
          <Text style={styles.brandText}>
            {BRAND_NAME.slice(0, typedLength)}
            <Text style={[styles.cursor, { opacity: cursorVisible ? 1 : 0 }]}>
              |
            </Text>
          </Text>
        </View>

        <Animated.Text
          style={[
            styles.tagline,
            {
              opacity: taglineOpacity,
              transform: [{ translateY: taglineTranslateY }],
            },
          ]}
        >
          Health • Mobility • Finance
        </Animated.Text>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 9999,
    backgroundColor: '#1E1B4B',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  glowOuter: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(129, 140, 248, 0.12)',
  },
  glowInner: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: 'rgba(99, 102, 241, 0.18)',
  },
  iconFrame: {
    width: 96,
    height: 96,
    borderRadius: 26,
    overflow: 'hidden',
    backgroundColor: '#312E81',
    borderWidth: 1.5,
    borderColor: 'rgba(199, 210, 254, 0.35)',
    marginBottom: 22,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
  },
  iconImage: {
    width: '100%',
    height: '100%',
  },
  brandRow: {
    minHeight: 44,
    justifyContent: 'center',
  },
  brandText: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.6,
  },
  cursor: {
    color: '#818CF8',
    fontWeight: '400',
  },
  tagline: {
    marginTop: 8,
    fontSize: 13.5,
    fontWeight: '600',
    letterSpacing: 1.2,
    color: '#C7D2FE',
    textTransform: 'uppercase',
  },
});
