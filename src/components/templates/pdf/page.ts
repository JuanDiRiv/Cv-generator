// src/components/templates/pdf/page.ts

// A4 in PDF points
const A4_WIDTH = 595.28
const A4_HEIGHT = 841.89

/**
 * Exports the CV as ONE continuous page, like the on-screen preview, instead of
 * splitting it into A4 sheets. With no `height`, react-pdf sizes the page to its
 * content; `wrap={false}` is required, otherwise pagination never terminates.
 * Spread onto <Page> and merge `pageMinHeight` into its style.
 */
export const singlePageProps = {
  size: { width: A4_WIDTH },
  wrap: false,
} as const

/** Short CVs still fill a full A4 sheet */
export const pageMinHeight = { minHeight: A4_HEIGHT }
