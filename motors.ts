/// <reference path="FloidPro.ts" />

//% weight=180 color=#004A99 icon="" block="FloidPro - Antrieb"
namespace Motors{
    
    
    /**
     * Antriebssteuerung für alle Module: ein positiver Wert lässt die Motoren vorwärts drehen, ein negativer rückwärts.
     * @param left Geschwindigkeit links: 10
     * @param right Geschwindigkeit rechts: 10
     */
    //% blockid="floidpro_motors1" block="Setze Motor A auf %left und Motor B auf %right"
    //% left.min=-10 left.max=10
    //% right.min=-10 right.max=10
    //% weight=100 blockGap=8

    export function motors1(left: number, right: number): void {
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

    /**
     * Antriebssteuerung für die Module 1-3: Die Steuerzahl bestimmt die Richtugn der Motoren, die PWM-Werte die Geschwindigkeit 
     * @param drivenumber: 0
     * @param left:0
     * @param right: 0
     */
    //% blockid="floidpro_motors2" block="Sende Steuerzahl %drivenumber. Setze Geschwindigkeit von Motor A auf %left und Geschwindigkeit von Motor B auf %right."
    //% drivenumber.min=0 drivenumber.max=255
    //% left.min=0 left.max=1023
    //% right.min=0 right.max=1023
    //% weight=90 blockGap=8

    export function motors2(drivenumber:number, left: number, right: number): void {

        // PWM schreiben
        pins.analogWritePin(AnalogPin.P0, left)
        pins.analogWritePin(AnalogPin.P1, right)

        //
        pins.i2cWriteNumber(57, drivenumber, NumberFormat.Int8LE, false)
        pins.i2cWriteNumber(59, drivenumber, NumberFormat.Int8LE, false)
        pins.i2cWriteNumber(61, drivenumber, NumberFormat.Int8LE, false)
    }

    
    
}