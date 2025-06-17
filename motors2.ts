/// <reference path="FloidPro.ts"/>

namespace Motors{

    const tyre_diameter = 14.4
    const axle_width = 18
    const turn_diameter = 56.5
    const numberofholes = 4
    /**
     * Geradeausfahren: 
     */
    //% blockid="floidpro_geradeaus" block="Fahre %distance cm geradeaus %direction"
    //% distance.min=0 distance.max=255
    //% direction.min= 0 direction.max= 1
    //% weight=100 blockGap=8
    export function gradeaus(distance: number, direction: number): void {

        basic.clearScreen()

        let distancel = 0
        let distancer = 0
        let last_statel = pins.analogReadPin(AnalogPin.P2)
        let last_stater = pins.analogReadPin(AnalogPin.P3)
        basic.pause(10)
        let new_statel = pins.analogReadPin(AnalogPin.P2)
        let new_stater = pins.analogReadPin(AnalogPin.P3)
        basic.pause(10)
        let changes = 0

        let targetdistance = distance
        if (direction == 0) {
            motors2(5, 700, 700) // Start motors: direction = 5 vorwärts, 10 rückwärts
        } else if (direction == 1) {
            motors2(10, 700, 700) // Start motors: direction = 5 vorwärts, 10 rückwärts
        }

        while (distancel < targetdistance && distancer < targetdistance) { // should be || but pin3 has issues ; tbf 
            let next_statel = pins.analogReadPin(AnalogPin.P2)
            let next_stater = pins.analogReadPin(AnalogPin.P3)
            Core.showNumber(next_statel, 4, 1, 1)
            Core.showNumber(next_stater, 4, 2, 1)
            if (Math.abs(new_statel - last_statel) >= 100 && Math.abs(new_statel - next_statel) <= 100) {
                changes += 1
                distancel += tyre_diameter / numberofholes
            }
            last_statel = new_statel
            new_statel = next_statel

            if (Math.abs(new_stater - last_stater) >= 100 && Math.abs(new_stater - next_stater) <= 100) {
                changes += 1
                distancer += tyre_diameter / numberofholes
            }
            last_stater = new_stater
            new_stater = next_stater

            basic.pause(10)
        }

        // Stop motors
        motors2(5, 0, 0)
    }
    /**
     * Graddrehung: 
     */
    //% blockid="floidpro_graddrehen" block="Drehung um %targetdegrees °"
    //% targetdegrees.min=-360 targetdegrees.max=360
    //% weight=100 blockGap=8
    export function graddrehen(targetdegrees: number): void {
        let m = 9
        if (targetdegrees < 0) {
            m = 6
        }
        targetdegrees = Math.abs(targetdegrees)

        // Zielentfernung berechnen (basierend auf Drehwinkel)
        let targetdistance = turn_diameter * targetdegrees / 360

        let distancel = 0
        let distancer = 0

        // Erste Sensormessungen
        let last_statel = pins.analogReadPin(AnalogPin.P2)
        let last_stater = pins.analogReadPin(AnalogPin.P3)
        basic.pause(10)
        let new_statel = pins.analogReadPin(AnalogPin.P2)
        let new_stater = pins.analogReadPin(AnalogPin.P3)
        basic.pause(10)

        let changes = 0

        motors2(m, 700, 700)
        // Schleife bis beide Seiten die Zielentfernung erreicht haben
        while (distancel < targetdistance && distancer < targetdistance) {
            let next_statel = pins.analogReadPin(AnalogPin.P2)
            let next_stater = pins.analogReadPin(AnalogPin.P3)

            // Linke Seite prüfen
            if (Math.abs(new_statel - last_statel) >= 100 && Math.abs(new_statel - next_statel) <= 100) {
                changes += 1
                distancel += tyre_diameter / numberofholes
                if (distancel >= targetdistance) {
                    // Linker Motor stoppen, wenn Ziel erreicht
                    motors2(m, 0, 700)
                }
            }
            last_statel = new_statel
            new_statel = next_statel

            // Rechte Seite prüfen
            if (Math.abs(new_stater - last_stater) >= 200 && Math.abs(new_stater - next_stater) <= 200) {
                changes += 1
                distancer += tyre_diameter / numberofholes
                if (distancer >= targetdistance) {
                    // Rechter Motor stoppen, wenn Ziel erreicht
                    motors2(m, 700, 0)
                }
            }
            last_stater = new_stater
            new_stater = next_stater

            basic.pause(10)
        }

        motors2(m, 0, 0)
    }

    /**
     * Kurvenfahrt: 
     */
    //% blockid="floidpro_kurvenfahrt" block="Kurven fahrt %degrees ° mit %radius cm Radius"
    //% degrees.min=0 degrees.max=360
    //% radius.min=0 radius.max=255
    //% weight=100 blockGap=8
    export function kurvenfahrt(degrees: number, radius: number, directionx: number, directiony: number): void {
        // Kreisfahrt Start
        let targetdistancel = (2 * Math.PI * (radius - (axle_width / 2))) / (degrees / 360)
        let targetdistancer = (2 * Math.PI * (radius + (axle_width / 2))) / (degrees / 360)

        // Geschwindigkeit berechnen
        let speed = (5 / 10) * 700 + 300

        // Motoren starten: Rechts langsamer als Links
        pins.analogWritePin(AnalogPin.P0, speed * targetdistancer / targetdistancel) // Rechts
        pins.analogWritePin(AnalogPin.P1, speed) // Links

        let distancel = 0
        let distancer = 0

        // Erste Sensormessungen
        let last_statel = pins.analogReadPin(AnalogPin.P2)
        let last_stater = pins.analogReadPin(AnalogPin.P3)
        basic.pause(10)
        let new_statel = pins.analogReadPin(AnalogPin.P2)
        let new_stater = pins.analogReadPin(AnalogPin.P3)
        basic.pause(10)

        let changes = 0

        if (directionx == 0) {
            motors2(5, speed, speed * targetdistancer / targetdistancel) // Start motors: direction = 5 vorwärts, 10 rückwärts
        } else if (directionx == 1) {
            motors2(10, speed, speed * targetdistancer / targetdistancel) // Start motors: direction = 5 vorwärts, 10 rückwärts
        }

        // Schleife bis Soll-Distanzen erreicht
        while (distancel < targetdistancel && distancer < targetdistancer) {
            let next_statel = pins.analogReadPin(AnalogPin.P2)
            let next_stater = pins.analogReadPin(AnalogPin.P3)

            // Linke Seite prüfen
            if (Math.abs(new_statel - last_statel) >= 100 && Math.abs(new_statel - next_statel) <= 100) {
                changes += 1
                distancel += tyre_diameter / 4
            }
            last_statel = new_statel
            new_statel = next_statel

            // Rechte Seite prüfen
            if (Math.abs(new_stater - last_stater) >= 200 && Math.abs(new_stater - next_stater) <= 200) {
                changes += 1
                distancer += tyre_diameter / 4
            }
            last_stater = new_stater
            new_stater = next_stater

            basic.pause(10)
        }

        // Motoren stoppen
        motors2(5, 0, 0)
    }

}