 //% weight=180 color=#004A99 icon="" block="FloidPro - Antrieb"
namespace Motors{
    /**
     * Antriebssteuerung für Module 1-4: ein positiver Wert lässt die Motoren vorwärts drehen, ein negativer rückwärts.
     */
    //% blockid="floidpro_motors3" block="Setze Motor A auf %left und Motor B auf %right"
    //% left.min=-10 left.max=10
    //% right.min=-10 right.max=10
    //% weight=60 blockGap=8

    export function motors3(left: number, right: number): void {
        let left1 = left

        // Antriebszahl berechnen
        if (testDevice(61)){ //Passt die Vorzeichen entsprechend der Spezifikationen von Einheit 3 an
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

        let n = 0; //Berechnung der Steuerzahl in Abhänigkeit zu den Vorzeichen der Variablen
        if (left1 > 0) { //Motor A vorwärts
            n += 1
        }
        else if (left1 < 0) { //Motor A rückwärts
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
        if (testDevice(63)){
            pwm(Math.abs(left) / 10 * 723 + 300, Math.abs(right) / 10 * 723 + 300)
        }
        else{
        pins.analogWritePin(AnalogPin.P0, Math.abs(left) / 10 * 723 + 300)
        pins.analogWritePin(AnalogPin.P1, Math.abs(right) / 10 * 723 + 300)
        }
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
        // Senden der Steuerzahl an alle Controlleradressen
        pins.i2cWriteNumber(57, drivenumber, NumberFormat.Int8LE, false)
        pins.i2cWriteNumber(59, drivenumber, NumberFormat.Int8LE, false)
        pins.i2cWriteNumber(61, drivenumber, NumberFormat.Int8LE, false)
        pins.i2cWriteNumber(63, drivenumber, NumberFormat.Int8LE, false)

        // PWM schreiben
        if (testDevice(63)) {
            pwm(Math.abs(left) / 10 * 723 + 300, Math.abs(right) / 10 * 723 + 300)
        }
        else {
            pins.analogWritePin(AnalogPin.P0, Math.abs(left) / 10 * 723 + 300)
            pins.analogWritePin(AnalogPin.P1, Math.abs(right) / 10 * 723 + 300)
        }
    }

    /**
     * Manuelle Steuerung: Die Steuerzahl bestimmt die Richtung der Motoren, PWM-Werte die Geschwindigkeit
     */
    //% blockid="floidpro_motors1" block="Sende Steuerzahl %drivenumber. Schalte Motor A: AN:%lon ms AUS:%loff ms und Motor B: AN:%ron ms AUS:%roff ms."
    //% drivenumber.min=0 drivenumber.max=255
    //% lon.min=0 lon.max=1023
    //% ron.min=0 ron.max=1023
    //% loff.min=0 loff.max=1023
    //% roff.min=0 roff.max=1023
    //% weight=80 blockGap=8
    //% inlineInputMode=inline

    export function motors1(drivenumber: number, lon: number, loff: number, ron: number, roff:number): void {

        // PWM-Funktion schreiben
    
        pins.i2cWriteNumber(57, drivenumber, NumberFormat.Int8LE, false)
        pins.i2cWriteNumber(59, drivenumber, NumberFormat.Int8LE, false)
        pins.i2cWriteNumber(61, drivenumber, NumberFormat.Int8LE, false)
    }

    
    /**
     * Steuerung der Motoren mit Rihcutng und Geschwindigkeit 
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

    function stopMotors() {
        runningPWM = false
        runningTimed = false
        currentMode = "none"
        pins.digitalWritePin(pinLeft, 0)
        pins.digitalWritePin(pinRight, 0)
    }

    function pwm(left: number, right: number): void {
        // Stoppe die andere Funktion, falls aktiv
        if (currentMode === "timed") stopMotors()

        pwmLeft = Math.clamp(0, 1023, left)
        pwmRight = Math.clamp(0, 1023, right)

        if (pwmLeft === 0 && pwmRight === 0) {
            stopMotors()
            return
        }

        if (runningPWM) return
        runningPWM = true
        currentMode = "pwm"

        control.inBackground(function () {
            const step = 100
            while (runningPWM) {
                let dutyL = pwmLeft / 1023
                let dutyR = pwmRight / 1023

                let einL = periode * dutyL * 1000
                let einR = periode * dutyR * 1000

                for (let t = 0; t < periode * 1000; t += step) {
                    if (!runningPWM) break
                    pins.digitalWritePin(pinLeft, t < einL ? 1 : 0)
                    pins.digitalWritePin(pinRight, t < einR ? 1 : 0)
                    control.waitMicros(step)
                }

                if (pwmLeft === 0 && pwmRight === 0) stopMotors()
            }
        })
    }

    function timedPWM(leftOn: number, leftOff: number, rightOn: number, rightOff: number): void {
        // Stoppe PWM, falls aktiv
        if (currentMode === "pwm") stopMotors()

        if (leftOn <= 0 && rightOn <= 0) {
            stopMotors()
            return
        }

        if (runningTimed) return
        runningTimed = true
        currentMode = "timed"

        control.inBackground(function () {
            const step = 100
            const cycleTime = Math.max(leftOn + leftOff, rightOn + rightOff) * 1000

            while (runningTimed) {
                for (let t = 0; t < cycleTime; t += step) {
                    if (!runningTimed) break

                    let leftTime = leftOn * 1000
                    let rightTime = rightOn * 1000

                    pins.digitalWritePin(pinLeft, t < leftTime ? 1 : 0)
                    pins.digitalWritePin(pinRight, t < rightTime ? 1 : 0)

                    control.waitMicros(step)
                }

                if (leftOn <= 0 && rightOn <= 0) stopMotors()
            }
        })
    }

    

}
