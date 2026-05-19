/**
 * SerialKit (working name)
 * Cross-platform serial port library for Deno (Linux, macOS, Windows)
 *
 * @module
 *
 * @example
 * ```ts
 * import { SerialPort, SerialPortList } from "@your/serialkit"
 *
 * const ports = await new SerialPortList().list()
 * console.log(ports)
 *
 * const port = new SerialPort({
 *   path: ports[0].path,
 *   baudRate: 115200,
 * })
 *
 * await port.write("AT\r\n")
 * const data = await port.read(1024)
 *
 * console.log(new TextDecoder().decode(data))
 * port.close()
 * ```
 */

// =========================
// Core API (PUBLIC)
// =========================

export { SerialPort } from './src/serial/port/SerialPort.ts'
export { SerialPortList } from './src/serial/list/SerialPortList.ts'

// =========================
// Types (PUBLIC)
// =========================

export type {
    SerialPortError,
    SerialPortOptions,
    SerialPortSignals,
} from './src/serial/port/common.ts'

// =========================
// Optional advanced low-level exports
// (ONLY if you want power users)
// =========================

// Platform helpers (optional)
export { isDarwin, isLinux, isWindows } from './src/utils/platform.ts'
