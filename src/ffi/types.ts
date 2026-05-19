/************************************************************************
 *    Copyright (C) 2025 Code Forge Temple                              *
 *    This file is part of serial-kit project                           *
 *    See the LICENSE file in the project root for license details.     *
 ************************************************************************/

import { isDarwin, isLinux } from '../utils/platform.ts'

/**
 * Native aliases
 */
export type NativeFileDescriptor = number
export type NativeErrno = number
export type NativeSpeed = number
export type NativeBuffer = Uint8Array

// --------------------------------------------------
// TERMIOS STRUCT SIZE
// --------------------------------------------------

export const TERMIOS_SIZE =
  isDarwin()
    ? 72
    : isLinux()
      ? 60
      : 0

// --------------------------------------------------
// ERRNO
// --------------------------------------------------

export const ERRNO = {
  SUCCESS: 0,
  EPERM: 1,
  ENOENT: 2,
  EINTR: 4,
  EIO: 5,
  ENXIO: 6,
  EBADF: 9,
  EAGAIN: 11,
  EACCES: 13,
  EBUSY: 16,
  ENODEV: 19,
  EINVAL: 22,
  ENOTTY: 25,
  ENOSYS: 38,

  EWOULDBLOCK: 11,
  EAGAIN_MACOS: 35,
} as const

// --------------------------------------------------
// OPEN FLAGS
// --------------------------------------------------

export const O_FLAGS = {
  O_RDONLY: 0x0000,
  O_WRONLY: 0x0001,
  O_RDWR: 0x0002,
  O_CREAT: 0x0040,
  O_EXCL: 0x0080,
  O_NOCTTY: 0x0100,
  O_TRUNC: 0x0200,
  O_APPEND: 0x0400,
  O_NONBLOCK: 0x0800,
  O_SYNC: 0x101000,
} as const

// --------------------------------------------------
// IOCTL CONSTANTS
// --------------------------------------------------

export const IOCTL = isDarwin()
  ? {
    TIOCMGET: 0x4004746a,
    TIOCMSET: 0x8004746d,
    TIOCEXCL: 0x2000740d,
    TIOCNXCL: 0x2000740e,
  }
  : {
    TIOCMGET: 0x5415,
    TIOCMSET: 0x5418,
    TIOCEXCL: 0x540c,
    TIOCNXCL: 0x540d,
  }

// --------------------------------------------------
// MODEM FLAGS
// --------------------------------------------------

export const TIOCM = {
  TIOCM_LE: 0x001,
  TIOCM_DTR: 0x002,
  TIOCM_RTS: 0x004,
  TIOCM_ST: 0x008,
  TIOCM_SR: 0x010,
  TIOCM_CTS: 0x020,
  TIOCM_CAR: 0x040,
  TIOCM_RNG: 0x080,
  TIOCM_DSR: 0x100,
  TIOCM_CD: 0x040,
  TIOCM_RI: 0x080,
} as const

// --------------------------------------------------
// FLUSH
// --------------------------------------------------

export const FLUSH = {
  TCIFLUSH: 0,
  TCOFLUSH: 1,
  TCIOFLUSH: 2,
} as const