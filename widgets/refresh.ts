import { Platform } from 'react-native';

const WIDGET_NAMES = ['Spend', 'Renewals', 'Reminders', 'Glance'] as const;

export async function refreshAllWidgets(): Promise<void> {
  if (Platform.OS !== 'android') return;

  try {
    const { requestWidgetUpdate } = await import('react-native-android-widget');
    const { renderWidgetForName } = await import('./renderers');

    await Promise.all(
      WIDGET_NAMES.map((name) =>
        requestWidgetUpdate({
          widgetName: name,
          renderWidget: (widgetInfo) => renderWidgetForName(name, widgetInfo),
        }).catch(() => {})
      )
    );
  } catch {
    // Silently ignore — widgets are optional and headless context may not be ready
  }
}
