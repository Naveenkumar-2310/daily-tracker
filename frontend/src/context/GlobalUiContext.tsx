import React, { createContext, useContext, useState, ReactNode } from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import { ActivityIndicator, Text, Snackbar, Portal, Dialog, Button, useTheme } from 'react-native-paper';

interface GlobalUiContextType {
  showLoader: (message?: string) => void;
  hideLoader: () => void;
  showError: (message: string, title?: string) => void;
  showSuccess: (message: string) => void;
}

const GlobalUiContext = createContext<GlobalUiContextType | undefined>(undefined);

export const GlobalUiProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const theme = useTheme();

  // Loader state
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Processing...');

  // Error state
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorTitle, setErrorTitle] = useState('Error');
  const [errorMessage, setErrorMessage] = useState('');

  // Toast / Success state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showLoader = (message = 'Processing...') => {
    setLoadingMessage(message);
    setLoading(true);
  };

  const hideLoader = () => {
    setLoading(false);
  };

  const showError = (message: string, title = 'Notice') => {
    setErrorMessage(message);
    setErrorTitle(title);
    setErrorVisible(true);
  };

  const showSuccess = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
  };

  return (
    <GlobalUiContext.Provider value={{ showLoader, hideLoader, showError, showSuccess }}>
      {children}

      {/* Global Luxury Spinner Modal */}
      <Modal visible={loading} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.loaderCard}>
            <ActivityIndicator size="large" color="#6366F1" style={styles.spinner} />
            <Text variant="titleSmall" style={styles.loaderText}>
              {loadingMessage}
            </Text>
          </View>
        </View>
      </Modal>

      {/* Global Error / Alert Dialog */}
      <Portal>
        <Dialog
          visible={errorVisible}
          onDismiss={() => setErrorVisible(false)}
          style={styles.dialog}
        >
          <Dialog.Title style={styles.dialogTitle}>{errorTitle}</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={styles.dialogContent}>
              {errorMessage}
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              mode="contained"
              onPress={() => setErrorVisible(false)}
              style={styles.dialogBtn}
            >
              Dismiss
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Global Success Notification */}
      <Snackbar
        visible={toastVisible}
        onDismiss={() => setToastVisible(false)}
        duration={3000}
        style={styles.snackbar}
      >
        <Text style={styles.snackbarText}>✓  {toastMessage}</Text>
      </Snackbar>
    </GlobalUiContext.Provider>
  );
};

export const useGlobalUi = (): GlobalUiContextType => {
  const context = useContext(GlobalUiContext);
  if (!context) {
    throw new Error('useGlobalUi must be used within a GlobalUiProvider');
  }
  return context;
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderCard: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 24,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    minWidth: 200,
  },
  spinner: {
    marginBottom: 14,
  },
  loaderText: {
    color: '#1E293B',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  dialog: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },
  dialogTitle: {
    color: '#0F172A',
    fontWeight: '700',
  },
  dialogContent: {
    color: '#475569',
    lineHeight: 20,
  },
  dialogBtn: {
    backgroundColor: '#4F46E5',
    borderRadius: 8,
  },
  snackbar: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    marginBottom: 16,
  },
  snackbarText: {
    color: '#F8FAFC',
    fontWeight: '600',
  },
});

