import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';
import type { WidgetInfo } from 'react-native-android-widget';

import { formatRelativeDay } from '@/utils/date';
import { formatMinor } from './format';
import type { WidgetData } from './data';
import type { Palette } from './palette';

export function RenewalsWidget({
  data,
  palette,
}: {
  data: WidgetData;
  palette: Palette;
  widgetInfo: WidgetInfo;
}) {
  const { items, commitmentMinor } = data.renewals;
  const now = data.now;

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
        padding: 0,
      }}>
      <FlexWidget
        clickAction="OPEN_URI"
        clickActionData={{ uri: 'lifeos://subscriptions' }}
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}>
        <TextWidget
          text="COMING UP"
          style={{
            fontSize: 10,
            color: palette.muted,
            fontFamily: 'IBMPlexMono_400Regular',
          }}
        />
        <FlexWidget style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TextWidget
            text={formatMinor(commitmentMinor)}
            style={{
              fontSize: 14,
              color: palette.ink,
              fontFamily: 'Fraunces_600SemiBold',
              fontWeight: '600',
            }}
          />
          <TextWidget
            text="/MO"
            style={{
              fontSize: 10,
              color: palette.muted,
              fontFamily: 'IBMPlexMono_400Regular',
            }}
          />
        </FlexWidget>
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
            text="No upcoming renewals"
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
            <React.Fragment key={String(item.id)}>
              <FlexWidget
                clickAction="OPEN_URI"
                clickActionData={{ uri: `lifeos://subscription/${item.id}` }}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                }}>
                <FlexWidget style={{ flexDirection: 'column', flex: 1, paddingRight: 12 }}>
                  <TextWidget
                    text={item.name}
                    truncate="END"
                    maxLines={1}
                    style={{
                      fontSize: 14,
                      color: palette.ink,
                      fontFamily: 'Figtree_600SemiBold',
                      fontWeight: '600',
                    }}
                  />
                  <TextWidget
                    text={formatRelativeDay(item.renewalDate, now).toUpperCase()}
                    style={{
                      fontSize: 10,
                      color: palette.muted,
                      fontFamily: 'IBMPlexMono_400Regular',
                    }}
                  />
                </FlexWidget>
                <TextWidget
                  text={formatMinor(item.costMinor)}
                  style={{
                    fontSize: 14,
                    color: palette.ink,
                    fontFamily: 'Fraunces_600SemiBold',
                    fontWeight: '600',
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
