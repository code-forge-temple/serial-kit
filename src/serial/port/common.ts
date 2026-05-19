/************************************************************************
 *    Copyright (C) 2025 Code Forge Temple                              *
 *    This file is part of serial-kit project                           *
 *    See the LICENSE file in the project root for license details.     *
 ************************************************************************/

export interface SerialPortOptions {
    path: string
    baudRate: number

    dataBits?: 5 | 6 | 7 | 8
    stopBits?: 1 | 2

    parity?: 'none' | 'even' | 'odd' | 'mark' | 'space'

    // Hardware RTS/CTS flow control
    rtscts?: boolean

    autoOpen?: boolean
    highWaterMark?: number
    debug?: boolean
}

export interface SerialPortSignals {
    cts: boolean
    dsr: boolean
    dcd: boolean
    ring: boolean
}

export class SerialPortError extends Error {
    override cause: Error | undefined

    constructor(
        message: string,
        public code: string,
        cause?: Error,
    ) {
        super(message)

        this.name = 'SerialPortError'
        this.cause = cause
    }
}

export interface SerialBackend {
    open(): void

    close(): void

    write(data: Uint8Array): Promise<number>

    read(size: number): Promise<Uint8Array>
}