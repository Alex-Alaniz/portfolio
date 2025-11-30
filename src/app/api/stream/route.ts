import { NextResponse } from 'next/server';

const BEARCO_TOKEN = 'FdFUGJSzJXDCZemQbkBwYs3tZEvixyEc8cZfRqJrpump';

// Livepeer config from environment variables
const LIVEPEER_API_KEY = process.env.LIVEPEER_API_KEY;
const LIVEPEER_STREAM_ID = process.env.LIVEPEER_STREAM_ID;
const LIVEPEER_PLAYBACK_ID = process.env.LIVEPEER_PLAYBACK_ID;
const DIRECT_STREAM_ENABLED = process.env.NEXT_PUBLIC_DIRECT_STREAM_ENABLED === 'true';

interface LivepeerStreamStatus {
    isActive: boolean;
    playbackId?: string;
    streamKey?: string;
}

interface PumpFunMetadata {
    name?: string;
    thumbnail?: string;
    viewerCount?: number;
    marketCap?: number;
    price?: number;
}

// Fetch Livepeer stream status for HD direct streaming
async function fetchLivepeerStatus(): Promise<LivepeerStreamStatus | null> {
    if (!LIVEPEER_API_KEY || !LIVEPEER_STREAM_ID) {
        return null;
    }

    try {
        const response = await fetch(
            `https://livepeer.studio/api/stream/${LIVEPEER_STREAM_ID}`,
            {
                headers: {
                    'Authorization': `Bearer ${LIVEPEER_API_KEY}`,
                },
                next: { revalidate: 10 }, // Check more frequently for live status
            }
        );

        if (!response.ok) {
            console.error('Livepeer API error:', response.status);
            return null;
        }

        const data = await response.json();
        return {
            isActive: data.isActive || false,
            playbackId: data.playbackId || LIVEPEER_PLAYBACK_ID,
            streamKey: data.streamKey,
        };
    } catch (error) {
        console.error('Livepeer fetch error:', error);
        return null;
    }
}

// Fetch pump.fun token metadata (viewer count, name, thumbnail)
async function fetchPumpFunMetadata(): Promise<PumpFunMetadata> {
    try {
        // Try to get live stream data first
        const liveResponse = await fetch(
            'https://frontend-api-v3.pump.fun/coins/currently-live',
            {
                headers: {
                    'Accept': 'application/json',
                    'Origin': 'https://pump.fun',
                    'Referer': 'https://pump.fun/',
                },
                next: { revalidate: 30 },
            }
        );

        if (liveResponse.ok) {
            const liveCoins = await liveResponse.json();
            const ourStream = liveCoins.find(
                (coin: any) => coin.mint === BEARCO_TOKEN
            );

            if (ourStream) {
                return {
                    name: ourStream.name,
                    thumbnail: ourStream.thumbnail,
                    viewerCount: ourStream.num_participants,
                    marketCap: ourStream.usd_market_cap,
                };
            }
        }

        // Fallback to coin data
        const coinResponse = await fetch(
            `https://frontend-api-v3.pump.fun/coins/${BEARCO_TOKEN}`,
            {
                headers: {
                    'Accept': 'application/json',
                    'Origin': 'https://pump.fun',
                    'Referer': 'https://pump.fun/',
                },
                next: { revalidate: 60 },
            }
        );

        if (coinResponse.ok) {
            const coinData = await coinResponse.json();
            return {
                name: coinData.name,
                thumbnail: coinData.thumbnail,
                marketCap: coinData.usd_market_cap,
            };
        }

        return { name: '$BEARCO' };
    } catch (error) {
        console.error('PumpFun metadata error:', error);
        return { name: '$BEARCO' };
    }
}

// Fetch pump.fun stream URLs (fallback when not using direct OBS)
async function fetchPumpFunStream() {
    try {
        const response = await fetch(
            'https://frontend-api-v3.pump.fun/coins/currently-live',
            {
                headers: {
                    'Accept': 'application/json',
                    'Origin': 'https://pump.fun',
                    'Referer': 'https://pump.fun/',
                },
                next: { revalidate: 30 },
            }
        );

        if (!response.ok) {
            return null;
        }

        const liveCoins = await response.json();
        const ourStream = liveCoins.find(
            (coin: any) => coin.mint === BEARCO_TOKEN
        );

        if (ourStream) {
            return {
                isLive: true,
                playlistUrl: ourStream.playlist_url,
                playlistUrlHigh: ourStream.playlist_url_high,
                playlistUrlLow: ourStream.playlist_url_low,
                vodPlaylistUrl: ourStream.vod_playlist_url,
                viewerCount: ourStream.num_participants,
                name: ourStream.name,
                streamTitle: ourStream.livestream_title,
                thumbnail: ourStream.thumbnail,
                marketCap: ourStream.usd_market_cap,
                source: 'pumpfun',
            };
        }

        return null;
    } catch (error) {
        console.error('PumpFun stream error:', error);
        return null;
    }
}

export async function GET() {
    try {
        // Always fetch pump.fun metadata for token info
        const pumpMetadata = await fetchPumpFunMetadata();

        // If direct streaming is enabled, try Livepeer first
        if (DIRECT_STREAM_ENABLED && LIVEPEER_PLAYBACK_ID) {
            const livepeerStatus = await fetchLivepeerStatus();

            if (livepeerStatus?.isActive) {
                const playbackId = livepeerStatus.playbackId || LIVEPEER_PLAYBACK_ID;

                return NextResponse.json({
                    isLive: true,
                    // Livepeer HLS URLs with quality variants
                    playlistUrl: `https://livepeer.studio/hls/${playbackId}/index.m3u8`,
                    playlistUrlHigh: `https://livepeer.studio/hls/${playbackId}/1080p/index.m3u8`,
                    playlistUrlMedium: `https://livepeer.studio/hls/${playbackId}/720p/index.m3u8`,
                    playlistUrlLow: `https://livepeer.studio/hls/${playbackId}/360p/index.m3u8`,
                    // pump.fun metadata
                    viewerCount: pumpMetadata.viewerCount,
                    name: pumpMetadata.name || '$BEARCO',
                    streamTitle: 'BEARCO Live - HD Direct Stream',
                    thumbnail: pumpMetadata.thumbnail,
                    marketCap: pumpMetadata.marketCap,
                    source: 'livepeer',
                    isHD: true,
                });
            }
        }

        // Fallback to pump.fun stream
        const pumpStream = await fetchPumpFunStream();

        if (pumpStream) {
            return NextResponse.json({
                ...pumpStream,
                marketCap: pumpMetadata.marketCap || pumpStream.marketCap,
                isHD: false,
            });
        }

        // Token not live, return metadata only
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
                marketCap: coinData.usd_market_cap,
                source: 'pumpfun',
                isHD: false,
            });
        }

        return NextResponse.json({
            isLive: false,
            name: '$BEARCO',
            source: 'none',
            isHD: false,
        });
    } catch (error) {
        console.error('Stream API error:', error);
        return NextResponse.json({
            isLive: false,
            error: 'Failed to fetch stream data',
            source: 'error',
            isHD: false,
        }, { status: 500 });
    }
}
