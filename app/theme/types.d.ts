import '@emotion/react';

export type ThemeMode = 'light' | 'dark';

type MetricColor = {
  text: string;
  background: string;
  border: string;
};

declare module '@emotion/react' {
  export interface Theme {
    mode: ThemeMode;

    colors: {
      bg: string;
      text: string;
      card: string;
      primary: string;
      border: string;
      muted: string;
      input: string;
      success: string;
      warning: string;
      danger: string;
      white: string;
      black: string;

      metrics: {
        glucose: MetricColor;
        carbsGram: MetricColor;
        shortInsulin: MetricColor;
        longInsulin: MetricColor;
      };

      shades: {
        primary: {
          sm: string;
          md: string;
          lg: string;
          xl: string;
          text: string;
          mutedText: string;
        };
        success: {
          sm: string;
          md: string;
          lg: string;
          xl: string;
          text: string;
          mutedText: string;
        };
        warning: {
          sm: string;
          md: string;
          lg: string;
          text: string;
          mutedText: string;
        };
        danger: {
          sm: string;
          md: string;
          lg: string;
          text: string;
          mutedText: string;
        };
      };

      whiteAlpha: {
        sm: string;
        md: string;
        lg: string;
        xl: string;
      };

      blackAlpha: {
        sm: string;
        md: string;
        lg: string;
        xl: string;
      };
    };

    border: {
      width: {
        none: number;
        sm: number;
        md: number;
      };
    };

    control: {
      height: {
        sm: number;
        md: number;
        lg: number;
      };
    };

    weight: {
      regular: string;
      medium: string;
      semibold: string;
      bold: string;
      heavy: string;
      black: string;
    };

    lineHeight: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
      '2xl': number;
      '3xl': number;
    };

    spacing: {
      '3xs': number;
      xxs: number;
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
      '2xl': number;
      '3xl': number;
      '4xl': number;
      '5xl': number;
    };

    radius: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
      full: number;
    };

    size: {
      xs: number;
      sm: number;
      base: number;
      md: number;
      lg: number;
      xl: number;
      '2xl': number;
      '3xl': number;
    };
  }
}
