const baseURL = 'https://www.alexalaniz.com/'

const routes = {
    '/':        true,
    '/about':   true,
    '/work':    true,
    '/blog':    true,
    '/gallery': true,
}

// No protected routes needed
const protectedRoutes = {}

// Bold visual effects - cyberpunk meets finance
const effects = {
    gradient: true,
    dots:     false,
    lines:    true,
}

// AESTHETIC: Cyberpunk finance meets NYC nights
// Orange (BEARCO brand) + Electric accents + Dark mode
const style = {
    theme:       'dark',         // Dark mode always - we build at night
    neutral:     'slate',        // Slate for that NYC concrete vibe
    brand:       'orange',       // BEARCO orange - our primary brand
    accent:      'emerald',      // Solana green for that Web3 energy
    solid:       'contrast',     // High contrast for readability
    solidStyle:  'plastic',      // Glossy, modern feel
    border:      'playful',      // Rounded but dynamic
    surface:     'translucent',  // Glass morphism vibes
    transition:  'all'           // Smooth everything
}

const display = {
    location: true,
    time:     true
}

// BEARCO token details
const bearco = {
    tokenAddress: 'FdFUGJSzJXDCZemQbkBwYs3tZEvixyEc8cZfRqJrpump',
    pumpFunUrl: 'https://pump.fun/coin/FdFUGJSzJXDCZemQbkBwYs3tZEvixyEc8cZfRqJrpump',
    livestreamEmbed: 'https://pump.fun/coin/FdFUGJSzJXDCZemQbkBwYs3tZEvixyEc8cZfRqJrpump',
}

const mailchimp = {
    action: 'https://xyz.us9.list-manage.com/subscribe/post?u=1153ae1b6c4e7092b24e80a33&amp;id=a06b65d8a7&amp;f_id=00b73ee1f0',
    effects: {
        gradient: true,
        dots:     false,
        lines:    true,
    }
}

export { routes, protectedRoutes, effects, style, display, mailchimp, baseURL, bearco };
