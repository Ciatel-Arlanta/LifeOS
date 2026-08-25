import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';
import type { WidgetInfo } from 'react-native-android-widget';

import { formatMinor } from './format';
import type { WidgetData } from './data';
import type { Palette } from './palette';

export function SpendWidget({
  data,
  palette,
  widgetInfo,
}: {
  data: WidgetData;
  palette: Palette;
  widgetInfo: WidgetInfo;
}) {
  const { totalMinor, shares } = data.spend;
  const monthLabel = data.monthLabel;
  const isWide = widgetInfo.width / Math.max(widgetInfo.height, 1) > 2 || widgetInfo.width >= 220;
  const amount = formatMinor(totalMinor);

  const tapeBg = palette.track;

  const tape = (
    <FlexWidget
      style={{
        height: 8,
        width: 'match_parent',
        backgroundColor: tapeBg,
        borderRadius: 99,
      }}>
      <FlexWidget style={{ flexDirection: 'row', width: 'match_parent', height: 'match_parent' }}>
        {shares.length === 0 ? null : (
          <>
            {shares.map((share, idx) => (
              <FlexWidget
                key={String(share.categoryId)}
                style={{
                  flex: Math.max(share.percent, 4),
                  height: 'match_parent',
                  backgroundColor: palette.tape[idx % palette.tape.length] as `#${string}`,
                }}
              />
            ))}
          </>
        )}
      </FlexWidget>
    </FlexWidget>
  );

  if (isWide) {
    return (
      <FlexWidget
        clickAction="OPEN_URI"
        clickActionData={{ uri: 'lifeos://expenses' }}
        style={{
          width: 'match_parent',
          height: 'match_parent',
          backgroundColor: palette.card,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: palette.border,
          padding: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <FlexWidget style={{ flexDirection: 'column', flex: 1 }}>
          <TextWidget
            text={monthLabel}
            style={{
              fontSize: 10,
              color: palette.muted,
              fontFamily: 'IBMPlexMono_400Regular',
            }}
          />
          <TextWidget
            text={amount}
            style={{
              fontSize: 26,
              color: palette.ink,
              fontFamily: 'Fraunces_600SemiBold',
              fontWeight: '600',
            }}
          />
        </FlexWidget>
        <FlexWidget style={{ flexDirection: 'column', alignItems: 'flex-end', width: 130 }}>
          <FlexWidget style={{ width: 120 }}>{tape}</FlexWidget>
          <TextWidget
            text="SPENT SO FAR"
            style={{
              fontSize: 9,
              color: palette.muted,
              fontFamily: 'IBMPlexMono_400Regular',
              textAlign: 'right',
            }}
          />
        </FlexWidget>
      </FlexWidget>
    );
  }

  return (
    <FlexWidget
      clickAction="OPEN_URI"
      clickActionData={{ uri: 'lifeos://expenses' }}
      style={{
        width: 'match_parent',
        height: 'match_parent',
        backgroundColor: palette.card,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: palette.border,
        padding: 16,
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}>
      <FlexWidget style={{ flexDirection: 'column' }}>
        <TextWidget
          text={monthLabel}
          style={{
            fontSize: 10,
            color: palette.muted,
            fontFamily: 'IBMPlexMono_400Regular',
          }}
        />
        <FlexWidget style={{ height: 6 }} />
        <TextWidget
          text={amount}
          style={{
            fontSize: 32,
            color: palette.ink,
            fontFamily: 'Fraunces_600SemiBold',
            fontWeight: '600',
          }}
        />
        <FlexWidget style={{ height: 4 }} />
        <TextWidget
          text="Spent so far"
          style={{
            fontSize: 12,
            color: palette.muted,
            fontFamily: 'Figtree_400Regular',
          }}
        />
      </FlexWidget>
      <FlexWidget style={{ height: 12 }} />
      {tape}
    </FlexWidget>
  );
}
