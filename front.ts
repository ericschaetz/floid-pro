/**
 * Custom blocks
 */
//% weight=100 color=#0fbc11 icon="🚗"

namespace FloidProFrontsektion {
    /**
         * Ultraschall
         */
    //% block
    export function ultraschall(): number {

        return sonar.ping(DigitalPin.P8, DigitalPin.P12, PingUnit.Centimeters)
    }
}