
namespace Motors2 {

    const tyre_diameter = 14.4
    const axle_width = 18
    const turn_diameter = 56.5
    const numberofholes = 4
    let lower_bounce_l = 0
    let upper_bounce_l = 0
    let lower_bounce_r = 0
    let upper_bounce_r = 0

    /**
     * Init_Radsensoren: 
     */
    //% blockid="floidpro_init_rad" block="Kalibriere die Radsensoren"
    //% group="Initialisierung"
    export function init_rad(): void {
        let last_statel = pins.analogReadPin(AnalogPin.P2)
        let last_stater = pins.analogReadPin(AnalogPin.P3)
        lower_bounce_l = last_statel
        upper_bounce_l = last_statel
        lower_bounce_r = last_stater
        upper_bounce_r = last_stater
        Motors.motors2(5, 700, 700)
        for (let i = 0; i < 10; i++) {
            basic.pause(5)
            last_statel = pins.analogReadPin(AnalogPin.P2)
            if (last_statel > upper_bounce_l) {
                upper_bounce_l = last_statel
            } else if (last_statel < lower_bounce_l) {
                lower_bounce_l = last_statel
            }
            basic.pause(5)
            last_stater = pins.analogReadPin(AnalogPin.P3)
            if (last_stater > upper_bounce_r) {
                upper_bounce_r = last_stater
            } else if (last_stater < lower_bounce_r) {
                lower_bounce_r = last_stater
            }
        }
        // Stop motors
        Motors.motors2(5, 0, 0)
    }


    /**
     * Geradeausfahren: 
     */
    //% blockid="floidpro_geradeaus" block="Fahre %distance cm geradeaus %direction"
    //% distance.min=0 distance.max=255
    //% direction.min= 0 direction.max= 1
    //% weight=20 blockGap=8
    //% group="Fahrmanöver und Verifikation"
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
            Motors.motors2(5, 700, 700) // Start motors: direction = 5 vorwärts, 10 rückwärts
        } else if (direction == 1) {
            Motors.motors2(10, 700, 700) // Start motors: direction = 5 vorwärts, 10 rückwärts
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
        Motors.motors2(5, 0, 0)
    }
    /**
     * Graddrehung: 
     */
    //% blockid="floidpro_graddrehen" block="Drehung um %targetdegrees °"
    //% targetdegrees.min=-360 targetdegrees.max=360
    //% weight=20 blockGap=8
    //% group="Fahrmanöver und Verifikation"
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

        Motors.motors2(m, 700, 700)
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
                    Motors.motors2(m, 0, 700)
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
                    Motors.motors2(m, 700, 0)
                }
            }
            last_stater = new_stater
            new_stater = next_stater

            basic.pause(10)
        }

        Motors.motors2(m, 0, 0)
    }

    /**
     * Kurvenfahrt: 
     */
    //% blockid="floidpro_kurvenfahrt" block="Kurven fahrt %degrees ° mit %radius cm Radius"
    //% degrees.min=0 degrees.max=360
    //% radius.min=0 radius.max=255
    //% weight=20 blockGap=8
    //% group="Fahrmanöver und Verifikation"
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
            Motors.motors2(5, speed, speed * targetdistancer / targetdistancel) // Start motors: direction = 5 vorwärts, 10 rückwärts
        } else if (directionx == 1) {
            Motors.motors2(10, speed, speed * targetdistancer / targetdistancel) // Start motors: direction = 5 vorwärts, 10 rückwärts
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
        Motors.motors2(5, 0, 0)
    }

}