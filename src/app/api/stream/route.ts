import { NextResponse } from 'next/server';

const BEARCO_TOKEN = 'FdFUGJSzJXDCZemQbkBwYs3tZEvixyEc8cZfRqJrpump';

export async function GET() {
    try {
        // Fetch from pump.fun's currently-live endpoint
        const response = await fetch(
            'https://frontend-api-v3.pump.fun/coins/currently-live',
            {
                headers: {
                    'Accept': 'application/json',
                    'Origin': 'https://pump.fun',
                    'Referer': 'https://pump.fun/',
                },
                next: { revalidate: 30 }, // Cache for 30 seconds
            }
        );

        if (!response.ok) {
            // Fallback to basic coin data
            const coinResponse = await fetch(
                `https://frontend-api-v3.pump.fun/coins/${BEARCO_TOKEN}`,
                {
                    headers: {
                        'Accept': 'application/json',
                        'Origin': 'https://pump.fun',
                        'Referer': 'https://pump.fun/',
                    },
                }
            );

            if (coinResponse.ok) {
                const coinData = await coinResponse.json();
                return NextResponse.json({
                    isLive: coinData.is_currently_live || false,
                    thumbnail: coinData.thumbnail,
                    name: coinData.name,
                });
            }

            return NextResponse.json({ isLive: false });
        }

        const liveCoins = await response.json();

        // Find BEARCO token in live streams
        const ourStream = liveCoins.find(
            (coin: any) => coin.mint === BEARCO_TOKEN
        );

        if (ourStream) {
            return NextResponse.json({
                isLive: true,
                playlistUrl: ourStream.playlist_url,
                playlistUrlHigh: ourStream.playlist_url_high,
                playlistUrlLow: ourStream.playlist_url_low,
                vodPlaylistUrl: ourStream.vod_playlist_url,
                viewerCount: ourStream.num_participants,
                name: ourStream.name,
                streamTitle: ourStream.livestream_title,
                thumbnail: ourStream.thumbnail,
            });
        }

        // Token not in live list, fetch basic data
        const coinResponse = await fetch(
            `https://frontend-api-v3.pump.fun/coins/${BEARCO_TOKEN}`,
            {
                headers: {
                    'Accept': 'application/json',
                    'Origin': 'https://pump.fun',
                    'Referer': 'https://pump.fun/',
                },
            }
        );

        if (coinResponse.ok) {
            const coinData = await coinResponse.json();
            return NextResponse.json({
                isLive: coinData.is_currently_live || false,
                thumbnail: coinData.thumbnail,
                name: coinData.name,
            });
        }

        return NextResponse.json({ isLive: false });
    } catch (error) {
        console.error('Stream API error:', error);
        return NextResponse.json({ isLive: false }, { status: 500 });
    }
}
