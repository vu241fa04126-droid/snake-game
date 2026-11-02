export const SNAKE_SKINS = [
    {
        id: 'emerald',
        name: 'Emerald Viper',
        headColor: '#10b981',
        bodyGradientStart: '#059669',
        bodyGradientEnd: '#047857',
        eyeColor: '#fef08a',
        glowColor: 'rgba(16, 185, 129, 0.4)'
    },
    {
        id: 'cyber',
        name: 'Cyber Neon',
        headColor: '#06b6d4',
        bodyGradientStart: '#3b82f6',
        bodyGradientEnd: '#8b5cf6',
        eyeColor: '#ffffff',
        glowColor: 'rgba(6, 182, 212, 0.45)'
    },
    {
        id: 'solar',
        name: 'Solar Flare',
        headColor: '#f59e0b',
        bodyGradientStart: '#f97316',
        bodyGradientEnd: '#ef4444',
        eyeColor: '#fef08a',
        glowColor: 'rgba(245, 158, 11, 0.45)'
    },
    {
        id: 'frost',
        name: 'Frost Wyrm',
        headColor: '#38bdf8',
        bodyGradientStart: '#67e8f9',
        bodyGradientEnd: '#0284c7',
        eyeColor: '#e0f2fe',
        glowColor: 'rgba(56, 189, 248, 0.45)'
    },
    {
        id: 'amethyst',
        name: 'Amethyst Shade',
        headColor: '#c084fc',
        bodyGradientStart: '#a855f7',
        bodyGradientEnd: '#7e22ce',
        eyeColor: '#fbcfe8',
        glowColor: 'rgba(192, 132, 252, 0.45)'
    }
];
export function getSkinById(id) {
    return SNAKE_SKINS.find((s) => s.id === id) || SNAKE_SKINS[0];
}
