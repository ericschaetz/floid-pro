/// <reference path="FloidPro.ts" />


//% weight=180 color=#004A99 icon="" block="FloidPro - Antrieb"
namespace Motors{
    
    
    /**
     * Antriebssteuerung für Module 1-3: ein positiver Wert lässt die Motoren vorwärts drehen, ein negativer rückwärts.
     */
    //% blockid="floidpro_motors1" block="Setze Motor A auf %left und Motor B auf %right"
    //% left.min=-10 left.max=10
    //% right.min=-10 right.max=10
    //% weight=60 blockGap=8

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
     * Antriebssteuerung für die Module 1-3: Die Steuerzahl bestimmt die Richtung der Motoren, die PWM-Werte die Geschwindigkeit 
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

    /**
     * Antriebssteuerung für die Modul 4: Die Steuerzahl bestimmt die Richtung der Motoren, PWM-Werte die Geschwindigkeit
     */
    //% blockid="floidpro_motors3" block="Sende Steuerzahl %drivenumber. Schalte Motor A: AN:%lon ms AUS:%loff ms und Motor B: AN:%ron ms AUS:%roff ms."
    //% drivenumber.min=0 drivenumber.max=255
    //% lon.min=0 lon.max=1023
    //% ron.min=0 ron.max=1023
    //% loff.min=0 loff.max=1023
    //% roff.min=0 roff.max=1023
    //% weight=80 blockGap=8
    //% inlineInputMode=inline

    export function motors3(drivenumber: number, lon: number, loff: number, ron: number, roff:number): void {

        // PWM-Funktion schreiben
        
        pins.i2cWriteNumber(57, drivenumber, NumberFormat.Int8LE, false)
        pins.i2cWriteNumber(59, drivenumber, NumberFormat.Int8LE, false)
        pins.i2cWriteNumber(61, drivenumber, NumberFormat.Int8LE, false)
    }

    
    /**
     * Antriebssteuerung für Module 1-3: 
     */
    //% blockid="floidpro_motors4" block="Setze Geschwindigkeit auf %speed und Richtung auf %direction"
    //% speed.min=-10 speed.max=10
    //% direction.min=-10 direction.max=10
    //% weight=100 blockGap=8

    export function motors4(speed: number, direction: number): void {
        // Antriebszahl berechnen
        let n = 0;
        let left=0;
        let right=0;

        left = speed+direction; //Werte zwischen -20 und 20
        right = speed - direction; //Werte zwischen -20 und 20

        //Antriebszahl berechnen

        if (left <= 0 && right <= 0){
            n = 10
        }

        else if (left >= 0 && right >= 0) {
            n = 5
        }

        else if (left <= 0 && right >= 0) {
            n = 6
        }

        else if (left >= 0 && right <= 0) {
            n = 9
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