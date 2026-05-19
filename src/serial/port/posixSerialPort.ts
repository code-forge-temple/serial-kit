/************************************************************************
 *    Copyright (C) 2025 Code Forge Temple                              *
 *    This file is part of serial-kit project                           *
 *    See the LICENSE file in the project root for license details.     *
 ************************************************************************/

import {
    open,
    read,
    write,
    close,
    tcgetattr,
    tcsetattr,
    tcflush,
    cfsetispeed,
    cfsetospeed,
} from '../../ffi/libc.ts'
import {
    createTermiosBuffer,
    parseTermios,
    makeRaw,
    getBaudRateValue,
    writeTermios,
    TCSA,
    CFLAG,
    IFLAG,
} from '../../ffi/termios.ts'
import { FLUSH, O_FLAGS } from '../../ffi/types.ts'
import type { SerialBackend, SerialPortOptions } from './common.ts'


export class PosixSerialPort implements SerialBackend {
    private fd: number | null = null
    private original: ArrayBuffer | null = null

    constructor(private options: SerialPortOptions) { }

    // -------------------------
    // OPEN
    // -------------------------
    open(): void {
        const flags =
            O_FLAGS.O_RDWR |
            O_FLAGS.O_NOCTTY |
            O_FLAGS.O_NONBLOCK

        this.fd = open(this.options.path, flags)

        this.original = createTermiosBuffer()
        tcgetattr(this.fd, this.original)

        this.configure()
    }

    // -------------------------
    // CONFIGURE
    // -------------------------
    private configure(): void {
        if (this.fd === null) return

        const buf = createTermiosBuffer()

        tcgetattr(this.fd, buf)

        const termios = parseTermios(buf)

        // RAW MODE
        makeRaw(termios)

        // -------------------------
        // BAUD RATE
        // -------------------------
        const baud = getBaudRateValue(this.options.baudRate)

        cfsetispeed(buf, baud)
        cfsetospeed(buf, baud)

        // -------------------------
        // ENABLE RECEIVER
        // -------------------------
        termios.c_cflag |= CFLAG.CREAD
        termios.c_cflag |= CFLAG.CLOCAL

        // -------------------------
        // DATA BITS
        // -------------------------
        termios.c_cflag &= ~CFLAG.CSIZE

        switch (this.options.dataBits) {
            case 5:
                termios.c_cflag |= CFLAG.CS5
                break
            case 6:
                termios.c_cflag |= CFLAG.CS6
                break
            case 7:
                termios.c_cflag |= CFLAG.CS7
                break
            case 8:
            default:
                termios.c_cflag |= CFLAG.CS8
                break
        }

        // -------------------------
        // PARITY
        // -------------------------
        termios.c_cflag &= ~CFLAG.PARENB
        termios.c_iflag &= ~(IFLAG.INPCK | IFLAG.ISTRIP)

        switch (this.options.parity) {
            case 'even':
                termios.c_cflag |= CFLAG.PARENB
                break

            case 'odd':
                termios.c_cflag |= CFLAG.PARENB
                termios.c_cflag |= CFLAG.PARODD
                break

            case 'none':
            default:
                break
        }

        // -------------------------
        // STOP BITS
        // -------------------------
        if (this.options.stopBits === 2) {
            termios.c_cflag |= CFLAG.CSTOPB
        } else {
            termios.c_cflag &= ~CFLAG.CSTOPB
        }

        // -------------------------
        // FLOW CONTROL
        // -------------------------
        if (this.options.rtscts) {
            termios.c_cflag |= CFLAG.CRTSCTS
        } else {
            termios.c_cflag &= ~CFLAG.CRTSCTS
        }

        // -------------------------
        // APPLY SETTINGS
        // -------------------------
        writeTermios(termios, buf)

        tcsetattr(this.fd, TCSA.TCSANOW, buf)

        tcflush(this.fd, FLUSH.TCIOFLUSH)
    }

    // -------------------------
    // WRITE
    // -------------------------
    async write(data: Uint8Array): Promise<number> {
        if (this.fd === null) {
            throw new Error('closed')
        }

        return await write(this.fd, data)
    }

    // -------------------------
    // READ
    // -------------------------
    async read(size: number): Promise<Uint8Array> {
        if (this.fd === null) {
            throw new Error('closed')
        }

        const buf = new Uint8Array(size)

        const n = await read(this.fd, buf)

        if (n <= 0) {
            return new Uint8Array(0)
        }

        return buf.slice(0, n)
    }

    // -------------------------
    // CLOSE
    // -------------------------
    close(): void {
        if (this.fd === null) return

        try {
            // restore original settings
            if (this.original) {
                tcsetattr(this.fd, TCSA.TCSANOW, this.original)
            }
        } finally {
            close(this.fd)
            this.fd = null
        }
    }
}