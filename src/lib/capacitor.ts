import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Keyboard } from '@capacitor/keyboard';
import { App as CapApp } from '@capacitor/app';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Share } from '@capacitor/share';

export const isNative = Capacitor.isNativePlatform();
export const platform = Capacitor.getPlatform();

export async function initCapacitor() {
  if (!isNative) return;

  try {
    // Hide splash screen after app mounts
    await SplashScreen.hide().catch(() => {});

    // Configure Status Bar
    await StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
    await StatusBar.setBackgroundColor({ color: '#0f172a' }).catch(() => {});
    await StatusBar.setOverlaysWebView({ overlay: false }).catch(() => {});

    // Configure Keyboard
    await Keyboard.setScroll({ isDisabled: false }).catch(() => {});
  } catch (err) {
    console.warn('Capacitor initialization notice:', err);
  }
}

export async function triggerHaptic(style: ImpactStyle = ImpactStyle.Light) {
  if (!isNative) return;
  try {
    await Haptics.impact({ style });
  } catch (e) {
    // Silent fallback
  }
}

export async function nativeShare(title: string, text: string, url?: string) {
  if (isNative) {
    try {
      await Share.share({
        title,
        text,
        url: url || window.location.href,
        dialogTitle: 'Share with Alpha AI',
      });
      return true;
    } catch (e) {
      console.warn('Native share cancelled or failed:', e);
    }
  }
  return false;
}

export function registerBackButtonHandler(onBack: () => boolean) {
  if (!isNative) return () => {};

  const listener = CapApp.addListener('backButton', ({ canGoBack }) => {
    const handled = onBack();
    if (!handled && !canGoBack) {
      CapApp.exitApp();
    }
  });

  return () => {
    listener.then(h => h.remove());
  };
}
