/************************************************************************
 *    Copyright (C) 2025 Code Forge Temple                              *
 *    This file is part of serial-kit project                           *
 *    See the LICENSE file in the project root for license details.     *
 ************************************************************************/

import type { SerialPortListBackend, SerialPortInfo } from './common.ts'

export class PosixSerialList implements SerialPortListBackend {
    async list(): Promise<SerialPortInfo[]> {
        const devDir = "/dev"
        const ports: SerialPortInfo[] = []

        const patterns = [
            /^ttyUSB\d+$/,
            /^ttyACM\d+$/,
            /^ttyS\d+$/,
            /^cu\..*$/,
            /^tty\..*$/,
        ]

        for await (const entry of Deno.readDir(devDir)) {
            if (!entry.isFile && !entry.isSymlink && !entry.isDirectory) continue

            const name = entry.name
            if (!patterns.some((p) => p.test(name))) continue

            ports.push({
                path: `${devDir}/${name}`,
            })
        }

        return ports
    }
}