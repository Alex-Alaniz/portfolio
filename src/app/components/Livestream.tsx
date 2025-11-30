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
    hlsPlaybackUrlMedium?: string;
    hlsPlaybackUrlLow?: string;
    viewerCount?: number;
    streamerName?: string;
    streamTitle?: string;
    thumbnail?: string;
    marketCap?: number;
    source?: 'livepeer' | 'pumpfun' | 'none' | 'error';
    isHD?: boolean;
}

interface StreamStats {
    bitrate: number;
    resolution: string;
    fps: number;
    droppedFrames: number;
    latency: number;
}

type QualityLevel = 'auto' | 'low' | 'medium' | 'high';

const formatMarketCap = (marketCap?: number): string => {
    if (!marketCap) return '--';
    if (marketCap >= 1_000_000) {
        return `$${(marketCap / 1_000_000).toFixed(2)}M`;
    }
    if (marketCap >= 1_000) {
        return `$${(marketCap / 1_000).toFixed(1)}K`;
    }
    return `$${marketCap.toFixed(0)}`;
};

const formatBitrate = (bitrate: number): string => {
    if (bitrate >= 1000) {
        return `${(bitrate / 1000).toFixed(1)} Mbps`;
    }
    return `${bitrate.toFixed(0)} Kbps`;
};

export const Livestream = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<Hls | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [streamData, setStreamData] = useState<StreamData>({ isLive: false });
    const [isLoading, setIsLoading] = useState(true);
    const [quality, setQuality] = useState<QualityLevel>('auto');
    const [isBuffering, setIsBuffering] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [volume, setVolume] = useState(0.8);
    const [showControls, setShowControls] = useState(false);
    const [showVolumeSlider, setShowVolumeSlider] = useState(false);
    const [showStats, setShowStats] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPiP, setIsPiP] = useState(false);
    const [streamStats, setStreamStats] = useState<StreamStats>({
        bitrate: 0,
        resolution: '--',
        fps: 0,
        droppedFrames: 0,
        latency: 0,
    });
    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const statsIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Fetch stream data from our API route
    const fetchStreamData = useCallback(async () => {
        try {
            const response = await fetch('/api/stream');

            if (!response.ok) {
                throw new Error('Failed to fetch stream data');
            }

            const data = await response.json();

            if (data.isLive && (data.playlistUrl || data.playlistUrlHigh)) {
                setStreamData({
                    isLive: true,
                    hlsPlaybackUrl: data.playlistUrl,
                    hlsPlaybackUrlHigh: data.playlistUrlHigh,
                    hlsPlaybackUrlMedium: data.playlistUrlMedium,
                    hlsPlaybackUrlLow: data.playlistUrlLow,
                    viewerCount: data.viewerCount,
                    streamerName: data.name || '$BEARCO',
                    streamTitle: data.streamTitle,
                    thumbnail: data.thumbnail,
                    marketCap: data.marketCap,
                    source: data.source,
                    isHD: data.isHD,
                });
            } else {
                setStreamData({
                    isLive: data.isLive || false,
                    thumbnail: data.thumbnail,
                    streamerName: data.name || '$BEARCO',
                    marketCap: data.marketCap,
                    source: data.source,
                    isHD: false,
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
                return streamData.hlsPlaybackUrlMedium || streamData.hlsPlaybackUrl;
            case 'low':
                return streamData.hlsPlaybackUrlLow || streamData.hlsPlaybackUrl;
            case 'auto':
            default:
                return streamData.hlsPlaybackUrl;
        }
    }, [quality, streamData]);

    // Copy contract address to clipboard
    const copyContractAddress = async () => {
        try {
            await navigator.clipboard.writeText(bearco.tokenAddress);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    // Handle mouse movement for controls visibility
    const handleMouseMove = () => {
        setShowControls(true);
        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
        }
        controlsTimeoutRef.current = setTimeout(() => {
            setShowControls(false);
            setShowVolumeSlider(false);
        }, 3000);
    };

    // Toggle mute
    const toggleMute = () => {
        if (videoRef.current) {
            if (isMuted) {
                videoRef.current.muted = false;
                videoRef.current.volume = volume;
                setIsMuted(false);
            } else {
                videoRef.current.muted = true;
                setIsMuted(true);
            }
        }
    };

    // Handle volume change
    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (videoRef.current) {
            videoRef.current.volume = newVolume;
            if (newVolume === 0) {
                setIsMuted(true);
                videoRef.current.muted = true;
            } else if (isMuted) {
                setIsMuted(false);
                videoRef.current.muted = false;
            }
        }
    };

    // Toggle fullscreen
    const toggleFullscreen = () => {
        if (!containerRef.current) return;

        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            containerRef.current.requestFullscreen();
        }
    };

    // Toggle Picture-in-Picture
    const togglePiP = async () => {
        if (!videoRef.current) return;

        try {
            if (document.pictureInPictureElement) {
                await document.exitPictureInPicture();
                setIsPiP(false);
            } else if (document.pictureInPictureEnabled) {
                await videoRef.current.requestPictureInPicture();
                setIsPiP(true);
            }
        } catch (err) {
            console.error('PiP error:', err);
        }
    };

    // Toggle play/pause
    const togglePlay = () => {
        if (videoRef.current) {
            if (videoRef.current.paused) {
                videoRef.current.play();
            } else {
                videoRef.current.pause();
            }
        }
    };

    // Update stream statistics
    const updateStats = useCallback(() => {
        if (!videoRef.current || !hlsRef.current) return;

        const video = videoRef.current;
        const hls = hlsRef.current;

        // Get current level info
        const currentLevel = hls.levels[hls.currentLevel];
        const resolution = currentLevel
            ? `${currentLevel.width}x${currentLevel.height}`
            : '--';
        const bitrate = currentLevel ? currentLevel.bitrate / 1000 : 0;

        // Get video quality info
        const videoQuality = video.getVideoPlaybackQuality?.();
        const droppedFrames = videoQuality?.droppedVideoFrames || 0;

        // Estimate latency
        const latency = hls.liveSyncPosition
            ? Math.max(0, hls.liveSyncPosition - video.currentTime)
            : 0;

        setStreamStats({
            bitrate,
            resolution,
            fps: currentLevel?.frameRate || 30,
            droppedFrames,
            latency,
        });
    }, []);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Only handle if not typing in an input
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            // Check if video player is in viewport or fullscreen
            if (!containerRef.current) return;

            switch (e.key.toLowerCase()) {
                case ' ':
                case 'k':
                    e.preventDefault();
                    togglePlay();
                    break;
                case 'm':
                    e.preventDefault();
                    toggleMute();
                    break;
                case 'f':
                    e.preventDefault();
                    toggleFullscreen();
                    break;
                case 'p':
                    e.preventDefault();
                    togglePiP();
                    break;
                case 's':
                    e.preventDefault();
                    setShowStats(prev => !prev);
                    break;
                case 'arrowup':
                    e.preventDefault();
                    setVolume(prev => {
                        const newVol = Math.min(1, prev + 0.1);
                        if (videoRef.current) {
                            videoRef.current.volume = newVol;
                            if (newVol > 0 && isMuted) {
                                videoRef.current.muted = false;
                                setIsMuted(false);
                            }
                        }
                        return newVol;
                    });
                    break;
                case 'arrowdown':
                    e.preventDefault();
                    setVolume(prev => {
                        const newVol = Math.max(0, prev - 0.1);
                        if (videoRef.current) {
                            videoRef.current.volume = newVol;
                            if (newVol === 0) {
                                videoRef.current.muted = true;
                                setIsMuted(true);
                            }
                        }
                        return newVol;
                    });
                    break;
                case '1':
                    e.preventDefault();
                    setQuality('low');
                    break;
                case '2':
                    e.preventDefault();
                    setQuality('medium');
                    break;
                case '3':
                    e.preventDefault();
                    setQuality('high');
                    break;
                case '0':
                    e.preventDefault();
                    setQuality('auto');
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isMuted]);

    // Initialize HLS player when stream is live
    useEffect(() => {
        const playbackUrl = getPlaybackUrl();

        if (!streamData.isLive || !playbackUrl || !videoRef.current) {
            return;
        }

        const video = videoRef.current;

        if (Hls.isSupported()) {
            const hls = new Hls({
                enableWorker: true,
                // Low latency mode for faster start and less buffering
                lowLatencyMode: true,

                // REDUCED buffer sizes to minimize buffering time
                maxBufferLength: 10,           // Only buffer 10 seconds ahead (was 30-60)
                maxMaxBufferLength: 20,        // Max 20 seconds during seek (was 60-120)
                maxBufferSize: 30 * 1000 * 1000, // 30MB buffer max (was 120MB)
                maxBufferHole: 0.5,            // Tolerate 0.5 second gaps (was 1)

                // Minimal back buffer
                backBufferLength: 10,          // Keep only 10 seconds back (was 30)

                // Live sync - stay close to live edge
                liveSyncDuration: 3,           // 3 seconds behind live (was 3-6)
                liveMaxLatencyDuration: 8,     // Max 8 seconds behind (was 8-15)
                liveDurationInfinity: true,
                liveBackBufferLength: 0,       // No back buffer for live

                // Start immediately at best quality we can handle
                startLevel: -1,                // Auto-select based on bandwidth
                capLevelToPlayerSize: true,    // Don't download larger than display

                // More aggressive ABR for faster quality switches
                abrEwmaDefaultEstimate: 3000000, // Assume 3Mbps to start
                abrBandWidthFactor: 0.9,       // Use 90% of measured bandwidth
                abrBandWidthUpFactor: 0.7,     // Quick to upgrade quality
                abrMaxWithRealBitrate: true,

                // Fast recovery settings
                nudgeMaxRetry: 5,              // Fewer retries (was 10)
                fragLoadingMaxRetry: 4,        // Fewer retries (was 10)
                manifestLoadingMaxRetry: 3,    // Fewer retries (was 6)
                levelLoadingMaxRetry: 3,       // Fewer retries (was 6)
                fragLoadingTimeOut: 10000,     // 10 second timeout (was 30)
                manifestLoadingTimeOut: 10000, // 10 second timeout (was 30)

                // Progressive loading for faster start
                progressive: true,

                // Faster level switching
                nextLoadLevel: -1,
            });

            hls.loadSource(playbackUrl);
            hls.attachMedia(video);

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                // Start playing immediately
                setIsBuffering(false);
                video.play().then(() => {
                    setIsPlaying(true);
                }).catch(() => {
                    setIsPlaying(false);
                });
            });

            // Only show buffering on actual stalls, not during normal loading
            hls.on(Hls.Events.BUFFER_STALLED_ERROR, () => {
                setIsBuffering(true);
            });

            hls.on(Hls.Events.FRAG_BUFFERED, () => {
                // Fragment buffered successfully, we're good
                setIsBuffering(false);
            });

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
                    if (hls.liveSyncPosition) {
                        video.currentTime = hls.liveSyncPosition;
                    }
                }
            });

            // Periodically sync to live edge if we fall behind
            hls.on(Hls.Events.LEVEL_LOADED, () => {
                if (hls.liveSyncPosition && video.currentTime < hls.liveSyncPosition - 10) {
                    video.currentTime = hls.liveSyncPosition - 2;
                }
            });

            hlsRef.current = hls;

            // Start stats interval
            statsIntervalRef.current = setInterval(updateStats, 1000);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = playbackUrl;
            video.addEventListener('loadedmetadata', () => {
                video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
            });
        }

        const handleWaiting = () => setIsBuffering(true);
        const handlePlaying = () => {
            setIsBuffering(false);
            setIsPlaying(true);
        };
        const handleCanPlay = () => setIsBuffering(false);
        const handlePause = () => setIsPlaying(false);
        const handleLeavePiP = () => setIsPiP(false);
        const handleEnterPiP = () => setIsPiP(true);

        video.addEventListener('waiting', handleWaiting);
        video.addEventListener('playing', handlePlaying);
        video.addEventListener('canplay', handleCanPlay);
        video.addEventListener('pause', handlePause);
        video.addEventListener('leavepictureinpicture', handleLeavePiP);
        video.addEventListener('enterpictureinpicture', handleEnterPiP);

        return () => {
            video.removeEventListener('waiting', handleWaiting);
            video.removeEventListener('playing', handlePlaying);
            video.removeEventListener('canplay', handleCanPlay);
            video.removeEventListener('pause', handlePause);
            video.removeEventListener('leavepictureinpicture', handleLeavePiP);
            video.removeEventListener('enterpictureinpicture', handleEnterPiP);
            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
            if (statsIntervalRef.current) {
                clearInterval(statsIntervalRef.current);
            }
        };
    }, [streamData.isLive, streamData.isHD, getPlaybackUrl, quality, updateStats]);

    // Poll for stream updates
    useEffect(() => {
        fetchStreamData();
        const interval = setInterval(fetchStreamData, 30000);
        return () => clearInterval(interval);
    }, [fetchStreamData]);

    // Cleanup controls timeout
    useEffect(() => {
        return () => {
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
            }
        };
    }, []);

    const playbackUrl = getPlaybackUrl();

    // Volume icon based on level
    const VolumeIcon = () => {
        if (isMuted || volume === 0) {
            return (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                </svg>
            );
        }
        if (volume < 0.5) {
            return (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                </svg>
            );
        }
        return (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
            </svg>
        );
    };

    return (
        <Flex
            fillWidth
            direction="column"
            gap="l"
            className={styles.livestreamContainer}>
            <Flex direction="column" gap="s">
                <Flex alignItems="center" gap="m">
                    <Heading variant="display-strong-s">
                        24/7 Coding Livestream
                    </Heading>
                    {streamData.isHD && (
                        <span className={styles.hdBadge}>HD</span>
                    )}
                </Flex>
                <Text onBackground="neutral-weak" variant="body-default-m">
                    Watch BearifiedCo being built in real-time. Every line of code, every commit, complete transparency.
                    {streamData.source === 'livepeer' && ' Streaming in HD directly from OBS.'}
                </Text>
            </Flex>

            {/* Video Player or Placeholder */}
            <div
                ref={containerRef}
                className={styles.streamWrapper}
                onMouseMove={handleMouseMove}
                onMouseLeave={() => {
                    setShowControls(false);
                    setShowVolumeSlider(false);
                }}>
                <Flex
                    fillWidth
                    position="relative"
                    border="neutral-medium"
                    radius="l"
                    overflow="hidden"
                    style={{ aspectRatio: '16/9' }}>

                    {streamData.isLive && playbackUrl ? (
                        <>
                            <video
                                ref={videoRef}
                                className={styles.videoPlayer}
                                playsInline
                                muted={isMuted}
                                poster={streamData.thumbnail}
                                preload="auto"
                                onClick={togglePlay}
                            />

                            {/* Stream Stats Overlay */}
                            {showStats && (
                                <div className={styles.statsOverlay}>
                                    <div className={styles.statsContent}>
                                        <div className={styles.statRow}>
                                            <span>Resolution:</span>
                                            <span>{streamStats.resolution}</span>
                                        </div>
                                        <div className={styles.statRow}>
                                            <span>Bitrate:</span>
                                            <span>{formatBitrate(streamStats.bitrate)}</span>
                                        </div>
                                        <div className={styles.statRow}>
                                            <span>FPS:</span>
                                            <span>{streamStats.fps}</span>
                                        </div>
                                        <div className={styles.statRow}>
                                            <span>Latency:</span>
                                            <span>{streamStats.latency.toFixed(1)}s</span>
                                        </div>
                                        <div className={styles.statRow}>
                                            <span>Dropped:</span>
                                            <span>{streamStats.droppedFrames}</span>
                                        </div>
                                        <div className={styles.statRow}>
                                            <span>Source:</span>
                                            <span>{streamData.source}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Buffering Overlay */}
                            {isBuffering && (
                                <Flex
                                    className={styles.bufferingOverlay}
                                    alignItems="center"
                                    justifyContent="center"
                                    direction="column"
                                    gap="m">
                                    <div className={styles.spinner} />
                                    <Text variant="label-default-s" style={{ color: 'white' }}>
                                        {streamData.isHD ? 'Loading HD Stream...' : 'Buffering...'}
                                    </Text>
                                </Flex>
                            )}

                            {/* Click to Play Overlay */}
                            {!isPlaying && !isBuffering && (
                                <Flex
                                    className={styles.playOverlay}
                                    alignItems="center"
                                    justifyContent="center"
                                    onClick={() => videoRef.current?.play()}>
                                    <div className={styles.playButtonLarge}>
                                        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                                            <circle cx="40" cy="40" r="38" fill="rgba(0,0,0,0.6)" stroke="white" strokeWidth="2"/>
                                            <path d="M32 25L56 40L32 55V25Z" fill="white"/>
                                        </svg>
                                    </div>
                                </Flex>
                            )}

                            {/* Live Indicator with HD badge */}
                            <Flex
                                className={styles.liveIndicator}
                                gap="8"
                                alignItems="center"
                                paddingX="12"
                                paddingY="8"
                                radius="s">
                                <span className={styles.liveDot} />
                                <Text variant="label-strong-s" style={{ color: 'white' }}>
                                    LIVE {streamData.isHD && '• HD'} {streamData.viewerCount ? `• ${streamData.viewerCount} watching` : ''}
                                </Text>
                            </Flex>

                            {/* Keyboard Shortcuts Hint */}
                            {showControls && (
                                <div className={styles.shortcutsHint}>
                                    <span>K: Play/Pause</span>
                                    <span>M: Mute</span>
                                    <span>F: Fullscreen</span>
                                    <span>P: PiP</span>
                                    <span>S: Stats</span>
                                </div>
                            )}

                            {/* Custom Controls Bar */}
                            <Flex
                                className={`${styles.controlsBar} ${showControls ? styles.controlsVisible : ''}`}
                                gap="m"
                                alignItems="center"
                                justifyContent="space-between"
                                paddingX="16"
                                paddingY="12">
                                <Flex gap="m" alignItems="center">
                                    {/* Play/Pause */}
                                    <button
                                        onClick={togglePlay}
                                        className={styles.controlBtn}
                                        title={isPlaying ? 'Pause (K)' : 'Play (K)'}>
                                        {isPlaying ? (
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                                            </svg>
                                        ) : (
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M8 5v14l11-7z"/>
                                            </svg>
                                        )}
                                    </button>

                                    {/* Volume with Slider */}
                                    <div
                                        className={styles.volumeControl}
                                        onMouseEnter={() => setShowVolumeSlider(true)}
                                        onMouseLeave={() => setShowVolumeSlider(false)}>
                                        <button
                                            onClick={toggleMute}
                                            className={styles.controlBtn}
                                            title={isMuted ? 'Unmute (M)' : 'Mute (M)'}>
                                            <VolumeIcon />
                                        </button>
                                        <div className={`${styles.volumeSliderWrapper} ${showVolumeSlider ? styles.volumeSliderVisible : ''}`}>
                                            <input
                                                type="range"
                                                min="0"
                                                max="1"
                                                step="0.01"
                                                value={isMuted ? 0 : volume}
                                                onChange={handleVolumeChange}
                                                className={styles.volumeSlider}
                                                title={`Volume: ${Math.round(volume * 100)}%`}
                                            />
                                        </div>
                                    </div>

                                    {/* Quality Selector */}
                                    <Flex gap="4" alignItems="center" className={styles.qualitySelector}>
                                        {(['auto', 'low', 'medium', 'high'] as QualityLevel[]).map((q) => (
                                            <button
                                                key={q}
                                                onClick={() => setQuality(q)}
                                                className={`${styles.qualityBtn} ${quality === q ? styles.qualityBtnActive : ''}`}
                                                title={`${q === 'auto' ? 'Auto (0)' : q === 'low' ? '360p (1)' : q === 'medium' ? '720p (2)' : '1080p (3)'}`}>
                                                {q === 'auto' ? 'Auto' : q === 'low' ? '360p' : q === 'medium' ? '720p' : '1080p'}
                                            </button>
                                        ))}
                                    </Flex>
                                </Flex>

                                <Flex gap="m" alignItems="center">
                                    {/* Stats Toggle */}
                                    <button
                                        onClick={() => setShowStats(!showStats)}
                                        className={`${styles.controlBtn} ${showStats ? styles.controlBtnActive : ''}`}
                                        title="Toggle Stats (S)">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                                        </svg>
                                    </button>

                                    {/* Picture-in-Picture */}
                                    <button
                                        onClick={togglePiP}
                                        className={`${styles.controlBtn} ${isPiP ? styles.controlBtnActive : ''}`}
                                        title="Picture-in-Picture (P)">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M19 7h-8v6h8V7zm2-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14z"/>
                                        </svg>
                                    </button>

                                    {/* Fullscreen */}
                                    <button
                                        onClick={toggleFullscreen}
                                        className={styles.controlBtn}
                                        title="Fullscreen (F)">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                                        </svg>
                                    </button>
                                </Flex>
                            </Flex>
                        </>
                    ) : (
                        // Offline Placeholder
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
            </div>

            {/* Action Buttons */}
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
                    View Token
                </Button>
            </Flex>

            {/* Token Info Panel */}
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
                        <Text variant="label-default-s" onBackground="neutral-weak">Market Cap</Text>
                        <Text variant="heading-strong-m" style={{ color: 'var(--accent-solid-strong)' }}>
                            {formatMarketCap(streamData.marketCap)}
                        </Text>
                    </Flex>
                    <Flex direction="column" gap="4">
                        <Text variant="label-default-s" onBackground="neutral-weak">Status</Text>
                        <Flex alignItems="center" gap="8">
                            <Text
                                variant="heading-strong-m"
                                style={{ color: streamData.isLive ? 'var(--accent-solid-strong)' : 'var(--neutral-on-background-weak)' }}>
                                {isLoading ? '...' : streamData.isLive ? 'LIVE' : 'Offline'}
                            </Text>
                            {streamData.isHD && streamData.isLive && (
                                <span className={styles.hdBadgeSmall}>HD</span>
                            )}
                        </Flex>
                    </Flex>
                    {streamData.isLive && streamData.viewerCount !== undefined && (
                        <Flex direction="column" gap="4">
                            <Text variant="label-default-s" onBackground="neutral-weak">Viewers</Text>
                            <Text variant="heading-strong-m">{streamData.viewerCount}</Text>
                        </Flex>
                    )}
                </Flex>

                {/* Contract Address with Copy */}
                <Flex direction="column" gap="8">
                    <Text variant="label-default-s" onBackground="neutral-weak">Contract Address</Text>
                    <Flex
                        alignItems="center"
                        gap="m"
                        className={styles.contractAddress}
                        onClick={copyContractAddress}>
                        <Text
                            variant="body-default-s"
                            onBackground="neutral-medium"
                            style={{ fontFamily: 'var(--font-code)', wordBreak: 'break-all' }}>
                            {bearco.tokenAddress}
                        </Text>
                        <button className={styles.copyBtn} title="Copy to clipboard">
                            {copied ? (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                                </svg>
                            ) : (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                                </svg>
                            )}
                        </button>
                        {copied && (
                            <Text variant="label-default-s" style={{ color: 'var(--accent-solid-strong)' }}>
                                Copied!
                            </Text>
                        )}
                    </Flex>
                </Flex>
            </Flex>
        </Flex>
    );
};
