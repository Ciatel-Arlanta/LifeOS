import { Heading } from '@/components/ui/heading';
import { formatInr } from '@/utils/money';

export function Amount({
  minor,
  size = 'md',
  className,
}: {
  minor: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}) {
  const headingSize = {
    sm: 'md',
    md: 'xl',
    lg: '3xl',
    xl: '4xl',
  }[size] as 'md' | 'xl' | '3xl' | '4xl';

  return (
    <Heading size={headingSize} className={`font-display ${className ?? ''}`}>
      {formatInr(minor)}
    </Heading>
  );
}
