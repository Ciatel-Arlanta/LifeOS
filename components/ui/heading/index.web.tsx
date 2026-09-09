import React, { forwardRef, memo } from 'react';
import { headingStyle } from './styles';
import type { VariantProps } from '@gluestack-ui/utils/nativewind-utils';

type IHeadingProps = VariantProps<typeof headingStyle> &
  React.ComponentPropsWithoutRef<'h1'> & {
    as?: React.ElementType;
  };

const TagMap: Record<string, keyof React.JSX.IntrinsicElements> = {
  '5xl': 'h1',
  '4xl': 'h1',
  '3xl': 'h1',
  '2xl': 'h2',
  'xl': 'h3',
  'lg': 'h4',
  'md': 'h5',
  'sm': 'h6',
  'xs': 'h6',
};

const Heading = memo(
  forwardRef<HTMLHeadingElement, IHeadingProps>(function Heading(
    {
      className,
      size = 'lg',
      as: AsComp,
      isTruncated,
      bold,
      underline,
      strikeThrough,
      sub,
      italic,
      highlight,
      ...props
    },
    ref
  ) {
    const Component = (AsComp || (size ? TagMap[size] : null) || 'h4') as any;
    return (
      <Component
        ref={ref}
        className={headingStyle({
          size,
          isTruncated: isTruncated as boolean,
          bold: bold as boolean,
          underline: underline as boolean,
          strikeThrough: strikeThrough as boolean,
          sub: sub as boolean,
          italic: italic as boolean,
          highlight: highlight as boolean,
          class: className,
        })}
        {...props}
      />
    );
  })
);

Heading.displayName = 'Heading';

export { Heading };
