import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export class HapticService {
  // Hafif dokunmatik geri bildirim
  static light() {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }

  // Orta dokunmatik geri bildirim  
  static medium() {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }

  // Ağır dokunmatik geri bildirim
  static heavy() {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  }

  // Başarı titreşimi
  static success() {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }

  // Uyarı titreşimi
  static warning() {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  }

  // Hata titreşimi
  static error() {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }

  // Seçim değişikliği titreşimi
  static selection() {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
  }
}

// Kullanım örnekleri:
// HapticService.light() - Buton tıklamaları için
// HapticService.success() - İşlem başarılı olduğunda
// HapticService.error() - Hata oluştuğunda
// HapticService.selection() - Liste öğeleri seçildiğinde
