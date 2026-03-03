export const BASE_UNIT = 4;

export const scale = (steps: number) => steps * BASE_UNIT;

const strictTokenGroup = <T extends Record<string, number>>(name: string, tokens: T): T =>
  new Proxy(tokens, {
    get(target, prop, receiver) {
      if (typeof prop === "symbol") {
        return Reflect.get(target, prop, receiver);
      }

      if (prop in target) {
        return Reflect.get(target, prop, receiver);
      }

      throw new Error(`[tokens] Unknown token "${String(prop)}" accessed on ${name}.`);
    },
  });

const RAW_SPACE_SCALE = {
  1: scale(1),
  2: scale(2),
  3: scale(3),
  4: scale(4),
  5: scale(5),
  6: scale(6),
  8: scale(8),
  10: scale(10),
  11: scale(11),
  12: scale(12),
} as const;

export const SPACE_SCALE = strictTokenGroup("SPACE_SCALE", RAW_SPACE_SCALE);

const RAW_SPACING_ALIASES = {
  xs: SPACE_SCALE[1],
  sm: scale(1.5),
  md: SPACE_SCALE[2],
  lg: scale(2.5),
  xl: SPACE_SCALE[3],
  xxl: scale(3.5),
  xxxl: SPACE_SCALE[4],
  section: SPACE_SCALE[5],
  screen: SPACE_SCALE[6],
  "4xl": scale(9.5),
} as const;

export const SPACING_ALIASES = strictTokenGroup("SPACING_ALIASES", RAW_SPACING_ALIASES);

export const SIZE_SCALE = {
  control: {
    sm: SPACE_SCALE[10],
    md: SPACE_SCALE[11],
    lg: SPACE_SCALE[12],
  },
  input: scale(11.5),
  listItem: scale(14),
  listItemCompact: scale(11),
  iconTouch: SPACE_SCALE[10],
  avatar: {
    xs: SPACE_SCALE[6],
    sm: SPACE_SCALE[8],
    md: SPACE_SCALE[10],
    lg: scale(14),
    xl: scale(18),
  },
} as const;

export const RADIUS_SCALE = {
  sm: scale(2.5),
  md: SPACE_SCALE[3],
  lg: scale(3.5),
  xl: SPACE_SCALE[4],
  xxl: scale(4.5),
  full: 999,
  modal: SPACE_SCALE[6],
} as const;

export const TYPE_SCALE = {
  1: 11,
  2: 12,
  3: 13,
  4: 14,
  5: 15,
  6: 16,
  7: 17,
  8: 18,
  9: 20,
  10: 22,
  11: 26,
  12: 30,
  13: 36,
} as const;
