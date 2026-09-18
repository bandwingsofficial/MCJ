/**
 * Customer-web primary action (CTA) brand styles.
 * Use via the shared Button `primary` variant whenever possible.
 */
export const PRIMARY_GRADIENT =
  "bg-gradient-to-r from-[#2F6BE5] to-[#1E49A8]";

export const PRIMARY_GRADIENT_HOVER =
  "hover:from-[#2860D4] hover:to-[#1A3F96]";

export const PRIMARY_BUTTON_CLASSES = [
  PRIMARY_GRADIENT,
  "text-white shadow-sm",
  PRIMARY_GRADIENT_HOVER,
  "hover:shadow-md",
].join(" ");

export const PRIMARY_FOCUS_RING = "focus:ring-[#2F6BE5]/40";
