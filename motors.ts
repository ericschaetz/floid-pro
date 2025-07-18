 //% weight=180 color=#004A99 icon=""  block="FloidPro - Antrieb"
//% groups="['Motorsteuerung', 'Fahrmanöver und Verifikation']"
namespace Motors{

    /**
     * Manuelle Steuerung: Die Steuerzahl bestimmt die Richtung der Motoren, die PWM-Werte die Geschwindigkeit
     */
    //% blockid="floidpro_motors1" block="Sende Steuerzahl %drivenumber. Schalte Motor A: AN:%lon ms AUS:%loff ms und Motor B: AN:%ron ms AUS:%roff ms."
    //% drivenumber.min=0 drivenumber.max=255
    //% lon.min=0 
    //% ron.min=0 
    //% loff.min=0 
    //% roff.min=0
    //% weight=100
    //% group="Motorsteuerung"
    //% inlineInputMode=inline

    export function motors1(drivenumber: number, lon: number, loff: number, ron: number, roff: number): void {

        pwm(lon,loff,ron,roff)

        pins.i2cWriteNumber(57, drivenumber, NumberFormat.Int8LE, false)
        pins.i2cWriteNumber(59, drivenumber, NumberFormat.Int8LE, false)
        pins.i2cWriteNumber(61, drivenumber, NumberFormat.Int8LE, false)
        pins.i2cWriteNumber(63, drivenumber, NumberFormat.Int8LE, false)
    }

    /**
     *  Die Steuerzahl bestimmt die Richtung der Motoren
     */
    //% blockid="floidpro_motors2" block="Sende Steuerzahl %drivenumber. Setze Geschwindigkeit von Motor A auf %left und Geschwindigkeit von Motor B auf %right."
    //% drivenumber.min=0 drivenumber.max=255
    //% left.min=0 left.max=1023
    //% right.min=0 right.max=1023
    //% weight=90 
    //% group="Motorsteuerung"    

    export function motors2(drivenumber:number, left: number, right: number): void {
        
        // Senden der Steuerzahl an alle Controlleradressen
        pins.i2cWriteNumber(57, drivenumber, NumberFormat.Int8LE, false)
        pins.i2cWriteNumber(59, drivenumber, NumberFormat.Int8LE, false)
        pins.i2cWriteNumber(61, drivenumber, NumberFormat.Int8LE, false)
        pins.i2cWriteNumber(63, drivenumber, NumberFormat.Int8LE, false)

        //if (testDevice(63)) {
        if (true){ 
            pwmlight(left,right)
        }
        else {
            shouldrun = false
            pins.analogWritePin(pwmpina.pin, left)
            pins.analogWritePin(pwmpinb.pin, right)
        }
    }

    /**
    * Antriebssteuerung für Module 1-4: ein positiver Wert lässt die Motoren vorwärts drehen, ein negativer rückwärts.
    */
    //% blockid="floidpro_motors3" block="Setze Motor A auf %left und Motor B auf %right"
    //% left.min=-10 left.max=10
    //% right.min=-10 right.max=10
    //% weight=80
    //% group="Motorsteuerung"
    export function motors3(left: number, right: number): void {
        if (level < 20 ) errornode("Motorsteuerung")
        motorseasy(left,right)
    }


    /**
     * Steuerung der Motoren mit Richtung und Geschwindigkeit 
     */
    //% blockid="floidpro_motors4" block="Setze Geschwindigkeit auf %speed und Richtung auf %direction"
    //% speed.min=-10 speed.max=10
    //% direction.min=-10 direction.max=10
    //% weight=70
    //% group="Motorsteuerung"

    export function motors4(speed: number, direction: number): void {
        if (level < 20) errornode("Motorsteuerung")

        let left = Math.clamp(-10, 10, speed + direction)
        let right = Math.clamp(-10, 10, speed - direction)  

        motorseasy(left, right)
    }

    //Ende Frontend*********************************************************************************************************** */
    
    function motorseasy(left: number, right: number): void {
        let sign = left
        motor_a = left
        motor_b = right

        // Antriebszahl berechnen
        if (testDevice(61)&& level<30) { //Passt die Vorzeichen entsprechend der Spezifikationen von Einheit 3 an
            if (Math.sign(left) != Math.sign(right)) { //Motoren würden bei diesen Bedingungen gegenläufig drehen
                if (Math.abs(left) == Math.abs(right)) {
                    if (Math.sign(left) < Math.sign(right)) {
                        left = 0
                    }
                    else {
                        right = 0
                    }
                }
                if (Math.abs(left) < Math.abs(right)) {
                    left = 0
                    sign = right
                }
                if (Math.abs(left) > Math.abs(right)) {
                    right = 0
                }

            }
        }
        //else if (testDevice(61)&&level>30) <<Hier Aufruf Florian (Hintergrund prozess, der beide zaheln getrennt sendet)

        let n = 0; //Berechnung der Steuerzahl in Abhänigkeit zu den Vorzeichen der Variablen
        if (sign > 0) { //Motor A vorwärts
            n += 1
        }
        else if (sign < 0) { //Motor A rückwärts
            n += 2
        }
        if (right > 0) { //Motor B vorwärts
            n += 4
        }
        else if (right < 0) { //Motor B rückwärts
            n += 8
        }

        // Senden der Steuerzahl an alle Controlleradressen
        pins.i2cWriteNumber(57, n, NumberFormat.Int8LE, false)
        pins.i2cWriteNumber(59, n, NumberFormat.Int8LE, false)
        pins.i2cWriteNumber(61, n, NumberFormat.Int8LE, false)
        pins.i2cWriteNumber(63, n, NumberFormat.Int8LE, false)

        // PWM schreiben
        if (testDevice(63)) {
            pwmlight(Math.abs(left) / 10 * 723 + 300, Math.abs(right) / 10 * 723 + 300)
        }
        else {
            shouldrun = false;
            pins.analogWritePin(pwmpina.pin, Math.abs(left) / 10 * 723 + 300)
            pins.analogWritePin(pwmpinb.pin, Math.abs(right) / 10 * 723 + 300)
        }
    }


    function pwmlight(left: number, right: number): void{     
        let periode = 100 //in ms

        let lon = periode * left / 1023
        let loff = periode - lon

        let ron = periode * right / 1023
        let roff = periode - ron

        pwm(lon, loff, ron, roff)

    }

    function pwm(lon: number,loff: number,ron: number,roff: number): void{
        pins.analogWritePin(pwmpina.pin, 0)
        pins.analogWritePin(pwmpinb.pin, 0)
        pwmpina.status = 0
        pwmpinb.status = 0
        if (lon + loff == 0){
            pwmpina.pwmoff = 42
        }
        else pwmpina.pwmoff = loff
        
        pwmpina.pwmon = lon


        if(ron + roff == 0){
            pwmpinb.pwmoff = 42
        }    
        else pwmpinb.pwmoff = roff

        pwmpinb.pwmon = ron

        shouldrun = true        
    }



    

    

}

