/************************************************************************
 *    Copyright (C) 2025 Code Forge Temple                              *
 *    This file is part of serial-kit project                           *
 *    See the LICENSE file in the project root for license details.     *
 ************************************************************************/

import { SerialPortList } from "../src/serial/list/SerialPortList.ts";
import { SerialPort } from "../src/serial/port/SerialPort.ts";
import { delay } from "./utils.ts";


Deno.test("SerialPortList lists at least one port and sends SMS", async () => {
    const list = new SerialPortList();
    const ports = await list.list();

    console.log("Detected ports:", ports);

    if (!Array.isArray(ports) || ports.length === 0) {
        throw new Error("No serial ports found");
    }

    const com13 = ports.find(p => p.path.toUpperCase() === "COM13");
    if (!com13) {
        throw new Error("COM13 not found in detected ports");
    }

    const port = new SerialPort({
        path: com13.path,
        baudRate: 115200,
    });

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const phoneNumber = Deno.env.get("PHONE_NUMBER");
    if (!phoneNumber) {
        throw new Error("PHONE_NUMBER environment variable is not set");
    }

    const commands = [
        { data: "AT\r\n", label: "AT Base Test", wait: 100 },
    ];

    try {
        for (const cmd of commands) {
            console.log(`--- Sending: ${cmd.label} ---`);

            if (typeof cmd.data === "string") {
                await port.write(encoder.encode(cmd.data));
            } else {
                await port.write(cmd.data);
            }

            await delay(cmd.wait);

            const data = await port.read(1024);
            const response = decoder.decode(data);

            console.log(`COM13 Response:\n${response}`);
        }
    } finally {
        port.close();
    }
});