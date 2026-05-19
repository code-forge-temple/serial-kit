/************************************************************************
 *    Copyright (C) 2025 Code Forge Temple                              *
 *    This file is part of serial-kit project                           *
 *    See the LICENSE file in the project root for license details.     *
 ************************************************************************/

export interface SerialPortInfo {
    path: string
    manufacturer?: string
    friendlyName?: string
}

export interface SerialPortListBackend {
    list(): Promise<SerialPortInfo[]>
}
