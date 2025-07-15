import type { FC, PropsWithChildren } from 'react';

declare global {
  declare module '*.svg?component' {
    import { FC, SVGProps } from 'react';
    const content: FC<SVGProps<SVGElement>>;
    export default content;
  }
}
