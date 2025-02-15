enum USSensor {
    //% block="rechts"
    Rechts = 0,

    //% block="vorne"
    Vorne = 1,

    //% block="links"
    Links = 2,

    //% block="hinten"
    Hinten = 3,
}


/**
 * Custom blocks
 */
//% weight=190 color=#004A99 icon="" block="FloidPro - Frontsektion"

namespace Front {
    /**
         * Ultraschall
         */
    //% block="Distanzmessung"
    export function sonar(): number {
        // send pulse
        let trig = DigitalPin.P8
        let echo = DigitalPin.P12
        pins.setPull(trig, PinPullMode.PullNone);
        pins.digitalWritePin(trig, 0);
        control.waitMicros(2);
        pins.digitalWritePin(trig, 1);
        control.waitMicros(10);
        pins.digitalWritePin(trig, 0);

        // read pulse
        const d = pins.pulseIn(echo, PulseValue.High, 256 * 58);
        return Math.idiv(d, 58);
    }

    

    /**
         * Ultraschall-Weiche einstellen
         */
    //% block="Ultraschallweiche einstellen %richtung"
    export function sonar_switch(richtung:USSensor): void {
        pins.i2cWriteNumber(62, richtung, NumberFormat.Int8LE, false)
        
    }




    /**
     * LineTracking
     * @param sensor
     */
    //% block
    export function LineTracking(sensor: number): boolean {

        pins.i2cWriteNumber(56, sensor + 240 - 2 ** (sensor + 4), NumberFormat.Int8LE, false)
        let s = pins.digitalReadPin(DigitalPin.P14)
        pins.i2cWriteNumber(56, 255, NumberFormat.Int8LE, false)
        if (s == 1) {
            return true
        }
        else {
            return false
        }

    }

}