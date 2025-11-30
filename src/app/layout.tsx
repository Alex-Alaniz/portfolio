import "@/once-ui/styles/index.scss";
import "@/once-ui/tokens/index.scss";
import "@/app/globals.scss";

import classNames from 'classnames';

import { Flex, Background } from '@/once-ui/components'
import { Footer, Header, RouteGuard } from "@/app/components";
import { baseURL, effects, home, person, style } from '@/app/resources'

// DISTINCTIVE FONTS - No generic Inter/Roboto
// Syne: Geometric, bold, futuristic display font
// JetBrains Mono: Technical, code-focused monospace
import { Syne } from 'next/font/google'
import { JetBrains_Mono } from 'next/font/google';
import { DM_Sans } from 'next/font/google';

import { Metadata } from "next";

export const metadata: Metadata = {
	metadataBase: new URL('https://' + baseURL),
	title: home.title,
	description: home.description,
	openGraph: {
		title: `${person.firstName} | BearifiedCo`,
		description: 'Founder of BearifiedCo - Building the future of tokenized software development on Solana.',
		url: baseURL,
		siteName: `${person.firstName} | BearifiedCo`,
		locale: 'en_US',
		type: 'website',
		images: "avatar.jpg",
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			'max-video-preview': -1,
			'max-image-preview': 'large',
			'max-snippet': -1,
		},
	},
}

// Primary: Syne - Bold, geometric, futuristic headlines
const primary = Syne({
	variable: '--font-primary',
	subsets: ['latin'],
	display: 'swap',
	weight: ['400', '500', '600', '700', '800'],
})

// Secondary: DM Sans - Clean, modern body text
const secondary = DM_Sans({
	variable: '--font-secondary',
	subsets: ['latin'],
	display: 'swap',
	weight: ['400', '500', '700'],
})

type FontConfig = {
    variable: string;
};

const tertiary: FontConfig | undefined = undefined;

// Code: JetBrains Mono - The developer's choice
const code = JetBrains_Mono({
	variable: '--font-code',
	subsets: ['latin'],
	display: 'swap',
});

interface RootLayoutProps {
	children: React.ReactNode;
}

export default function RootLayout({ children } : RootLayoutProps) {
	return (
		<Flex
			as="html" lang="en"
			background="page"
			data-neutral={style.neutral} data-brand={style.brand} data-accent={style.accent}
			data-solid={style.solid} data-solid-style={style.solidStyle}
			data-theme={style.theme}
			data-border={style.border}
			data-surface={style.surface}
			data-transition={style.transition}
			className={classNames(
				primary.variable,
				secondary.variable,
				tertiary ? tertiary.variable : '',
				code.variable)}>
			<Flex style={{minHeight: '100vh'}}
				as="body"
				fillWidth margin="0" padding="0"
				direction="column">
				<Background
					gradient={effects.gradient}
					dots={effects.dots}
					lines={effects.lines}/>
				<Flex
					fillWidth
					minHeight="16">
				</Flex>
				<Header/>
				<Flex
					zIndex={0}
					fillWidth paddingY="l" paddingX="l"
					justifyContent="center" flex={1}>
					<Flex
						justifyContent="center"
						fillWidth minHeight="0">
						<RouteGuard>
							{children}
						</RouteGuard>
					</Flex>
				</Flex>
				<Footer/>
			</Flex>
		</Flex>
	);
}
