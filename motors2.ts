
namespace Motors {

    const pin_l = AnalogPin.P3
    const pin_r = AnalogPin.P2
    pins.setPull(pin_l, PinPullMode.PullUp);
    pins.setPull(pin_r, PinPullMode.PullDown);
    const cutoff = 900
    const tyre_diameter = 14.4
    const axle_width = 18
    const turn_diameter = 56.5
    const numberofholes = 4
    let lower_bounce_l = 0
    let upper_bounce_l = 0
    let lower_bounce_r = 0
    let upper_bounce_r = 0
    let mid_l = 100
    let mid_r = 100

    let wheelchecking = false
    let wheelspeed_timestamp = 0
    let wheel_r = 0
    let wheel_l = 0

    let wheel_r_last = 0
    let wheel_l_last = 0

    let wheel_r_new = 0
    let wheel_l_new = 0


    //local functions

    function current_speed_einheit(mode: Geschwindigkeit_Einheit, rad: Raddrehung): number {

        let time_past = input.runningTime() - wheelspeed_timestamp
        if (mode == Geschwindigkeit_Einheit.meter) {
            let distance_l = wheel_l * (tyre_diameter / numberofholes)
            let distance_r = wheel_r * (tyre_diameter / numberofholes)
            if (rad == 1) {
                return (distance_l * 10) / (time_past)
            } else if (rad == 2) {
                return (distance_r * 10) / (time_past)
            } else {
                return ((distance_l + distance_r) * 5) / (time_past) //Mittelwert aus beiden
            }
        } else if (mode == Geschwindigkeit_Einheit.drehungen) {
            let distance_l = wheel_l / numberofholes
            let distance_r = wheel_r / numberofholes
            if (rad == 1) {
                return (distance_l) / (time_past / 1000)
            } else if (rad == 2) {
                return (distance_r) / (time_past / 1000)
            } else {
                return ((distance_l + distance_r) / 2) / (time_past / 1000) //Mittelwert aus beiden
            }
        } else if (mode == Geschwindigkeit_Einheit.grad) {
            let distance_l = wheel_l
            let distance_r = wheel_r
            if (rad == 1) {
                return (distance_l) / (time_past / 1000)
            } else if (rad == 2) {
                return (distance_r) / (time_past / 1000)
            } else {
                return ((distance_l + distance_r) / 2) / (time_past / 1000) //Mittelwert aus beiden
            }
        } else {
            return -1
        }
    }

    function current_wheel_dist(mode: Geschwindigkeit_Einheit, rad: Raddrehung): number {
        let distance_l = 0
        let distance_r = 0
        if (mode == Geschwindigkeit_Einheit.meter) {
            distance_l = wheel_l * (tyre_diameter / numberofholes)
            distance_r = wheel_r * (tyre_diameter / numberofholes)
        } else if (mode == Geschwindigkeit_Einheit.drehungen) {
            distance_l = wheel_l / numberofholes
            distance_r = wheel_r / numberofholes
        } else if (mode == Geschwindigkeit_Einheit.grad) {
            distance_l = wheel_l
            distance_r = wheel_r
        } else {
            return -1
        }
        if (rad == 1) {
            return distance_l
        } else if (rad == 2) {
            return distance_r
        } else {
            return ((distance_l + distance_r) / 2) //Mittelwert aus beiden
        }
    }

    //background loop

    function get_state(pin: number): boolean {
        return pins.analogReadPin(pin) > cutoff
    }

    control.inBackground(() => {
        wheel_l_last = pins.analogReadPin(pin_l)
        wheel_r_last = pins.analogReadPin(pin_r)
        while (true) {
            while (wheelchecking) {
                wheel_l_new = pins.analogReadPin(pin_l)
                if (Math.abs(wheel_l_new - wheel_l_last) >= mid_l) {
                    wheel_l += 1
                }
                wheel_l_last = wheel_l_new
                basic.pause(5)
                wheel_r_new = pins.analogReadPin(pin_r)
                if (Math.abs(wheel_r_new - wheel_r_last) >= mid_r) {
                    wheel_r += 1
                }
                wheel_r_last = wheel_r_new
                basic.pause(25)
            }
            basic.pause(500)
        }
    })

    //init block

    /**
     * Init_Radsensoren: 
     */
    //% blockid="floidpro_init_rad" block="Kalibriere die Radsensoren"
    //% weight=20 blockGap=8
    //% group="Initialisierung"
    export function init_rad(): void {
        let last_statel = pins.analogReadPin(pin_l)
        let last_stater = pins.analogReadPin(pin_r)
        lower_bounce_l = last_statel
        upper_bounce_l = last_statel
        lower_bounce_r = last_stater
        upper_bounce_r = last_stater
        Motors.motors2(5, 700, 700)
        for (let i = 0; i < 10; i++) {
            basic.pause(5)
            last_statel = pins.analogReadPin(pin_l)
            if (last_statel > upper_bounce_l) {
                upper_bounce_l = last_statel
            } else if (last_statel < lower_bounce_l) {
                lower_bounce_l = last_statel
            }
            basic.pause(5)
            last_stater = pins.analogReadPin(pin_r)
            if (last_stater > upper_bounce_r) {
                upper_bounce_r = last_stater
            } else if (last_stater < lower_bounce_r) {
                lower_bounce_r = last_stater
            }
        }
        // Stop motors
        Motors.motors2(5, 0, 0)

        mid_l = Math.floor(upper_bounce_l - lower_bounce_l)
        mid_r = Math.floor(upper_bounce_r - lower_bounce_r)
        lower_bounce_l = lower_bounce_l + Math.floor(mid_l * 0.4)
        lower_bounce_r = lower_bounce_r + Math.floor(mid_r * 0.4)
        upper_bounce_l = upper_bounce_l - Math.floor(mid_l * 0.4)
        upper_bounce_r = upper_bounce_r - Math.floor(mid_r * 0.4)
        mid_l = Math.floor(mid_l * 0.5)
        mid_r = Math.floor(mid_r * 0.5)
    }

    //Level 2 export functions

    //Level 2.1
    /**
         * Aktuelle Radgeschwindigkeit in Meter pro Sekunde ausgeben:
         */
    //% blockid="floidpro_speed" block="Gib Radgeschwindigkeit in Meter pro Sekunde an vom Rad: %rad"
    //% weight=20 blockGap=8
    //% group="Level 2: Messung"
    export function speed(rad: Raddrehung): number {
        return current_speed_einheit(1, rad)
    }

    //Level 2.2
    /**
         * Zurückgelegte Distanz in Metern ausgeben:
         */
    //% blockid="floidpro_distance" block="Gebe die zurückgelegte Distanz in Metern an vom Rad: %rad"
    //% weight=20 blockGap=8
    //% group="Level 2: Messung"
    export function distance(rad: Raddrehung): number {
        return current_wheel_dist(1, rad)
    }

    //Level 2.3
    /**
         * Aktuelle Radgeschwindigkeit in Umdrehungen pro Sekunde ausgeben:
         */
    //% blockid="floidpro_rot_speed" block="Gib Radgeschwindigkeit in Umdrehungen pro Sekunde an vom Rad: %rad"
    //% weight=20 blockGap=8
    //% group="Level 2: Messung"
    export function rot_speed(rad: Raddrehung): number {
        return current_speed_einheit(2, rad)
    }

    //Level 2.4
    /**
         * Zurückgelegte Umdrehungen ausgeben:
         */
    //% blockid="floidpro_rot_dist" block="Gebe die zurückgelegte Umdrehungen an vom Rad: %rad"
    //% weight=20 blockGap=8
    //% group="Level 2: Messung"
    export function rot_dist(rad: Raddrehung): number {
        return current_wheel_dist(2, rad)
    }

    //Level 2.5
    /**
         * Aktuelle Radgeschwindigkeit in Pulse pro Sekunde ausgeben:
         */
    //% blockid="floidpro_pulse_speed" block="Gib Radgeschwindigkeit in Pulse pro Sekunde an vom Rad: %rad"
    //% weight=20 blockGap=8
    //% group="Level 2: Messung"
    export function pulse_speed(rad: Raddrehung): number {
        return current_speed_einheit(3, rad)
    }

    //Level 2.6
    /**
         *Gezählte Pulse ausgeben:
         */
    //% blockid="floidpro_pulse_count" block="Gebe die gezählten Pulse an vom Rad: %rad"
    //% weight=20 blockGap=8
    //% group="Level 2: Messung"
    export function pulse_count(rad: Raddrehung): number {
        return current_wheel_dist(3, rad)
    }

    // Level 2.7
    /**
           * Setze den Messpunkt der Radsensoren Zurück:
           */
    //% blockid="floidpro_reset_counter" block="Setze den Radsensorzähler zurück"
    //% weight=20 blockGap=8
    //% group="Level 2: Messung"
    export function reset_counter(): void {
        wheelspeed_timestamp = input.runningTime()
        wheel_l = 0
        wheel_r = 0
    }

    //Level 2.8
    /**
         *Aktuellen Sensorwert ausgeben
         */
    //% blockid="floidpro_read_wheel_state" block="Gebe den Aktuellen Sensorwert an vom Rad: %rad"
    //% weight=20 blockGap=8
    //% group="Level 2: Messung"
    export function read_wheel_state(rad: Raddrehung): number {
        //basic.clearScreen()
        let neededpin = pin_l
        let mid = mid_l
        let lower = lower_bounce_l
        let upper = upper_bounce_l
        if (rad == 2) {
            neededpin = pin_r
            mid = mid_r
            lower = lower_bounce_r
            upper = upper_bounce_r
        }
        let state = pins.analogReadPin(neededpin)
        if (state <= lower) {
            return 0
        } else if (state >= upper) {
            return 1
        } else {
            return -1
        }
    }



    function wheels_turning(): number {
        // returns are 0 for not turning, 1 for both turning and -1 for only one turning
        basic.clearScreen()

        let distancel = 0
        let distancer = 0
        let last_statel = pins.analogReadPin(pin_l)
        basic.pause(5)
        let last_stater = pins.analogReadPin(pin_r)
        basic.pause(5)
        let new_statel = pins.analogReadPin(pin_l)
        basic.pause(5)
        let new_stater = pins.analogReadPin(pin_r)
        basic.pause(5)
        let timeout = 0

        while (distancel == 0 && distancer == 0 && timeout < 20) {
            let next_statel = pins.analogReadPin(pin_l)
            basic.pause(5)
            let next_stater = pins.analogReadPin(pin_r)
            Core.showNumber(next_statel, 4, 1, 1)
            Core.showNumber(next_stater, 4, 2, 1)
            if (Math.abs(new_statel - last_statel) >= 100 && Math.abs(new_statel - next_statel) <= 100) { //here we should use mid_l and mid_r but isnt tested
                distancel = 1
            }
            last_statel = new_statel
            new_statel = next_statel

            if (Math.abs(new_stater - last_stater) >= 100 && Math.abs(new_stater - next_stater) <= 100) {
                distancer = 1
            }
            last_stater = new_stater
            new_stater = next_stater
            timeout += 1
            basic.pause(5)
        }
        if (distancel && distancer) {
            return 1
        } else if (!distancel && !distancer) {
            return 0
        } else {
            return -1
        }
    }

    //Level 3

    //Level 3.1
    /**
     * Kurvenfahrt: 
     */
    //% blockid="floidpro_circle" block="Kurven fahrt %degrees ° mit %radius cm Radius"
    //% degrees.min=0 degrees.max=360
    //% radius.min=0 radius.max=255
    //% weight=20 blockGap=8
    //% group="Fahrmanöver und Verifikation"
    //% inlineInputMode=inline
    export function circle(degrees: number, radius: number, directionx: number, directiony: number): void {
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
        let last_statel = pins.analogReadPin(pin_l)
        let last_stater = pins.analogReadPin(pin_r)
        basic.pause(10)
        let new_statel = pins.analogReadPin(pin_l)
        let new_stater = pins.analogReadPin(pin_r)
        basic.pause(10)

        let changes = 0

        if (directionx == 0) {
            Motors.motors2(5, speed, speed * targetdistancer / targetdistancel) // Start motors: direction = 5 vorwärts, 10 rückwärts
        } else if (directionx == 1) {
            Motors.motors2(10, speed, speed * targetdistancer / targetdistancel) // Start motors: direction = 5 vorwärts, 10 rückwärts
        }

        // Schleife bis Soll-Distanzen erreicht
        while (distancel < targetdistancel && distancer < targetdistancer) {
            let next_statel = pins.analogReadPin(pin_l)
            let next_stater = pins.analogReadPin(pin_r)

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


    //Level 3.2
    /**
     * Graddrehung: 
     */
    //% blockid="floidpro_turn" block="Drehung um %targetdegrees °"
    //% targetdegrees.min=-360 targetdegrees.max=360
    //% weight=20 blockGap=8
    //% group="Fahrmanöver und Verifikation"
    export function turn(targetdegrees: number): void {
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
        let last_statel = pins.analogReadPin(pin_l)
        let last_stater = pins.analogReadPin(pin_r)
        basic.pause(10)
        let new_statel = pins.analogReadPin(pin_l)
        let new_stater = pins.analogReadPin(pin_r)
        basic.pause(10)

        let changes = 0

        Motors.motors2(m, 700, 700)
        // Schleife bis beide Seiten die Zielentfernung erreicht haben
        while (distancel < targetdistance && distancer < targetdistance) {
            let next_statel = pins.analogReadPin(pin_l)
            let next_stater = pins.analogReadPin(pin_r)

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

    //Level 3.3
    /**
     * Geradeausfahren: 
     */
    //% blockid="floidpro_straight" block="Fahre %distance cm geradeaus %direction"
    //% distance.min=0 distance.max=255
    //% direction.min= 0 direction.max= 1
    //% weight=20 blockGap=8
    //% group="Fahrmanöver und Verifikation"
    export function straight(distance: number, direction: number): void {

        basic.clearScreen()

        let distancel = 0
        let distancer = 0
        let last_statel = get_state(pin_l)
        let last_stater = get_state(pin_r)
        basic.pause(10)
        let new_statel = get_state(pin_l)
        let new_stater = get_state(pin_r)
        basic.pause(10)
        let changes = 0

        let targetdistance = distance
        if (direction == 0) {
            Motors.motors2(5, 700, 700*0) // Start motors: direction = 5 vorwärts, 10 rückwärts
        } else if (direction == 1) {
            Motors.motors2(10, 700, 700) // Start motors: direction = 5 vorwärts, 10 rückwärts
        }

        while (distancel < targetdistance && distancer < targetdistance) { // should be || but pin3 has issues ; tbf 
            let next_statel = get_state(pin_l)
            let next_stater = get_state(pin_r)
            if (next_statel) { Core.showNumber(1, 4, 1, 1)}
            else { Core.showNumber(0, 4, 1, 1)}
            if (next_stater) { Core.showNumber(1, 4, 2, 1) }
            else { Core.showNumber(0, 4, 2, 1) }
            Core.showNumber(pins.analogReadPin(pin_l), 4, 1, 1)
            Core.showNumber(pins.analogReadPin(pin_r), 4, 2, 1)
            if ((new_statel != last_statel) && (new_statel == next_statel)) {
                changes += 1
                distancel += tyre_diameter / numberofholes
            }
            last_statel = new_statel
            new_statel = next_statel

            if ((new_stater != last_stater) && (new_stater == next_stater)) {
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


    //Level 3.4
    /**
         * Drehe die Räder um eine Bestimmte Anzahl an Drehungen: 
         */
    //% blockid="floidpro_speed_to" block="Beschleunige auf Stufe %rad"
    //% turns.min=1 turns.max=10
    //% weight=20 blockGap=8
    //% group="Level 3: Antriebsregelung"
    export function speed_to(rad: Raddrehung, turns: number): void {
        //return 0
    }

    //Level 3.5
    /**
         * Drehe die Räder um eine Bestimmte Anzahl an Drehungen: 
         */
    //% blockid="floidpro_turn_wheel" block="Drehe Rad %rad um %turns Umdrehungen"
    //% turns.min=1 turns.max=10
    //% weight=20 blockGap=8
    //% group="Level 3: Antriebsregelung"
    export function turn_wheel(rad: Raddrehung, turns: number): void {

        basic.clearScreen()
        let neededpin = pin_l
        let mid = mid_l
        if (rad == 2) {
            neededpin = pin_r
            mid = mid_r
        }

        let distance = 0
        let last_state = pins.analogReadPin(neededpin)
        basic.pause(10)
        let new_state = pins.analogReadPin(neededpin)
        basic.pause(10)
        if (rad == 1) {
            Motors.motors2(5, 700, 0) // Start motors: direction = 5 vorwärts, 10 rückwärts
        } else if (rad == 2) {
            Motors.motors2(5, 0, 700) // Start motors: direction = 5 vorwärts, 10 rückwärts
        } else {
            Motors.motors2(5, 700, 700) // Start motors: direction = 5 vorwärts, 10 rückwärts
        }
        wheelspeed_timestamp = input.runningTime()
        while (distance < (turns * numberofholes)) {
            let next_state = pins.analogReadPin(neededpin)
            if (Math.abs(new_state - last_state) >= mid && Math.abs(new_state - next_state) <= mid) {
                distance += 1
            }
            last_state = new_state
            new_state = next_state
            basic.pause(10)
        }

        // Stop motors
        Motors.motors2(5, 0, 0)
    }





}
