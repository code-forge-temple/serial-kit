/************************************************************************
 *    Copyright (C) 2025 Code Forge Temple                              *
 *    This file is part of serial-kit project                           *
 *    See the LICENSE file in the project root for license details.     *
 ************************************************************************/

import { isWindows } from '../../utils/platform.ts'
import { WindowsSerialPort } from './windowsSerialPort.ts'
import { PosixSerialPort } from './posixSerialPort.ts'
import type { SerialPortOptions, SerialBackend } from './common.ts'

export class SerialPort {
    private impl: SerialBackend

    constructor(options: SerialPortOptions) {
        this.impl = isWindows()
            ? new WindowsSerialPort(options)
            : new PosixSerialPort(options)

        if (options.autoOpen ?? true) {
            this.open()
        }
    }

    open(): void {
        this.impl.open()
    }

    close(): void {
        this.impl.close()
    }

    write(data: Uint8Array | string): Promise<number> {
        if (typeof data === 'string') {
            data = new TextEncoder().encode(data)
        }
        return this.impl.write(data)
    }

    read(size: number): Promise<Uint8Array> {
        return this.impl.read(size)
    }
}