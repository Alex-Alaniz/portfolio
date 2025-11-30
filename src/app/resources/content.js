import { InlineCode } from "@/once-ui/components";

const person = {
    firstName: 'Ale𝕏',
    lastName:  'Alaniz',
    get name() {
        return `${this.firstName} ${this.lastName}`;
    },
    role:      'Software Engineer & Founder',
    avatar:    '/images/avatar.jpg',
    location:  'New York 🗽',
    languages: ['English', 'Spanish']
}

const newsletter = {
    display: true,
    title: <>Join the $BEARCO Movement</>,
    description: <>Get updates on BearifiedCo ventures, tokenization milestones, and the future of community-driven software development.</>
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
        link: 'mailto:alex@bearified.xyz',
    },
]

const home = {
    label: 'Home',
    title: `${person.name} | BearifiedCo`,
    description: `Founder of BearifiedCo - Building the future of tokenized software development.`,
    headline: <>Building the Future of<br/>Tokenized Software</>,
    subline: <>Founder at <InlineCode>BearifiedCo</InlineCode> — a software development agency tokenized on Solana via $BEARCO. Building AI-powered tools, Web3 payments, and community-driven products. Watch the 24/7 livestream on pump.fun.</>
}

const about = {
    label: 'About',
    title: 'About Ale𝕏',
    description: `Meet ${person.name}, ${person.role} — building tokenized software companies from NYC`,
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
        description: <>NYC-based software engineer and founder of BearifiedCo — a tokenized software development agency on Solana. I believe the future of software companies is community-owned, transparently built, and financially accessible to everyone who contributes. That's why I tokenized my agency via $BEARCO on pump.fun with a 24/7 livestream showing every line of code being written.</>
    },
    work: {
        display: true,
        title: 'Ventures & Products',
        experiences: [
            {
                company: 'BearifiedCo',
                timeframe: '2023 - Present',
                role: 'Founder & Lead Engineer',
                achievements: [
                    <>Tokenized the entire software agency on Solana via $BEARCO on pump.fun — the first software development company built entirely in public with a 24/7 coding livestream.</>,
                    <>Building Bearified Artifacts: an AI-powered generation platform using Google Gemini with BEARCO token payments, vote-to-earn mechanics, and community-driven idea submissions.</>,
                    <>Developing StablePay: a Venmo-style peer-to-peer crypto payment app supporting USDC/USDT across Ethereum, Polygon, and Base chains with thirdweb integration.</>,
                    <>BEARCO Gaming Platform: a Solana-based gaming ecosystem with Phantom wallet integration, real-time WebSocket connections, and secure transaction handling.</>
                ],
                images: [
                    {
                        src: '/images/projects/project-01/cover-01.jpg',
                        alt: 'Bearified Artifacts Platform',
                        width: 16,
                        height: 9
                    }
                ]
            },
            {
                company: 'BearifiedLabs',
                timeframe: '2023 - Present',
                role: 'Smart Contract Development',
                achievements: [
                    <>Empowering developers, artists, and creators in the MemeCoin & NFT space through innovative smart contract development and tokenomics consulting.</>,
                    <>Building robust NFT solutions with focus on security, gas optimization, and community utility features.</>
                ],
                images: []
            },
            {
                company: 'Previous Experience',
                timeframe: '2012 - 2022',
                role: 'Information Technology',
                achievements: [
                    <>10+ years of IT experience across multiple industries including legal tech (Maglaw), ride-sharing (Lyft), and consumer electronics (Apple).</>,
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
                name: 'Building in Public',
                description: <>Every line of code streamed live. Full transparency. Community ownership through tokenization.</>,
            },
            {
                name: 'Continuous Learning',
                description: <>Self-taught software engineer. AI-accelerated development. Learning by shipping real products.</>,
            }
        ]
    },
    technical: {
        display: true,
        title: 'Tech Stack',
        skills: [
            {
                title: 'AI-Accelerated Development',
                description: <>Building with Claude, GPT-4, and Gemini to ship products at unprecedented speed. Created an autonomous agentic coding workflow using Claude Opus for continuous development.</>,
                images: [
                    {
                        src: '/images/projects/project-01/cover-02.jpg',
                        alt: 'Agentic Workflow',
                        width: 16,
                        height: 9
                    }
                ]
            },
            {
                title: 'Full-Stack Web3',
                description: <>Next.js, React, SolidJS for frontends. Solana, Ethereum, Base for blockchain. thirdweb, Phantom for wallet integration. Supabase for backend.</>,
                images: [
                    {
                        src: '/images/projects/project-01/cover-03.jpg',
                        alt: 'Web3 Stack',
                        width: 16,
                        height: 9
                    }
                ]
            },
            {
                title: 'Payment Systems',
                description: <>Built crypto payment rails for BEARCO token, stablecoins (USDC/USDT), and multi-chain support across Ethereum, Polygon, and Base.</>,
                images: [
                    {
                        src: '/images/projects/project-01/cover-04.jpg',
                        alt: 'Payment Systems',
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
    description: `Thoughts on tokenization, AI development, and building the future of software`
}

const work = {
    label: 'Work',
    title: 'Products & Ventures',
    description: `Shipping real products in the Web3 ecosystem`
}

const gallery = {
    label: 'Gallery',
    title: 'Build Log',
    description: `Screenshots, designs, and moments from building BearifiedCo`,
    images: [
        {
            src: '/images/gallery/img-01.jpg',
            alt: 'Building BearifiedCo',
            orientation: 'vertical'
        },
        {
            src: '/images/gallery/img-02.jpg',
            alt: 'Development setup',
            orientation: 'horizontal'
        },
        {
            src: '/images/gallery/img-03.jpg',
            alt: 'Code review',
            orientation: 'vertical'
        },
        {
            src: '/images/gallery/img-04.jpg',
            alt: 'Product launch',
            orientation: 'horizontal'
        },
        {
            src: '/images/gallery/img-05.jpg',
            alt: 'Team meeting',
            orientation: 'horizontal'
        },
        {
            src: '/images/gallery/img-06.jpg',
            alt: 'Late night coding',
            orientation: 'vertical'
        },
        {
            src: '/images/gallery/img-07.jpg',
            alt: 'NYC office',
            orientation: 'horizontal'
        },
        {
            src: '/images/gallery/img-08.jpg',
            alt: 'Design process',
            orientation: 'vertical'
        },
        {
            src: '/images/gallery/img-09.jpg',
            alt: 'Token launch',
            orientation: 'horizontal'
        },
        {
            src: '/images/gallery/img-10.jpg',
            alt: 'Community event',
            orientation: 'horizontal'
        },
        {
            src: '/images/gallery/img-11.jpg',
            alt: 'Whiteboard session',
            orientation: 'vertical'
        },
        {
            src: '/images/gallery/img-12.jpg',
            alt: 'Product demo',
            orientation: 'horizontal'
        },
        {
            src: '/images/gallery/img-13.jpg',
            alt: 'Streaming setup',
            orientation: 'horizontal'
        },
        {
            src: '/images/gallery/img-14.jpg',
            alt: 'Celebrating milestone',
            orientation: 'horizontal'
        },
    ]
}

export { person, social, newsletter, home, about, blog, work, gallery };
