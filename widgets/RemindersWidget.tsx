import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';
import type { WidgetInfo } from 'react-native-android-widget';

import type { WidgetData } from './data';
import type { Palette } from './palette';

export function RemindersWidget({
  data,
  palette,
}: {
  data: WidgetData;
  palette: Palette;
  widgetInfo: WidgetInfo;
}) {
  const items = data.reminders.items;

  return (
    <FlexWidget
      style={{
        width: 'match_parent',
        height: 'match_parent',
        backgroundColor: palette.card,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: palette.border,
        flexDirection: 'column',
      }}>
      <FlexWidget
        clickAction="OPEN_URI"
        clickActionData={{ uri: 'lifeos://reminders' }}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}>
        <TextWidget
          text="NEXT REMINDERS"
          style={{
            fontSize: 10,
            color: palette.muted,
            fontFamily: 'IBMPlexMono_400Regular',
          }}
        />
      </FlexWidget>

      <FlexWidget style={{ height: 1, width: 'match_parent', backgroundColor: palette.rule }} />

      {items.length === 0 ? (
        <FlexWidget
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 16,
          }}>
          <TextWidget
            text="No LifeOS reminders yet"
            style={{
              fontSize: 12,
              color: palette.muted,
              fontFamily: 'Figtree_400Regular',
            }}
          />
        </FlexWidget>
      ) : (
        <>
          {items.map((item, idx) => (
            <React.Fragment key={String(item.task.id)}>
              <FlexWidget
                clickAction="OPEN_URI"
                clickActionData={{ uri: `lifeos://reminder/${item.task.id}` }}
                style={{
                  flexDirection: 'column',
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                }}>
                <TextWidget
                  text={item.task.title}
                  truncate="END"
                  maxLines={1}
                  style={{
                    fontSize: 14,
                    color: palette.ink,
                    fontFamily: 'Figtree_600SemiBold',
                    fontWeight: '600',
                  }}
                />
                <FlexWidget style={{ height: 2 }} />
                <TextWidget
                  text={`${item.task.listName} \u00B7 ${item.next.fireAtLabel}`.toUpperCase()}
                  truncate="END"
                  maxLines={1}
                  style={{
                    fontSize: 10,
                    color: palette.muted,
                    fontFamily: 'IBMPlexMono_400Regular',
                  }}
                />
              </FlexWidget>
              {idx < items.length - 1 ? (
                <FlexWidget style={{ height: 1, width: 'match_parent', backgroundColor: palette.rule }} />
              ) : null}
            </React.Fragment>
          ))}
        </>
      )}
    </FlexWidget>
  );
}
