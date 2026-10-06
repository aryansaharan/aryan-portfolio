// The page's motion curve and its grid, shared everywhere.
export const ease = [0.16, 1, 0.3, 1] as const

/** One container and one 12-column grid: every edge on the page hangs off it. */
export const CONTAINER = 'mx-auto w-full max-w-[1200px] px-5 sm:px-8 lg:px-10'
export const GRID = 'grid grid-cols-4 gap-x-4 sm:grid-cols-12 sm:gap-x-6'
