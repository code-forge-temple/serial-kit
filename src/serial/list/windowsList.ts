/************************************************************************
 *    Copyright (C) 2025 Code Forge Temple                              *
 *    This file is part of serial-kit project                           *
 *    See the LICENSE file in the project root for license details.     *
 ************************************************************************/

import { loadSetupAPI } from '../../ffi/windows.ts'
import type { SerialPortInfo, SerialPortListBackend } from './common.ts'

const DIGCF_PRESENT = 0x02
const DIGCF_ALLCLASSES = 0x04

const SPDRP_FRIENDLYNAME = 0x0000000C
const SPDRP_DEVICEDESC = 0x00000000

function decode(buf: Uint16Array, byteLen: number): string {
    return new TextDecoder('utf-16le')
        .decode(new Uint8Array(buf.buffer, 0, byteLen))
        .replace(/\0/g, '')
}

function extractCOM(text: string): string | null {
    const m = text.match(/COM\d+/i)
    return m ? m[0] : null
}

/**
 * IMPORTANT: correct SP_DEVINFO_DATA structure (32 bytes on x64)
 */
function createDevInfoData(): Uint8Array {
    const buf = new Uint8Array(32)

    // cbSize MUST be set to struct size (critical!)
    const view = new DataView(buf.buffer)
    view.setUint32(0, 32, true)

    return buf
}

export class WindowsSerialList implements SerialPortListBackend {
    async list(): Promise<SerialPortInfo[]> {
        const setupapi = loadSetupAPI()
        const ports: SerialPortInfo[] = []

        const deviceInfoSet = setupapi.symbols.SetupDiGetClassDevsW(
            null,
            null,
            null,
            DIGCF_PRESENT | DIGCF_ALLCLASSES,
        )

        if (!deviceInfoSet) {
            setupapi.close?.()
            throw new Error('SetupDiGetClassDevsW failed')
        }

        try {
            let index = 0

            while (true) {
                const devInfo = createDevInfoData()
                const devInfoPtr = Deno.UnsafePointer.of(devInfo)

                const ok = setupapi.symbols.SetupDiEnumDeviceInfo(
                    deviceInfoSet,
                    index,
                    devInfoPtr,
                )

                if (!ok) break

                const buffer = new Uint16Array(512)
                const regType = new Uint32Array(1)
                const needed = new Uint32Array(1)

                let success = setupapi.symbols.SetupDiGetDeviceRegistryPropertyW(
                    deviceInfoSet,
                    devInfoPtr,
                    SPDRP_FRIENDLYNAME,
                    Deno.UnsafePointer.of(regType),
                    Deno.UnsafePointer.of(buffer),
                    buffer.length * 2,
                    Deno.UnsafePointer.of(needed),
                )

                if (!success) {
                    success = setupapi.symbols.SetupDiGetDeviceRegistryPropertyW(
                        deviceInfoSet,
                        devInfoPtr,
                        SPDRP_DEVICEDESC,
                        Deno.UnsafePointer.of(regType),
                        Deno.UnsafePointer.of(buffer),
                        buffer.length * 2,
                        Deno.UnsafePointer.of(needed),
                    )
                }

                if (success && needed[0] > 0) {
                    const text = decode(buffer, needed[0])
                    const com = extractCOM(text)

                    if (com) {
                        ports.push({
                            path: com,
                            friendlyName: text,
                        })
                    }
                }

                index++
            }
        } finally {
            setupapi.symbols.SetupDiDestroyDeviceInfoList(deviceInfoSet)
            setupapi.close?.()
        }

        return ports
    }
}
