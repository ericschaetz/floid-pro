/**
 * Custom blocks
 */
//% weight=100 color=#0fbc11 icon="🚗" 
//% blockNamespace="FPFront"
namespace FloidProFrontsektion {
    /**
         * Ultraschall
         */
    //% block
    export function ultraschall(): number {

        return sonar.ping(DigitalPin.P8, DigitalPin.P12, PingUnit.Centimeters)
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