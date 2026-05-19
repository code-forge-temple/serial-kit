/************************************************************************
 *    Copyright (C) 2025 Code Forge Temple                              *
 *    This file is part of serial-kit project                           *
 *    See the LICENSE file in the project root for license details.     *
 ************************************************************************/

export let kernel32: any = null

export function loadKernel32() {
    if (!kernel32) {
        kernel32 = Deno.dlopen('kernel32.dll', {
            CreateFileW: {
                parameters: ['pointer', 'u32', 'u32', 'pointer', 'u32', 'u32', 'pointer'],
                result: 'pointer',
            },
            ReadFile: {
                parameters: ['pointer', 'pointer', 'u32', 'pointer', 'pointer'],
                result: 'bool',
            },
            WriteFile: {
                parameters: ['pointer', 'pointer', 'u32', 'pointer', 'pointer'],
                result: 'bool',
            },
            CloseHandle: {
                parameters: ['pointer'],
                result: 'bool',
            },
            SetCommTimeouts: {
                parameters: ['pointer', 'pointer'],
                result: 'bool',
            },
        })
    }

    return kernel32
}

/**
 * Registry access (for COM port enumeration)
 */

export let advapi32: any = null

export function loadAdvapi32() {
    if (!advapi32) {
        advapi32 = Deno.dlopen('advapi32.dll', {
            RegOpenKeyExW: {
                parameters: [
                    'u64', // HKEY (IMPORTANT FIX)
                    'pointer', // LPCWSTR
                    'u32',
                    'u32',
                    'pointer', // PHKEY
                ],
                result: 'i32',
            },

            RegEnumValueW: {
                parameters: [
                    'u64', // HKEY
                    'u32', // index
                    'pointer', // lpValueName
                    'pointer', // lpcchValueName
                    'pointer', // lpReserved (can be null pointer)
                    'pointer', // lpType
                    'pointer', // lpData
                    'pointer', // lpcbData
                ],
                result: 'i32',
            },

            RegCloseKey: {
                parameters: ['u64'],
                result: 'i32',
            },
        })
    }

    return advapi32
}

export let setupapi: any = null

export function loadSetupAPI() {
    if (!setupapi) {
        setupapi = Deno.dlopen('setupapi.dll', {
            SetupDiGetClassDevsW: {
                parameters: ['pointer', 'pointer', 'pointer', 'u32'],
                result: 'pointer',
            },

            SetupDiEnumDeviceInfo: {
                parameters: ['pointer', 'u32', 'pointer'],
                result: 'bool',
            },

            SetupDiGetDeviceRegistryPropertyW: {
                parameters: [
                    'pointer',
                    'pointer',
                    'u32',
                    'pointer',
                    'pointer',
                    'u32',
                    'pointer',
                ],
                result: 'bool',
            },

            SetupDiClassGuidsFromNameW: {
                parameters: [
                    'pointer', // LPCWSTR
                    'pointer', // LPGUID array
                    'u32', // GUID array size
                    'pointer', // required size
                ],
                result: 'bool',
            },

            SetupDiDestroyDeviceInfoList: {
                parameters: ['pointer'],
                result: 'bool',
            },
        })
    }

    return setupapi
}
