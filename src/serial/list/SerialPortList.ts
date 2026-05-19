/************************************************************************
 *    Copyright (C) 2025 Code Forge Temple                              *
 *    This file is part of serial-kit project                           *
 *    See the LICENSE file in the project root for license details.     *
 ************************************************************************/

import { isWindows } from '../../utils/platform.ts'
import type { SerialPortInfo, SerialPortListBackend } from './common.ts'
import { PosixSerialList } from './posixList.ts'
import { WindowsSerialList } from './windowsList.ts'

export class SerialPortList {
    private impl: SerialPortListBackend

    constructor() {
        this.impl = isWindows() ? new WindowsSerialList() : new PosixSerialList()
    }

    list(): Promise<SerialPortInfo[]> {
        return this.impl.list()
    }
}
