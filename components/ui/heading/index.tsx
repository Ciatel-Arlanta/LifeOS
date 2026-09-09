import React, { forwardRef, memo } from 'react';
import {
  H1 as H1Base,
  H2 as H2Base,
  H3 as H3Base,
  H4 as H4Base,
  H5 as H5Base,
  H6 as H6Base,
} from '@expo/html-elements';
import { headingStyle } from './styles';
import type { VariantProps } from '@gluestack-ui/utils/nativewind-utils';
import { styled } from 'nativewind';

type IHeadingProps = VariantProps<typeof headingStyle> &
  React.ComponentPropsWithoutRef<typeof H1Base> & {
    as?: React.ElementType;
  };

const H1 = styled(H1Base, { className: 'style' });
const H2 = styled(H2Base, { className: 'style' });
const H3 = styled(H3Base, { className: 'style' });
const H4 = styled(H4Base, { className: 'style' });
const H5 = styled(H5Base, { className: 'style' });
const H6 = styled(H6Base, { className: 'style' });

const ElementMap: Record<string, any> = {
  '5xl': H1,
  '4xl': H1,
  '3xl': H1,
  '2xl': H2,
  'xl': H3,
  'lg': H4,
  'md': H5,
  'sm': H6,
  'xs': H6,
};

const Heading = memo(
  forwardRef<React.ComponentRef<typeof H1>, IHeadingProps>(function Heading(
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
    const Comp = AsComp || (size ? ElementMap[size] : null) || H4;
    return (
      <Comp
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
