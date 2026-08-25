import type { WidgetTaskHandlerProps } from 'react-native-android-widget';

import { renderWidgetForName } from './widgets/renderers';

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  switch (props.widgetAction) {
    case 'WIDGET_ADDED':
    case 'WIDGET_UPDATE':
    case 'WIDGET_RESIZED': {
      const widgetInfo = props.widgetInfo;
      const rendered = await renderWidgetForName(widgetInfo.widgetName, widgetInfo);
      props.renderWidget(rendered);
      break;
    }
    case 'WIDGET_DELETED': {
      break;
    }
    case 'WIDGET_CLICK': {
      break;
    }
    default:
      break;
  }
}
