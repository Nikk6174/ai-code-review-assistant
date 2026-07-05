declare module './LetterGlitch' {
  interface LetterGlitchProps {
    glitchSpeed?: number;
    centerVignette?: boolean;
    outerVignette?: boolean;
    smooth?: boolean;
  }

  export default function LetterGlitch(props: LetterGlitchProps): JSX.Element;
}

declare module '../components/LetterGlitch' {
  interface LetterGlitchProps {
    glitchSpeed?: number;
    centerVignette?: boolean;
    outerVignette?: boolean;
    smooth?: boolean;
  }

  export default function LetterGlitch(props: LetterGlitchProps): JSX.Element;
}

declare module './GlitchText' {
  import type { ReactNode } from 'react';

  interface GlitchTextProps {
    children?: ReactNode;
    speed?: number;
    enableOnHover?: boolean;
  }

  export default function GlitchText(props: GlitchTextProps): JSX.Element;
}

declare module '../components/GlitchText' {
  import type { ReactNode } from 'react';

  interface GlitchTextProps {
    children?: ReactNode;
    speed?: number;
    enableOnHover?: boolean;
  }

  export default function GlitchText(props: GlitchTextProps): JSX.Element;
}
