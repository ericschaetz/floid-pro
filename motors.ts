/// <reference path="FloidPro.ts" />

namespace FloidPro{
    /**
     * Antrieb1
     * @param left Geschwindigkeit links: 10
     * @param right Geschwindigkeit rechts: 10
     */
    //% block
    export function antrieb1(left: number, right: number): void {
        // Antriebszahl berechnen
        let n = 0;
        if (left > 0) {
            n += 1
        }
        else if (left < 0) {
            n += 2
        }
        if (right > 0) {
            n += 4
        }
        else if (right < 0) {
            n += 8
        }
        // PWM schreiben
        pins.analogWritePin(AnalogPin.P0, Math.abs(left) / 10 * 723 + 300)
        pins.analogWritePin(AnalogPin.P1, Math.abs(right) / 10 * 723 + 300)

        //
        pins.i2cWriteNumber(57, n, NumberFormat.Int8LE, false)
        pins.i2cWriteNumber(59, n, NumberFormat.Int8LE, false)
        pins.i2cWriteNumber(61, n, NumberFormat.Int8LE, false)
    }
}