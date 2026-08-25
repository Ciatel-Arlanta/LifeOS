import React from 'react';
import type { WidgetInfo } from 'react-native-android-widget';

import { loadWidgetData, type WidgetData } from './data';
import { paletteForTheme } from './palette';
import { GlanceWidget } from './GlanceWidget';
import { RemindersWidget } from './RemindersWidget';
import { RenewalsWidget } from './RenewalsWidget';
import { SpendWidget } from './SpendWidget';

export async function renderWidgetForName(widgetName: string, widgetInfo: WidgetInfo) {
  const data: WidgetData = await loadWidgetData();

  const light = paletteForTheme('light');
  const dark = paletteForTheme('dark');

  switch (widgetName) {
    case 'Spend':
      return {
        light: <SpendWidget data={data} palette={light} widgetInfo={widgetInfo} />,
        dark: <SpendWidget data={data} palette={dark} widgetInfo={widgetInfo} />,
      };
    case 'Renewals':
      return {
        light: <RenewalsWidget data={data} palette={light} widgetInfo={widgetInfo} />,
        dark: <RenewalsWidget data={data} palette={dark} widgetInfo={widgetInfo} />,
      };
    case 'Reminders':
      return {
        light: <RemindersWidget data={data} palette={light} widgetInfo={widgetInfo} />,
        dark: <RemindersWidget data={data} palette={dark} widgetInfo={widgetInfo} />,
      };
    case 'Glance':
      return {
        light: <GlanceWidget data={data} palette={light} widgetInfo={widgetInfo} />,
        dark: <GlanceWidget data={data} palette={dark} widgetInfo={widgetInfo} />,
      };
    default:
      return {
        light: <SpendWidget data={data} palette={light} widgetInfo={widgetInfo} />,
        dark: <SpendWidget data={data} palette={dark} widgetInfo={widgetInfo} />,
      };
  }
}
