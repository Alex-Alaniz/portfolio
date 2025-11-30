# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio for Ale𝕏 Alaniz / BearifiedCo — a tokenized software development agency on Solana. Built with Next.js 14 and a custom design system. Features a 24/7 pump.fun livestream embed.

## Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run Next.js linting
```

## Architecture

### Content Management

All site content is in `src/app/resources/`:
- **config.js** - Routes, theming (orange brand + emerald accent), visual effects, `bearco` token config
- **content.js** - Personal info, social links (includes $BEARCO pump.fun link), page content
- **index.ts** - Re-exports for easy importing

### Content Pages

MDX files for dynamic content:
- Blog posts: `src/app/blog/posts/*.mdx`
- Work projects: `src/app/work/projects/*.mdx`

### Key Components

- **Livestream** (`src/app/components/Livestream.tsx`) - pump.fun 24/7 stream embed with token info
- **Custom styles** (`src/app/globals.scss`) - Cyberpunk aesthetic: gradients, glow effects, animations

### Theming

Theme config in `config.js` style object:
- **theme**: dark (always)
- **brand**: orange (BEARCO brand color)
- **accent**: emerald (Solana green)
- **surface**: translucent (glass morphism)

### Fonts

Custom font stack (no generic Inter/Roboto):
- **Primary**: Syne (geometric display)
- **Secondary**: DM Sans (body text)
- **Code**: JetBrains Mono

### $BEARCO Integration

Token address: `FdFUGJSzJXDCZemQbkBwYs3tZEvixyEc8cZfRqJrpump`
- pump.fun link in social icons
- Livestream embed on homepage
- Token details in footer
