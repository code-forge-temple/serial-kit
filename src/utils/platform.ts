/************************************************************************
 *    Copyright (C) 2025 Code Forge Temple                              *
 *    This file is part of serial-kit project                           *
 *    See the LICENSE file in the project root for license details.     *
 ************************************************************************/

/**
 * Platform detection utilities for cross-platform serial port support.
 */

export type Platform = 'darwin' | 'linux' | 'windows'

/**
 * Get current runtime platform.
 */
export function getPlatform(): Platform {
    const os = Deno.build.os

    switch (os) {
        case 'darwin':
            return 'darwin'
        case 'linux':
            return 'linux'
        case 'windows':
            return 'windows'
        default:
            throw new Error(`Unsupported platform: ${os}`)
    }
}

/**
 * Platform checks
 */
export function isWindows(): boolean {
    return Deno.build.os === 'windows'
}

export function isLinux(): boolean {
    return Deno.build.os === 'linux'
}

export function isDarwin(): boolean {
    return Deno.build.os === 'darwin'
}

/**
 * Device path prefix helper (useful for discovery tools)
 */
export function getDevicePathPrefix(): string {
    switch (getPlatform()) {
        case 'darwin':
            return '/dev/cu.'
        case 'linux':
            return '/dev/tty'
        case 'windows':
            return 'COM'
    }
}

/**
 * Validate if a path looks like a serial port
 */
export function isValidSerialPortPath(path: string): boolean {
    switch (getPlatform()) {
        case 'darwin':
            return path.startsWith('/dev/cu.') || path.startsWith('/dev/tty.')
        case 'linux':
            return (
                path.startsWith('/dev/ttyS') ||
                path.startsWith('/dev/ttyUSB') ||
                path.startsWith('/dev/ttyACM')
            )
        case 'windows':
            return /^COM\d+$/i.test(path)
    }
}

/**
 * Platform capability flags (useful later for feature detection)
 */
export interface PlatformCapabilities {
    supportsTermios: boolean
    supportsIoctl: boolean
    supportsOverlappedIO: boolean
    supportsSignals: boolean
}

/**
 * Get platform capabilities
 */
export function getPlatformCapabilities(): PlatformCapabilities {
    switch (getPlatform()) {
        case 'darwin':
        case 'linux':
            return {
                supportsTermios: true,
                supportsIoctl: true,
                supportsOverlappedIO: false,
                supportsSignals: true,
            }

        case 'windows':
            return {
                supportsTermios: false,
                supportsIoctl: false,
                supportsOverlappedIO: true,
                supportsSignals: false, // partially supported via WinAPI
            }
    }
}
