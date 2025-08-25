const colors = require('tailwindcss/colors');
const { fontFamily } = require('tailwindcss/defaultTheme');

const GRAY = {
    ...colors.gray,
    1000: '#18191f',
    900: '#1F2028',
    800: '#272935',
    700: '#2d2e3a',
    600: '#575969',
    200: '#BFC3D9',
    150: '#B0B2C3',
    100: '#dcdfec',
    75: '#f3f3f7',
    50: '#fff',
};

module.exports = {
    plugins: [require('@tailwindcss/typography')],
    content: [
        './src/**/*.{js,ts,jsx,tsx,md,mdx}',
        './lib/**/*.{js,ts,jsx,tsx}',
        './index.html',
    ],
    theme: {
        extend: {
            boxShadow: {
                outline: `0 0 0 0.75rem ${colors.cyan[300]}`,
            },
            fontFamily: {
                variable: ['var(--font-variable)', ...fontFamily.sans],
            },
            transitionProperty: {
                height: 'height',
                spacing: 'margin, padding',
            },
            colors: {
                green: colors.emerald,
                yellow: colors.amber,
                purple: colors.violet,
                gray: GRAY,
            },
            zIndex: {
                '-1': '-1',
            },
        },
    },
};