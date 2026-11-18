import { useEffect, useRef } from 'react';
import { BackHandler, Platform } from 'react-native';
import { useGlobalUi } from '../context/GlobalUiContext';

export const useDoubleBackToExit = (enabled = true) => {
  const { showSuccess } = useGlobalUi();
  const lastBackPressTime = useRef<number>(0);

  useEffect(() => {
    if (!enabled || Platform.OS !== 'android') return;

    const onBackPress = () => {
      const now = Date.now();
      if (lastBackPressTime.current && now - lastBackPressTime.current < 2000) {
        BackHandler.exitApp();
        return true;
      }

      lastBackPressTime.current = now;
      showSuccess('Press back again to exit Daily Track');
      return true;
    };

    const backHandlerSubscription = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress
    );

    return () => {
      backHandlerSubscription.remove();
    };
  }, [enabled]);
};

