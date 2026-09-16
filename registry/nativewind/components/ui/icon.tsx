import { TextClassContext } from '@/registry/nativewind/components/ui/text';
import { cn } from '@/registry/nativewind/lib/utils';
import { cssInterop } from 'nativewind';
import * as React from 'react';
import { Platform, StyleSheet } from 'react-native';

type IconProps = {
  as: React.ComponentType<React.SVGProps<SVGSVGElement> & { size?: number }>;
} & React.ComponentProps<'svg'>;

function IconImpl({ as: IconComponent, size = 14, ...props }: IconProps) {
  return <IconComponent width={size} height={size} {...props as any} />;
}

cssInterop(IconImpl, {
  className: {
    target: 'style',
    nativeStyleToProp: {
      height: 'height',
      width: 'width',
    },
  },
});

function Icon({ as: IconComponent, className, size = 14, ...props }: IconProps) {
  const textClass = React.useContext(TextClassContext);
  return (
    <IconImpl
      as={IconComponent}
      className={cn('text-foreground', textClass, className)}
      size={size}
      {...props}
    />
  );
}

export { Icon };
