'use client';
import React, { createContext, useContext } from 'react';
import { Pressable, Text, type PressableProps, type StyleProp, type TextProps, type ViewStyle } from 'react-native';
import { tva, type VariantProps } from '@gluestack-ui/utils/nativewind-utils';
import { tapLight } from '@/lib/haptics';
import { useResolvedColorScheme } from '@/lib/use-color-scheme';
import { DARK_PALETTE, PALETTE } from '@/lib/theme';

const FabContext = createContext<{ size?: 'sm' | 'md' | 'lg' }>({ size: 'md' });

const fabStyle = tva({
  base: 'group/fab bg-primary rounded-full z-20 flex-row items-center justify-center absolute hover:bg-primary/90 active:bg-primary/80 disabled:opacity-40 disabled:pointer-events-all disabled:cursor-not-allowed shadow-lg',
  variants: {
    size: {
      sm: 'px-3.5 py-2 gap-1.5',
      md: 'px-4 py-2.5 gap-2',
      lg: 'px-5 py-3 gap-2.5',
    },
    placement: {
      'top right': 'top-4 right-4',
      'top left': 'top-4 left-4',
      'bottom right': 'bottom-6 right-6',
      'bottom left': 'bottom-6 left-6',
      'top center': 'top-4 self-center',
      'bottom center': 'bottom-6 self-center',
    },
  },
});

const fabLabelStyle = tva({
  base: 'text-primary-foreground font-medium font-body tracking-md text-left',
  variants: {
    size: {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
    },
  },
});

const fabIconStyle = tva({
  base: 'text-primary-foreground fill-none',
  variants: {
    size: {
      sm: 'h-4 w-4',
      md: 'h-[18px] w-[18px]',
      lg: 'h-5 w-5',
    },
  },
});

const fabIconSizeMap: Record<string, number> = {
  sm: 16,
  md: 18,
  lg: 20,
};

export type IFabProps = PressableProps &
  VariantProps<typeof fabStyle> & {
    className?: string;
    children?: React.ReactNode;
  };

export const Fab = React.forwardRef<React.ElementRef<typeof Pressable>, IFabProps>(
  function Fab(
    { size = 'md', placement = 'bottom right', className, children, onPress, ...props },
    ref
  ) {
    return (
      <FabContext.Provider value={{ size: size ?? 'md' }}>
        <Pressable
          ref={ref}
          accessibilityRole="button"
          className={fabStyle({ size, placement, class: className })}
          onPress={(event) => {
            tapLight();
            onPress?.(event);
          }}
          {...props}>
          {children}
        </Pressable>
      </FabContext.Provider>
    );
  }
);

export type IFabLabelProps = TextProps &
  VariantProps<typeof fabLabelStyle> & {
    className?: string;
    children?: React.ReactNode;
  };

export const FabLabel = React.forwardRef<React.ElementRef<typeof Text>, IFabLabelProps>(
  function FabLabel({ size, className, children, ...props }, ref) {
    const context = useContext(FabContext);
    const resolvedSize = size ?? context.size ?? 'md';
    return (
      <Text
        ref={ref}
        numberOfLines={1}
        className={fabLabelStyle({ size: resolvedSize, class: className })}
        {...props}>
        {children}
      </Text>
    );
  }
);

export type IFabIconProps = {
  as?: React.ComponentType<{
    ref?: any;
    size?: number;
    width?: number;
    height?: number;
    color?: string;
    stroke?: string;
    strokeWidth?: number;
    className?: string;
    style?: StyleProp<ViewStyle>;
    [key: string]: any;
  }>;
  size?: 'sm' | 'md' | 'lg' | number;
  className?: string;
  height?: number;
  width?: number;
  style?: StyleProp<ViewStyle>;
  color?: string;
  [key: string]: any;
};

export const FabIcon = React.forwardRef<any, IFabIconProps>(
  function FabIcon({ as: AsComp, size, className, style, color, ...props }, ref) {
    const context = useContext(FabContext);
    const colorScheme = useResolvedColorScheme();
    const resolvedSize: 'sm' | 'md' | 'lg' =
      typeof size === 'string' && (size === 'sm' || size === 'md' || size === 'lg')
        ? size
        : context.size ?? 'md';
    const numSize = typeof size === 'number' ? size : fabIconSizeMap[resolvedSize] ?? 18;
    const iconClass = fabIconStyle({
      size: resolvedSize,
      class: className,
    });

    const isDark = colorScheme === 'dark';
    const resolvedColor = color ?? (isDark ? PALETTE.ink : DARK_PALETTE.ink);

    if (AsComp) {
      return (
        <AsComp
          ref={ref}
          className={iconClass}
          size={numSize}
          width={numSize}
          height={numSize}
          color={resolvedColor}
          stroke={resolvedColor}
          strokeWidth={2.5}
          style={[{ width: numSize, height: numSize }, style]}
          {...props}
        />
      );
    }
    return null;
  }
);

Fab.displayName = 'Fab';
FabLabel.displayName = 'FabLabel';
FabIcon.displayName = 'FabIcon';
