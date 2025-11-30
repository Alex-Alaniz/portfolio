'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import { Flex, Heading, Text, Button } from '@/once-ui/components';
import { bearco } from '@/app/resources';
import styles from './Livestream.module.scss';

interface StreamData {
    isLive: boolean;
    hlsPlaybackUrl?: string;
    hlsPlaybackUrlHigh?: string;
    hlsPlaybackUrlLow?: string;
    viewerCount?: number;
    streamerName?: string;
    streamTitle?: string;
    thumbnail?: string;
}

type QualityLevel = 'low' | 'medium' | 'high';

export const Livestream = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<Hls | null>(null);
    const [streamData, setStreamData] = useState<StreamData>({ isLive: false });
    const [isLoading, setIsLoading] = useState(true);
    const [quality, setQuality] = useState<QualityLevel>('low');
    const [isBuffering, setIsBuffering] = useState(true);

    // Fetch stream data from our API route (avoids CORS)
    const fetchStreamData = useCallback(async () => {
        try {
            const response = await fetch('/api/stream');

            if (!response.ok) {
                throw new Error('Failed to fetch stream data');
            }

            const data = await response.json();

            if (data.isLive && data.playlistUrl) {
                setStreamData({
                    isLive: true,
                    hlsPlaybackUrl: data.playlistUrl,
                    hlsPlaybackUrlHigh: data.playlistUrlHigh,
                    hlsPlaybackUrlLow: data.playlistUrlLow,
                    viewerCount: data.viewerCount,
                    streamerName: data.name || '$BEARCO',
                    streamTitle: data.streamTitle,
                    thumbnail: data.thumbnail,
                });
            } else {
                setStreamData({
                    isLive: data.isLive || false,
                    thumbnail: data.thumbnail,
                    streamerName: data.name || '$BEARCO',
                });
            }
        } catch (err) {
            console.log('Stream fetch error:', err);
            setStreamData({ isLive: false });
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Get playback URL based on quality setting
    const getPlaybackUrl = useCallback(() => {
        switch (quality) {
            case 'high':
                return streamData.hlsPlaybackUrlHigh || streamData.hlsPlaybackUrl;
            case 'medium':
                return streamData.hlsPlaybackUrl;
            case 'low':
            default:
                return streamData.hlsPlaybackUrlLow || streamData.hlsPlaybackUrl;
        }
    }, [quality, streamData]);

    // Initialize HLS player when stream is live
    useEffect(() => {
        const playbackUrl = getPlaybackUrl();

        if (!streamData.isLive || !playbackUrl || !videoRef.current) {
            return;
        }

        const video = videoRef.current;

        if (Hls.isSupported()) {
            const hls = new Hls({
                // Performance optimizations for smooth playback
                enableWorker: true,
                lowLatencyMode: false, // Prioritize stability

                // Aggressive buffering for smooth playback
                maxBufferLength: 60, // Buffer 60 seconds ahead
                maxMaxBufferLength: 120, // Allow up to 2 minutes during seek
                maxBufferSize: 120 * 1000 * 1000, // 120MB buffer
                maxBufferHole: 1, // Tolerate 1 second gaps

                // Keep some back buffer for rewind
                backBufferLength: 60,

                // Live sync - stay close to live edge but not too close
                liveSyncDuration: 6, // 6 seconds behind live
                liveMaxLatencyDuration: 15, // Max 15 seconds behind
                liveDurationInfinity: true,

                // Start with lowest quality for faster initial load
                startLevel: 0, // Start with lowest quality
                abrEwmaDefaultEstimate: 1000000, // 1Mbps initial estimate
                abrBandWidthFactor: 0.8, // Conservative bandwidth usage
                abrBandWidthUpFactor: 0.5, // Slow to upgrade quality
                abrMaxWithRealBitrate: true,

                // More retries for reliability
                nudgeMaxRetry: 10,
                fragLoadingMaxRetry: 10,
                manifestLoadingMaxRetry: 6,
                levelLoadingMaxRetry: 6,
                fragLoadingTimeOut: 30000, // 30 second timeout
                manifestLoadingTimeOut: 30000,
            });

            hls.loadSource(playbackUrl);
            hls.attachMedia(video);

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                video.play().catch(() => {
                    // Autoplay blocked - user needs to interact
                });
            });

            // Track buffering state
            hls.on(Hls.Events.FRAG_LOADING, () => {
                setIsBuffering(true);
            });

            hls.on(Hls.Events.FRAG_LOADED, () => {
                setIsBuffering(false);
            });

            // Handle buffer stalls - skip ahead to live edge
            hls.on(Hls.Events.ERROR, (_event, data) => {
                if (data.fatal) {
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            console.log('Network error, attempting recovery...');
                            hls.startLoad();
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            console.log('Media error, attempting recovery...');
                            hls.recoverMediaError();
                            break;
                        default:
                            console.log('Fatal error, destroying and reloading...');
                            hls.destroy();
                            break;
                    }
                } else if (data.details === 'bufferStalledError') {
                    // Skip to live edge on stall
                    if (hls.liveSyncPosition) {
                        video.currentTime = hls.liveSyncPosition;
                    }
                }
            });

            // Keep video at live edge
            hls.on(Hls.Events.FRAG_BUFFERED, () => {
                if (hls.liveSyncPosition && video.currentTime < hls.liveSyncPosition - 10) {
                    video.currentTime = hls.liveSyncPosition - 2;
                }
            });

            hlsRef.current = hls;
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            // Native HLS support (Safari)
            video.src = playbackUrl;
            video.addEventListener('loadedmetadata', () => {
                video.play().catch(() => {});
            });
        }

        // Video element event listeners for buffering state
        const handleWaiting = () => setIsBuffering(true);
        const handlePlaying = () => setIsBuffering(false);
        const handleCanPlay = () => setIsBuffering(false);

        video.addEventListener('waiting', handleWaiting);
        video.addEventListener('playing', handlePlaying);
        video.addEventListener('canplay', handleCanPlay);

        return () => {
            video.removeEventListener('waiting', handleWaiting);
            video.removeEventListener('playing', handlePlaying);
            video.removeEventListener('canplay', handleCanPlay);
            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
        };
    }, [streamData.isLive, getPlaybackUrl]);

    // Poll for stream updates
    useEffect(() => {
        fetchStreamData();
        const interval = setInterval(fetchStreamData, 30000); // Check every 30 seconds
        return () => clearInterval(interval);
    }, [fetchStreamData]);

    const playbackUrl = getPlaybackUrl();

    return (
        <Flex
            fillWidth
            direction="column"
            gap="l"
            className={styles.livestreamContainer}>
            <Flex direction="column" gap="s">
                <Heading variant="display-strong-s">
                    24/7 Coding Livestream
                </Heading>
                <Text onBackground="neutral-weak" variant="body-default-m">
                    Watch BearifiedCo being built in real-time on pump.fun. Every line of code, every commit, complete transparency.
                </Text>
            </Flex>

            {/* Video Player or Placeholder */}
            <Flex
                fillWidth
                className={styles.streamWrapper}
                position="relative"
                border="neutral-medium"
                radius="l"
                overflow="hidden">

                {streamData.isLive && playbackUrl ? (
                    // Live Video Player
                    <>
                        <video
                            ref={videoRef}
                            className={styles.videoPlayer}
                            controls
                            playsInline
                            muted
                            poster={streamData.thumbnail}
                            preload="auto"
                        />
                        {isBuffering && (
                            <Flex
                                className={styles.bufferingOverlay}
                                alignItems="center"
                                justifyContent="center"
                                direction="column"
                                gap="m">
                                <div className={styles.spinner} />
                                <Text variant="label-default-s" style={{ color: 'white' }}>
                                    Buffering...
                                </Text>
                            </Flex>
                        )}
                        <Flex
                            className={styles.liveIndicator}
                            gap="8"
                            alignItems="center"
                            paddingX="12"
                            paddingY="8"
                            radius="s">
                            <span className={styles.liveDot} />
                            <Text variant="label-strong-s" style={{ color: 'white' }}>
                                LIVE {streamData.viewerCount ? `• ${streamData.viewerCount} watching` : ''}
                            </Text>
                        </Flex>
                        <Flex
                            className={styles.qualitySelector}
                            gap="4"
                            alignItems="center"
                            paddingX="8"
                            paddingY="4"
                            radius="s">
                            {(['low', 'medium', 'high'] as QualityLevel[]).map((q) => (
                                <button
                                    key={q}
                                    onClick={() => setQuality(q)}
                                    className={`${styles.qualityBtn} ${quality === q ? styles.qualityBtnActive : ''}`}>
                                    {q === 'low' ? '360p' : q === 'medium' ? '720p' : '1080p'}
                                </button>
                            ))}
                        </Flex>
                    </>
                ) : (
                    // Offline Placeholder - Links to pump.fun
                    <a
                        href={bearco.pumpFunUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.streamLink}>
                        <div className={styles.streamPreview}>
                            {streamData.thumbnail ? (
                                <img
                                    src={streamData.thumbnail}
                                    alt="Stream thumbnail"
                                    className={styles.thumbnailBg}
                                />
                            ) : (
                                <>
                                    <div className={styles.gradientBg} />
                                    <div className={styles.scanLine} />
                                </>
                            )}

                            {/* Center Play Button */}
                            <Flex
                                className={styles.playButton}
                                alignItems="center"
                                justifyContent="center">
                                <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                                    <circle cx="40" cy="40" r="38" stroke="currentColor" strokeWidth="2" opacity="0.5"/>
                                    <circle cx="40" cy="40" r="38" stroke="url(#playGradient)" strokeWidth="2"/>
                                    <path d="M32 25L56 40L32 55V25Z" fill="currentColor"/>
                                    <defs>
                                        <linearGradient id="playGradient" x1="0" y1="0" x2="80" y2="80">
                                            <stop stopColor="var(--brand-solid-strong)"/>
                                            <stop offset="1" stopColor="var(--accent-solid-strong)"/>
                                        </linearGradient>
                                    </defs>
                                </svg>
                            </Flex>

                            {/* Stream Info Overlay */}
                            <Flex
                                className={styles.streamInfo}
                                direction="column"
                                gap="8"
                                padding="l">
                                <Text variant="heading-strong-l" style={{ color: 'white' }}>
                                    {streamData.isLive ? (streamData.streamTitle || '$BEARCO Live') : '$BEARCO on pump.fun'}
                                </Text>
                                <Text variant="body-default-m" style={{ color: 'rgba(255,255,255,0.7)' }}>
                                    {isLoading ? 'Checking stream status...' : 'Click to watch on pump.fun'}
                                </Text>
                            </Flex>
                        </div>

                        <Flex
                            className={styles.offlineIndicator}
                            gap="8"
                            alignItems="center"
                            paddingX="12"
                            paddingY="8"
                            radius="s">
                            <Text variant="label-strong-s" style={{ color: 'white' }}>
                                {streamData.isLive ? 'LOADING STREAM...' : 'WATCH ON PUMP.FUN'}
                            </Text>
                        </Flex>
                    </a>
                )}
            </Flex>

            <Flex gap="m" wrap>
                <Button
                    href={bearco.pumpFunUrl}
                    variant="primary"
                    size="l"
                    suffixIcon="arrowUpRight">
                    {streamData.isLive ? 'Open in pump.fun' : 'Watch on pump.fun'}
                </Button>
                <Button
                    href={`https://solscan.io/token/${bearco.tokenAddress}`}
                    variant="secondary"
                    size="l"
                    suffixIcon="arrowUpRight">
                    View $BEARCO Token
                </Button>
            </Flex>

            <Flex
                fillWidth
                padding="l"
                gap="l"
                background="surface"
                radius="l"
                border="neutral-medium"
                direction="column">
                <Flex gap="xl" wrap>
                    <Flex direction="column" gap="4">
                        <Text variant="label-default-s" onBackground="neutral-weak">Token</Text>
                        <Text variant="heading-strong-m">$BEARCO</Text>
                    </Flex>
                    <Flex direction="column" gap="4">
                        <Text variant="label-default-s" onBackground="neutral-weak">Chain</Text>
                        <Text variant="heading-strong-m">Solana</Text>
                    </Flex>
                    <Flex direction="column" gap="4">
                        <Text variant="label-default-s" onBackground="neutral-weak">Platform</Text>
                        <Text variant="heading-strong-m">pump.fun</Text>
                    </Flex>
                    <Flex direction="column" gap="4">
                        <Text variant="label-default-s" onBackground="neutral-weak">Status</Text>
                        <Text variant="heading-strong-m" style={{ color: streamData.isLive ? 'var(--accent-solid-strong)' : 'var(--neutral-on-background-weak)' }}>
                            {isLoading ? '...' : streamData.isLive ? 'LIVE' : 'Offline'}
                        </Text>
                    </Flex>
                    {streamData.isLive && streamData.viewerCount !== undefined && (
                        <Flex direction="column" gap="4">
                            <Text variant="label-default-s" onBackground="neutral-weak">Viewers</Text>
                            <Text variant="heading-strong-m">{streamData.viewerCount}</Text>
                        </Flex>
                    )}
                </Flex>
                <Flex direction="column" gap="4">
                    <Text variant="label-default-s" onBackground="neutral-weak">Contract Address</Text>
                    <Text
                        variant="body-default-s"
                        onBackground="neutral-medium"
                        style={{ fontFamily: 'var(--font-code)', wordBreak: 'break-all' }}>
                        {bearco.tokenAddress}
                    </Text>
                </Flex>
            </Flex>
        </Flex>
    );
};
