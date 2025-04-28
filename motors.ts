/// <reference path="FloidPro.ts" />


//% weight=180 color=#004A99 icon="" block="FloidPro - Antrieb"
namespace Motors{
    
    function testDevice(address: number): boolean {
        let testValue = 128;
        try {

            let response = pins.i2cReadNumber(address, NumberFormat.UInt8BE, false)
            if (response != 0) {
                return true
            }
            else {
                pins.i2cWriteNumber(address, testValue, NumberFormat.UInt8BE, false)
                let response = pins.i2cReadNumber(address, NumberFormat.UInt8BE, false)
                pins.i2cWriteNumber(address, 0, NumberFormat.UInt8BE, false)
            }
            return response === testValue
        } catch (e) {
            // Falls eine Ausnahme auftritt, ist die Adresse ungültig
            return false
        }
    }
    
    /**
     * Antriebssteuerung für Module 1-3: ein positiver Wert lässt die Motoren vorwärts drehen, ein negativer rückwärts.
     */
    //% blockid="floidpro_motors1" block="Setze Motor A auf %left und Motor B auf %right"
    //% left.min=-10 left.max=10
    //% right.min=-10 right.max=10
    //% weight=60 blockGap=8

    export function motors1(left: number, right: number): void {
        let left1 = left
        // Antriebszahl berechnen
        if (testDevice(61)){
            if (Math.sign(left) != Math.sign(right)){ //Motoren würden bei diesen Bedingungen gegenläufig drehen
                if (Math.abs(left) == Math.abs(right)){
                    if (Math.sign(left) < Math.sign(right)){
                        left = 0
                    }
                    else{
                        right = 0
                    }
                }
            if ( Math.abs(left) < Math.abs(right)){
                left = 0
                left1 = right
            }
            if (Math.abs(left) > Math.abs(right)) {
                right = 0
                left1 = left
            }
                
            }
        }
        let n = 0;
        if (left1 > 0) {
            n += 1
        }
        else if (left1 < 0) {
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

    function motors3(drivenumber: number, lon: number, loff: number, ron: number, roff:number): void {

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

    function motors4(speed: number, direction: number): void {
        // Antriebszahl berechnen
        let n = 0;
        let left=0;
        let right=0;

        left = speed + direction; //Werte zwischen -20 und 20
        right = speed - direction; //Werte zwischen -20 und 20

        if (testDevice(61)){
            if (direction < 0 ){left = 0}
            else if (direction > 0){right = 0} 
        }

        
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
        pins.analogWritePin(AnalogPin.P0, Math.min(Math.abs(left) / 10 * 723 + 300,1023))
        pins.analogWritePin(AnalogPin.P1, Math.min(Math.abs(right) / 10 * 723 + 300,1023))

        //
        pins.i2cWriteNumber(57, n, NumberFormat.Int8LE, false)
        pins.i2cWriteNumber(59, n, NumberFormat.Int8LE, false)
        pins.i2cWriteNumber(61, n, NumberFormat.Int8LE, false)
    }

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
        if (direction == 0) {
            motors2(5, 700, 700) // Start motors: direction = 5 vorwärts, 10 rückwärts
        } else if (direction == 1) {
            motors2(10, 700, 700) // Start motors: direction = 5 vorwärts, 10 rückwärts
        }
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
     * Geradeausfahren: 
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

        motors2(m, 700 , 700)
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

}