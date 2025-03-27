export const fonts = {
  regular: 'OpenSans',
  medium: 'OpenSans-Medium',
  semiBold: 'OpenSans-SemiBold',
  bold: 'OpenSans-Bold',
} as const;

export const fontWeights = {
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
} as const;

export type FontFamily = keyof typeof fonts;
export type FontWeight = keyof typeof fontWeights;
