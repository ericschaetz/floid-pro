
/**
* Nutze diese Datei für benutzerdefinierte Funktionen und Blöcke.
* Weitere Informationen unter https://makecode.microbit.org/blocks/custom
*/

enum MyEnum {
    //% block="one"
    One,
    //% block="two"
    Two
}

/**
 * Custom blocks
 */
//% weight=100 color=#0fbc11 icon="🚗"
namespace FloidPro {
    /**
     * Antrieb
     * @param left Geschwindigkeit links: 10
     * @param right Geschwindigkeit rechts: "Hello"
     */
    //% block
    export function antrieb(left: number, right: number): void {
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
        else if(right < 0){
            n += 8
        }
        // PWM schreiben
        pins.analogWritePin(AnalogPin.P0, Math.abs(left) / 10 * 723 + 300)
        pins.analogWritePin(AnalogPin.P1, Math.abs(right) / 10 * 723 + 300)

        //
        pins.i2cWriteNumber(57, n, NumberFormat.Int8LE, false)
    }

    /**
     * Init-Funktion
     * @param value describe value here, eg: 5
     */
    //% block
    export function init(value: number): void {
        OLED.init(128, 64)
        OLED.writeStringNewLine("FloidPro")
        OLED.writeNumNewLine(pins.i2cReadNumber(56, NumberFormat.Int8LE, false))
        OLED.writeNumNewLine(pins.i2cReadNumber(57, NumberFormat.Int8LE, false))
        
    }

    /**
     * Bumper
     */
    //% block
    export function bumper(): number {
        return pins.i2cReadNumber(60, NumberFormat.Int8LE, false)
    }

    /**
     * Beleuchtung
     * @param VL_Blinker
     * @param VL_Licht
     * @param VR_Blinker
     * @param VR_Licht
     * @param HL_Blinker
     * @param HL_Licht
     * @param HR_Blinker
     * @param HR_Licht
     */
    //% block
    export function beleuchtung(VL_Blinker:boolean, VL_Licht:boolean, VR_Blinker: boolean, VR_Licht: boolean, HL_Blinker: boolean, HL_Licht: boolean, HR_Blinker: boolean, HR_Licht: boolean): void {
        let n = 0 
        if (!VL_Blinker){
            n += 1
        }
        if (!VL_Licht) {
            n += 2
        }
        if (!VR_Blinker) {
            n += 8
        }
        if (!VR_Licht) {
            n += 4
        }
        if (!HL_Blinker) {
            n += 16
        }
        if (!HL_Licht) {
            n += 32
        }
        if (!HR_Blinker) {
            n += 128
        }
        if (!HR_Licht) {
            n += 164
        }
        pins.i2cWriteNumber(58, n, NumberFormat.Int8LE, false)
    }

    /**
     * LineTracking
     * @param sensor
     */
    //% block
    export function LineTracking(sensor: number): boolean {
        
        pins.i2cWriteNumber(56, sensor + 240 - 2**(sensor+4), NumberFormat.Int8LE, false)
        let s = pins.digitalReadPin(DigitalPin.P14)
        if (s == 1) {
            return true
        }
        else {
            return false
        }
        
    }

}
