import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';
import type { WidgetInfo } from 'react-native-android-widget';

import { formatRelativeDay } from '@/utils/date';
import { formatMinor } from './format';
import type { WidgetData } from './data';
import type { Palette } from './palette';

export function GlanceWidget({
  data,
  palette,
}: {
  data: WidgetData;
  palette: Palette;
  widgetInfo: WidgetInfo;
}) {
  const { totalMinor, shares } = data.spend;
  const monthLabel = data.monthLabel;
  const renewals = data.renewals.items.slice(0, 2);
  const reminders = data.reminders.items.slice(0, 2);

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
        padding: 16,
      }}>
      <FlexWidget
        clickAction="OPEN_URI"
        clickActionData={{ uri: 'lifeos://expenses' }}
        style={{ flexDirection: 'column' }}>
        <TextWidget
          text={monthLabel}
          style={{
            fontSize: 10,
            color: palette.muted,
            fontFamily: 'IBMPlexMono_400Regular',
          }}
        />
        <FlexWidget style={{ height: 2 }} />
        <TextWidget
          text={formatMinor(totalMinor)}
          style={{
            fontSize: 24,
            color: palette.ink,
            fontFamily: 'Fraunces_600SemiBold',
            fontWeight: '600',
          }}
        />
        <FlexWidget style={{ height: 8 }} />
        <FlexWidget
          style={{
            height: 6,
            width: 'match_parent',
            backgroundColor: palette.track,
            borderRadius: 99,
          }}>
          <FlexWidget style={{ flexDirection: 'row', width: 'match_parent', height: 'match_parent' }}>
            {shares.length === 0
              ? null
              : shares.map((share, idx) => (
                  <FlexWidget
                    key={String(share.categoryId)}
                    style={{
                      flex: Math.max(share.percent, 4),
                      height: 'match_parent',
                      backgroundColor: palette.tape[idx % palette.tape.length] as `#${string}`,
                    }}
                  />
                ))}
          </FlexWidget>
        </FlexWidget>
      </FlexWidget>

      <FlexWidget style={{ height: 12 }} />
      <FlexWidget style={{ height: 1, width: 'match_parent', backgroundColor: palette.rule }} />
      <FlexWidget style={{ height: 8 }} />

      <TextWidget
        text="COMING UP"
        style={{
          fontSize: 10,
          color: palette.muted,
          fontFamily: 'IBMPlexMono_400Regular',
        }}
      />
      <FlexWidget style={{ height: 6 }} />
      {renewals.length === 0 ? (
        <TextWidget
          text="No upcoming renewals"
          style={{
            fontSize: 11,
            color: palette.muted,
            fontFamily: 'Figtree_400Regular',
          }}
        />
      ) : (
        <>
          {renewals.map((item) => (
            <FlexWidget
              key={String(item.id)}
              clickAction="OPEN_URI"
              clickActionData={{ uri: `lifeos://subscription/${item.id}` }}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingVertical: 4,
              }}>
              <TextWidget
                text={`${item.name} \u2014 ${formatRelativeDay(item.renewalDate, data.now)}`.toUpperCase()}
                truncate="END"
                maxLines={1}
                style={{
                  fontSize: 11,
                  color: palette.ink,
                  fontFamily: 'Figtree_500Medium',
                }}
              />
              <TextWidget
                text={formatMinor(item.costMinor)}
                style={{
                  fontSize: 11,
                  color: palette.ink,
                  fontFamily: 'Fraunces_600SemiBold',
                  fontWeight: '600',
                }}
              />
            </FlexWidget>
          ))}
        </>
      )}

      <FlexWidget style={{ height: 8 }} />
      <FlexWidget style={{ height: 1, width: 'match_parent', backgroundColor: palette.rule }} />
      <FlexWidget style={{ height: 8 }} />

      <TextWidget
        text="REMINDERS"
        style={{
          fontSize: 10,
          color: palette.muted,
          fontFamily: 'IBMPlexMono_400Regular',
        }}
      />
      <FlexWidget style={{ height: 6 }} />
      {reminders.length === 0 ? (
        <TextWidget
          text="No reminders"
          style={{
            fontSize: 11,
            color: palette.muted,
            fontFamily: 'Figtree_400Regular',
          }}
        />
      ) : (
        <>
          {reminders.map((entry) => (
            <FlexWidget
              key={String(entry.task.id)}
              clickAction="OPEN_URI"
              clickActionData={{ uri: `lifeos://reminder/${entry.task.id}` }}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingVertical: 4,
              }}>
              <TextWidget
                text={entry.task.title}
                truncate="END"
                maxLines={1}
                style={{
                  fontSize: 11,
                  color: palette.ink,
                  fontFamily: 'Figtree_600SemiBold',
                  fontWeight: '600',
                }}
              />
              <TextWidget
                text={entry.next.fireAtLabel.toUpperCase()}
                style={{
                  fontSize: 10,
                  color: palette.muted,
                  fontFamily: 'IBMPlexMono_400Regular',
                }}
              />
            </FlexWidget>
          ))}
        </>
      )}
    </FlexWidget>
  );
}
