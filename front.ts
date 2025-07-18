/**
 * Die Frontsektion umfasst die Funktionen für Ultraschall, RGB und Linetracking
 */
//% weight=190 color=#004A99 icon="" block="FloidPro - Frontsektion"
//% groups="['Ultraschall und RGB', 'Linetracking']"

namespace Front {
    /**
     * Misst die Distanz über den eingestellten Ultraschallsensor
     */
    //% blockid="floidpro_sonar"
    //% block="gemessene Distanz"
    //% group="Ultraschall und RGB"
    //% weigth=90
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
     * Misst die Distanz über den eingestellten Ultraschallsensor und glättet den Wert
     */
    //% blockid="floidpro_sonar_filter"
    //% block="gemessene Distanz (geglättet)"
    //% group="Ultraschall und RGB"
    //% weigth=89
    export function sonar_smooth(): number {
        if (advanced) errornode("Ultraschall glatt")
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
     * Stellt die Ultraschall-Weiche, um den gewünschten Sensor zu verbinden 
     */
    //% blockid="floidpro_sonarswitch"
    //% block="Ultraschallweiche auf %richtung einstellen"
    //% weigth=85
    //% group="Ultraschall und RGB" 
    export function sonar_switch(richtung:USSensor): void {
        if (advanced) errornode("Ultraschallweiche")
        let state = Core.i2cread(Controller_read.US)
        let curr = state & 0b11111100
        let curr1 = curr | richtung 
        pins.i2cWriteNumber(62, curr1, NumberFormat.UInt8LE, false)
        readus = curr1
        basic.pause(5)
        
    }

    /**
     * Stellt eine RGB-LED wie gewünscht ein
     */
    //% blockid="floidpro_rgb"
    //% block="Schalte von RGB-LED   %rgb den Anteil für Rot:  %r            für Grün:%g            für Blau:%b"
    //% weight=84
    //% group="Ultraschall und RGB"
    export function rgb(rgb:RGB,r:OnOff,b:OnOff,g:OnOff){
        if (advanced) errornode("RGB-LED")
        let state = Core.i2cread(Controller_read.US)
        let curr = 0
        let richtung = 0
        if (rgb==2){
            curr = state & 0b11100011
            richtung = (1 - r) * 4 + (1 - g) * 8 + (1 - b) * 16
        }
        else{
            curr = state & 0b00011111
            richtung = (1 - r) * 32 + (1 - g) * 64 + (1 - b) * 128
        }
        let curr1 = curr | richtung
        pins.i2cWriteNumber(62, curr1, NumberFormat.UInt8LE, false)
        readus = curr1
        basic.pause(5)
    }

    /*Ende Ultraschall und RGB *******************************************************************************************************************************/

    /**
     * Gibt zurück, ob der eingestellte Sensor schwarzen Untergurnd erkannt hat
     */
    //% blockid="floidpro_linetrackingsimple"
    //% block="%sensor erkennt schwarzen Untergrund"
    //% weight=80
    //% group="Linetracking"
    export function lt_black(sensor: Linetracker): boolean {

        pins.i2cWriteNumber(56, sensor + 240 - 2 ** (sensor + 4), NumberFormat.Int8LE, false)
        let s = pins.digitalReadPin(DigitalPin.P14)
        pins.i2cWriteNumber(56, 255, NumberFormat.Int8LE, false)
        return !!s

    }
    /*Ende Linetracking*******************************************************************************************************************************/

}