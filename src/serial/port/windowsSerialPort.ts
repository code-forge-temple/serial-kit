/************************************************************************
 *    Copyright (C) 2025 Code Forge Temple                              *
 *    This file is part of serial-kit project                           *
 *    See the LICENSE file in the project root for license details.     *
 ************************************************************************/

import { loadKernel32 } from '../../ffi/windows.ts'
import { type SerialBackend, SerialPortError, type SerialPortOptions } from './common.ts'

export class WindowsSerialPort implements SerialBackend {
    private handle: Deno.PointerValue | null = null
    private kernel = loadKernel32()

    constructor(private options: SerialPortOptions) {}

    // -------------------------
    // OPEN (SAFE DEFAULT MODE)
    // -------------------------
    open(): void {
        let path = this.options.path

        if (!path.startsWith('\\\\.\\')) {
            path = '\\\\.\\' + path
        }

        // UTF-16LE encoding (correct Windows format)
        const utf16 = new Uint16Array(path.length + 1)
        for (let i = 0; i < path.length; i++) {
            utf16[i] = path.charCodeAt(i)
        }

        const ptr = Deno.UnsafePointer.of(utf16)

        const handle = this.kernel.symbols.CreateFileW(
            ptr,
            0xC0000000, // GENERIC_READ | GENERIC_WRITE
            0,
            null,
            3, // OPEN_EXISTING
            0x80,
            null,
        )

        if (!handle) {
            throw new SerialPortError('Failed to open port', 'PORT_NOT_FOUND')
        }

        this.handle = handle

        // IMPORTANT:
        // Do NOT force DCB unless required.
        // Most USB serial drivers already default to:
        // 115200 8N1 (or last-known-good config)

        this.applySafeTimeouts()
    }

    // -------------------------
    // SAFE TIMEOUT CONFIG
    // -------------------------
    private applySafeTimeouts() {
        if (!this.handle) return

        // struct COMMTIMEOUTS {
        //   DWORD ReadIntervalTimeout;
        //   DWORD ReadTotalTimeoutMultiplier;
        //   DWORD ReadTotalTimeoutConstant;
        //   DWORD WriteTotalTimeoutMultiplier;
        //   DWORD WriteTotalTimeoutConstant;
        // }

        const timeouts = new Uint32Array(5)

        // Very important for AT devices (SIM7600)
        timeouts[0] = 10 // interval timeout
        timeouts[1] = 0
        timeouts[2] = 50 // total read timeout
        timeouts[3] = 0
        timeouts[4] = 50 // write timeout

        const ptr = Deno.UnsafePointer.of(timeouts)

        const ok = this.kernel.symbols.SetCommTimeouts(this.handle, ptr)

        if (!ok) {
            throw new SerialPortError(
                'Failed to set timeouts',
                'INVALID_CONFIGURATION',
            )
        }
    }

    // -------------------------
    // WRITE
    // -------------------------
    async write(data: Uint8Array): Promise<number> {
        if (!this.handle) throw new Error('closed')

        const buffer = new Uint8Array(data)
        const bufPtr = Deno.UnsafePointer.of(buffer)

        const written = new Uint32Array(1)
        const writtenPtr = Deno.UnsafePointer.of(written)

        const ok = this.kernel.symbols.WriteFile(
            this.handle,
            bufPtr,
            buffer.length,
            writtenPtr,
            null,
        )

        if (!ok) throw new Error('WriteFile failed')

        await Promise.resolve()

        return written[0] ?? 0
    }

    // -------------------------
    // READ
    // -------------------------
    async read(size: number): Promise<Uint8Array> {
        if (!this.handle) throw new Error('closed')

        const buffer = new Uint8Array(size)
        const bufPtr = Deno.UnsafePointer.of(buffer)

        const read = new Uint32Array(1)
        const readPtr = Deno.UnsafePointer.of(read)

        const ok = this.kernel.symbols.ReadFile(
            this.handle,
            bufPtr,
            size,
            readPtr,
            null,
        )

        if (!ok) throw new Error('ReadFile failed')

        await Promise.resolve()

        return buffer.slice(0, read[0])
    }

    // -------------------------
    // CLOSE
    // -------------------------
    close(): void {
        if (this.handle) {
            this.kernel.symbols.CloseHandle(this.handle)
            this.handle = null
        }
        if (this.kernel && typeof this.kernel.close === 'function') {
            this.kernel.close()
            this.kernel = null
        }
    }
}
