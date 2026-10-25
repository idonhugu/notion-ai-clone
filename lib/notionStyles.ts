export type NotionFontStyle = 'sans' | 'serif' | 'mono';

export interface NotionFontOption {
  id: NotionFontStyle;
  label: string;
  preview: string;
  cssClass: string;
  fontFamily: string;
  description: string;
}

export const NOTION_FONTS: NotionFontOption[] = [
  {
    id: 'sans',
    label: 'Default',
    preview: 'Ag',
    cssClass: 'font-sans',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Roboto, Helvetica, Arial, sans-serif',
    description: 'Clean, modern sans-serif',
  },
  {
    id: 'serif',
    label: 'Serif',
    preview: 'Ag',
    cssClass: 'font-serif',
    fontFamily: 'Charter, Georgia, Cambria, "Times New Roman", Times, serif',
    description: 'Classic, editorial serif for reading',
  },
  {
    id: 'mono',
    label: 'Mono',
    preview: 'Ag',
    cssClass: 'font-mono',
    fontFamily:
      '"JetBrains Mono", "Fira Code", Menlo, Monaco, Consolas, "Liberation Mono", monospace',
    description: 'Technical monospace for data & code',
  },
];

export interface NotionColorOption {
  id: string;
  label: string;
  textColorLight: string;
  textColorDark: string;
  bgLight: string;
  bgDark: string;
  swatchHex: string;
}

export const NOTION_COLORS: NotionColorOption[] = [
  {
    id: 'default',
    label: 'Default',
    textColorLight: '#37352f',
    textColorDark: '#ededed',
    bgLight: 'transparent',
    bgDark: 'transparent',
    swatchHex: '#37352f',
  },
  {
    id: 'gray',
    label: 'Gray',
    textColorLight: '#787774',
    textColorDark: '#9b9a97',
    bgLight: '#f1f1ef',
    bgDark: '#2f2f2f',
    swatchHex: '#787774',
  },
  {
    id: 'brown',
    label: 'Brown',
    textColorLight: '#9f6b53',
    textColorDark: '#ba856f',
    bgLight: '#f4eeee',
    bgDark: '#382e2b',
    swatchHex: '#9f6b53',
  },
  {
    id: 'orange',
    label: 'Orange',
    textColorLight: '#d9730d',
    textColorDark: '#c77d48',
    bgLight: '#fbecdd',
    bgDark: '#3d2e24',
    swatchHex: '#d9730d',
  },
  {
    id: 'yellow',
    label: 'Yellow',
    textColorLight: '#cb912f',
    textColorDark: '#ca9849',
    bgLight: '#fbf3db',
    bgDark: '#3d3725',
    swatchHex: '#cb912f',
  },
  {
    id: 'green',
    label: 'Green',
    textColorLight: '#448361',
    textColorDark: '#529e72',
    bgLight: '#edf3ec',
    bgDark: '#24362b',
    swatchHex: '#448361',
  },
  {
    id: 'blue',
    label: 'Blue',
    textColorLight: '#337ea9',
    textColorDark: '#5e87c9',
    bgLight: '#e7f3f8',
    bgDark: '#233247',
    swatchHex: '#337ea9',
  },
  {
    id: 'purple',
    label: 'Purple',
    textColorLight: '#9065b0',
    textColorDark: '#9d68d3',
    bgLight: '#f4f0f7',
    bgDark: '#362846',
    swatchHex: '#9065b0',
  },
  {
    id: 'pink',
    label: 'Pink',
    textColorLight: '#c14c8a',
    textColorDark: '#c3558c',
    bgLight: '#fbf0f4',
    bgDark: '#3b2633',
    swatchHex: '#c14c8a',
  },
  {
    id: 'red',
    label: 'Red',
    textColorLight: '#d44c47',
    textColorDark: '#df5452',
    bgLight: '#fdebec',
    bgDark: '#3e2828',
    swatchHex: '#d44c47',
  },
];
