// YourComponent.stylex.ts

import { staticColors } from "@/themes/tokens.stylex"; // Adjust the import path as needed
import * as stylex from "@stylexjs/stylex";

export const styles = stylex.create({
  container: {
    display: "flex",
    padding: "0 24px",
    alignItems: "flex-start",
    gap: 8,
    alignSelf: "stretch",
  },
  title: {
    color: staticColors.colorsBaseBlack, // Use the defined CSS variable
    fontSize: "1.25rem",
    fontStyle: "normal",
    fontWeight: 600,
    lineHeight: 1.5,
  },
});
