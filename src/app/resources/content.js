import { InlineCode } from "@/once-ui/components";

const person = {
    firstName: 'Ale𝕏',
    lastName:  'Alaniz',
    get name() {
        return `${this.firstName} ${this.lastName}`;
    },
    role:      'Founder & CEO of BearifiedCo',
    avatar:    '/images/avatar.jpg',
    location:  'America/New_York',
    languages: ['English', 'Spanish']
}

const newsletter = {
    display: true,
    title: <>Join the $BEARCO Movement</>,
    description: <>Get updates on BearifiedCo products, the 39-agent AI org, agentic payments, and the future of community-driven software.</>
}

const social = [
    {
        name: 'GitHub',
        icon: 'github',
        link: 'https://github.com/Alex-Alaniz',
    },
    {
        name: 'LinkedIn',
        icon: 'linkedin',
        link: 'https://www.linkedin.com/in/alex-alaniz-4981578a/',
    },
    {
        name: 'Follow',
        icon: 'x',
        link: 'https://x.com/AlexDotEth',
    },
    {
        name: '$BEARCO',
        icon: 'solana',
        link: 'https://pump.fun/coin/FdFUGJSzJXDCZemQbkBwYs3tZEvixyEc8cZfRqJrpump',
    },
    {
        name: 'Email',
        icon: 'email',
        link: 'mailto:alex@bearified.co',
    },
]

const home = {
    label: 'Home',
    title: `${person.name} | BearifiedCo`,
    description: `Founder of BearifiedCo — Building agentic payments and running a 39-agent AI organization.`,
    headline: <>Agentic Payments &<br/>a 39-Agent AI Org</>,
    subline: <>Founder at <InlineCode>BearifiedCo</InlineCode> — running a 39-agent AI organization on a single Mac mini M4 Pro. Building agentic payments, tokenized software, and 5 live products across AI, mobile, and Web3. Tokenized on Solana via $BEARCO with a 24/7 livestream on pump.fun.</>
}

const about = {
    label: 'About',
    title: 'About Ale𝕏',
    description: `Meet ${person.name}, ${person.role} — building agentic payments and running a 39-agent AI org`,
    tableOfContent: {
        display: true,
        subItems: true
    },
    avatar: {
        display: true
    },
    calendar: {
        display: true,
        link: 'https://calendly.com/alex-alexalaniz'
    },
    intro: {
        display: true,
        title: 'The Vision',
        description: <>Founder and CEO of BearifiedCo — a tokenized software company running a 39-agent autonomous AI organization on a single Mac mini M4 Pro. Zero human employees, shipping daily. I believe the future belongs to AI-native companies where autonomous agents build, sell, and grow products around the clock. The company is tokenized on Solana via $BEARCO on pump.fun with a 24/7 livestream showing every line of code being written.</>
    },
    work: {
        display: true,
        title: 'Ventures & Products',
        experiences: [
            {
                company: 'BearifiedCo — AI Organization',
                timeframe: '2024 - Present',
                role: 'CEO — 39-Agent AI Org',
                achievements: [
                    <>Built and run a 39-agent autonomous AI organization: 15 OpenClaw agents (engineering, sales, marketing, community) + 24 Notion AI agents (admin, ops, HR, finance) on a single Mac mini M4 Pro.</>,
                    <>AI CTO (Claude Opus) manages the full engineering org: Head of Engineering, 5 Lead Engineers, Chief of Staff, CGO, Sales Lead, Marketing Lead, and Community Bot — all operating 24/7.</>,
                    <>Built on OpenClaw, the open-source AI assistant platform. Contributed upstream PRs and run a custom instance powering the entire agent org with Mission Control dashboard.</>,
                    <>Tokenized the company on Solana via $BEARCO on pump.fun with a 24/7 coding livestream — the first AI-native software company built entirely in public.</>
                ],
                images: [
                    {
                        src: '/images/org-chart.png',
                        alt: 'Bearified AI Organization Chart — 39 Agents',
                        width: 16,
                        height: 8
                    }
                ]
            },
            {
                company: 'Bearo',
                timeframe: '2024 - Present',
                role: 'Agentic P2P Payments',
                achievements: [
                    <>Agentic peer-to-peer payments — making it as easy as Venmo for both humans and AI agents to transact autonomously.</>,
                    <>Native iOS app built with React Native, Expo, thirdweb, and Supabase. Multi-chain support across Solana and EVM chains.</>,
                    <>Username-based payments, email auth, real-time transaction tracking, and smart balance filtering across multiple chains and tokens.</>
                ],
                images: []
            },
            {
                company: 'OpenClaws',
                timeframe: '2024 - Present',
                role: '24/7 AI Assistant SaaS',
                achievements: [
                    <>OpenClaws.biz — a $29/mo 24/7 AI assistant service powered by OpenClaw with multi-channel support (Telegram, Discord, Slack, WhatsApp, iMessage).</>,
                    <>Autonomous customer support, sales outreach, and task execution running on the same infrastructure as the internal agent org.</>
                ],
                images: []
            },
            {
                company: 'BearCrawl',
                timeframe: '2024 - Present',
                role: 'AI Agent Platform',
                achievements: [
                    <>BearCrawl.ai — an AI agent platform with 5 tiers (Cub to Polar Bear) offering BYOAuth agent deployment for businesses.</>,
                    <>Built with Next.js. Designed for organizations to deploy and manage their own autonomous AI agents at scale.</>
                ],
                images: []
            },
            {
                company: 'Chimpanion & Storefront',
                timeframe: '2025 - Present',
                role: 'Mobile Products',
                achievements: [
                    <>Chimpanion — AI companion app live on the App Store. Native Swift iOS providing market analysis and trading insights.</>,
                    <>Storefront — B2B/B2C mobile commerce platform. Native SwiftUI apps with Swift Package architecture for business and consumer use cases.</>
                ],
                images: []
            },
            {
                company: 'BearifiedLabs',
                timeframe: '2023 - 2024',
                role: 'Smart Contract Development',
                achievements: [
                    <>Smart contract development and tokenomics consulting for developers, artists, and creators in the MemeCoin and NFT space.</>,
                    <>Built robust NFT solutions with focus on security, gas optimization, and community utility features.</>
                ],
                images: []
            },
            {
                company: 'Previous Experience',
                timeframe: '2012 - 2023',
                role: 'Information Technology',
                achievements: [
                    <>10+ years of IT experience across legal tech (Maglaw), ride-sharing (Lyft), and consumer electronics (Apple).</>,
                    <>Built enterprise systems, managed infrastructure, and developed internal tools that scaled to millions of users.</>
                ],
                images: []
            }
        ]
    },
    studies: {
        display: true,
        title: 'Philosophy',
        institutions: [
            {
                name: 'AI-Native Organization',
                description: <>39 autonomous agents. Zero human employees. The future of companies is AI-native: agents that build, sell, and grow products 24/7 on a single machine.</>,
            },
            {
                name: 'Building in Public',
                description: <>Every line of code streamed live. Full transparency. Community ownership through tokenization. Self-taught engineer turned CEO of an AI org.</>,
            }
        ]
    },
    technical: {
        display: true,
        title: 'Tech Stack',
        skills: [
            {
                title: 'AI Agent Infrastructure',
                description: <>Running 39 autonomous agents on OpenClaw (open-source AI assistant platform). Claude Opus as CTO, Sonnet for leads, Haiku for support. Custom orchestration with launchd, tmux, heartbeat scripts, and Mission Control dashboard.</>,
                images: [
                    {
                        src: '/images/projects/project-01/cover-02.jpg',
                        alt: 'AI Agent Infrastructure',
                        width: 16,
                        height: 9
                    }
                ]
            },
            {
                title: 'Agentic Payments & Web3',
                description: <>Building payment infrastructure for AI agents. Solana, thirdweb, multi-chain support. $BEARCO token on pump.fun. P2P payments via Bearo with stablecoin support across EVM chains.</>,
                images: [
                    {
                        src: '/images/projects/project-01/cover-03.jpg',
                        alt: 'Agentic Payments',
                        width: 16,
                        height: 9
                    }
                ]
            },
            {
                title: 'Full-Stack & Mobile',
                description: <>TypeScript, React, Next.js, SolidJS for web. Swift and SwiftUI for native iOS. React Native and Expo for cross-platform. Supabase, Docker, Vercel for infrastructure.</>,
                images: [
                    {
                        src: '/images/projects/project-01/cover-04.jpg',
                        alt: 'Full Stack & Mobile',
                        width: 16,
                        height: 9
                    }
                ]
            }
        ]
    }
}

const blog = {
    label: 'Blog',
    title: 'Building in Public',
    description: `Thoughts on AI organizations, agentic payments, tokenization, and building the future of software`
}

const work = {
    label: 'Work',
    title: 'Products & Ventures',
    description: `5 live products built by a 39-agent AI organization`
}

const gallery = {
    label: 'Gallery',
    title: 'Build Log',
    description: `Screenshots, designs, and moments from building BearifiedCo`,
    images: [
        { src: '/images/gallery/img-01.jpg', alt: 'Building BearifiedCo', orientation: 'vertical' },
        { src: '/images/gallery/img-02.jpg', alt: 'Development setup', orientation: 'horizontal' },
        { src: '/images/gallery/img-03.jpg', alt: 'Code review', orientation: 'vertical' },
        { src: '/images/gallery/img-04.jpg', alt: 'Product launch', orientation: 'horizontal' },
        { src: '/images/gallery/img-05.jpg', alt: 'Team meeting', orientation: 'horizontal' },
        { src: '/images/gallery/img-06.jpg', alt: 'Late night coding', orientation: 'vertical' },
        { src: '/images/gallery/img-07.jpg', alt: 'Mac mini M4 Pro setup', orientation: 'horizontal' },
        { src: '/images/gallery/img-08.jpg', alt: 'Design process', orientation: 'vertical' },
        { src: '/images/gallery/img-09.jpg', alt: 'Token launch', orientation: 'horizontal' },
        { src: '/images/gallery/img-10.jpg', alt: 'Community event', orientation: 'horizontal' },
        { src: '/images/gallery/img-11.jpg', alt: 'Whiteboard session', orientation: 'vertical' },
        { src: '/images/gallery/img-12.jpg', alt: 'Product demo', orientation: 'horizontal' },
        { src: '/images/gallery/img-13.jpg', alt: 'Streaming setup', orientation: 'horizontal' },
        { src: '/images/gallery/img-14.jpg', alt: 'Celebrating milestone', orientation: 'horizontal' },
    ]
}

export { person, social, newsletter, home, about, blog, work, gallery };
