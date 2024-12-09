
/**
* Nutze diese Datei für benutzerdefinierte Funktionen und Blöcke.
* Weitere Informationen unter https://makecode.microbit.org/blocks/custom
*/

enum MyEnum {
    //% block="one"
    One,
    //% block="two"
    Two
}


/**
 * Custom blocks
 */
//% weight=100 color=#0fbc11 icon="🚗"
namespace Display {
    // HD44780 I2C Display Bibliothek für den micro:bit
    let I2C_ADDR = 0x27; // Standard I2C-Adresse des Displays

    /**
     * Initialisiert das HD44780-Display über I2C.
     */
    function initHD44780() {
        basic.pause(50); // Wartezeit, damit das Display startet
        sendCommand(0x33); // Initialisierungssequenz
        sendCommand(0x32); // Wechsel zu 4-Bit-Modus
        sendCommand(0x28); // 4-Bit, 2 Zeilen, 5x8-Punkte
        sendCommand(0x0C); // Display EIN, Cursor AUS
        sendCommand(0x06); // Automatisches Weiterschalten des Cursors
        sendCommand(0x01); // Löschen des Displays
    }

    /**
     * Sendet einen Befehl an das Display.
     * @param command Der zu sendende Befehl.
     */
    function sendCommand(command: number) {
        sendI2C(command, 0x00);
    }

    /**
     * Sendet ein Zeichen an das Display.
     * @param char Das Zeichen, das angezeigt werden soll.
     */
    function sendChar(char: number) {
        sendI2C(char, 0x01);
    }

    /**
     * Sendet Daten über I2C an das Display.
     * @param data Die zu sendenden Daten.
     * @param mode 0x00 für Befehle, 0x01 für Daten.
     */
    function sendI2C(data: number, mode: number) {
        let highNibble = (data & 0xF0) | mode | 0x08;
        let lowNibble = ((data << 4) & 0xF0) | mode | 0x08;

        pins.i2cWriteNumber(I2C_ADDR, highNibble | 0x04, NumberFormat.UInt8BE); // Enable HIGH
        pins.i2cWriteNumber(I2C_ADDR, highNibble, NumberFormat.UInt8BE);        // Enable LOW
        pins.i2cWriteNumber(I2C_ADDR, lowNibble | 0x04, NumberFormat.UInt8BE);  // Enable HIGH
        pins.i2cWriteNumber(I2C_ADDR, lowNibble, NumberFormat.UInt8BE);         // Enable LOW
    }

    /**
     * Schreibt einen Text auf das Display.
     * @param text Der anzuzeigende Text.
     */
    function writeText(text: string) {
        for (let i = 0; i < text.length; i++) {
            sendChar(text.charCodeAt(i));
        }
    }
}



/**
 * Custom blocks
 */
//% weight=100 color=#0fbc11 icon="🚗"
namespace FloidPro {
    /**
     * Antrieb
     * @param left Geschwindigkeit links: 10
     * @param right Geschwindigkeit rechts: "Hello"
     */
    //% block
    export function antrieb(left: number, right: number): void {
        // Antriebszahl berechnen
        let n = 0;
        if (left > 0) {
            n += 1
        }
        else if (left < 0) {
            n += 2
        }
        if (right > 0) {
            n += 4
        }
        else if(right < 0){
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
     * Init-Funktion
     */
    //% block
    export function init(): void {
        OLED.init(128, 64)
        OLED.writeStringNewLine("FloidPro")
        
        for (let i = 0; i < 3; i++) {
            pins.i2cWriteNumber(38, 2 ** ((2 * i) + 2) + 2 ** (7 - 2 * i), NumberFormat.Int8LE, false)
            for (let j = 0; j < 5; j++) {
                pins.i2cWriteNumber(58, 255 - 2 ** j - 2 ** (j + 4), NumberFormat.Int8LE, false)
                pins.i2cWriteNumber(56, j + 240 - 2 ** (j + 4), NumberFormat.Int8LE, false)
                basic.pause(40)
            }
            for (let j = 3; j >= 0; j--) {
                pins.i2cWriteNumber(58, 255 - 2 ** j - 2 ** (j + 4), NumberFormat.Int8LE, false)
                pins.i2cWriteNumber(56, j + 240 - 2 ** (j + 4), NumberFormat.Int8LE, false)
                basic.pause(40)
            }
        }
        pins.i2cWriteNumber(58, 255, NumberFormat.Int8LE, false)
        pins.i2cWriteNumber(56, 255, NumberFormat.Int8LE, false)
        pins.i2cWriteNumber(38, 252, NumberFormat.Int8LE, false)

        
    }

    /**
     * Bumper
     */
    //% block
    export function bumper(): number {
        return pins.i2cReadNumber(60, NumberFormat.Int8LE, false)
    }


    /**
     * I²C-Pins
     */
    //% block
    
    export function i2cpins(): number {
        let availableAddresses: number[] = [];
        for (let address = 1; address <= 127; address++) {
            try {
                // Sende ein leeres Byte an die Adresse
                pins.i2cWriteNumber(address, 0, NumberFormat.UInt8LE, true);
                // Wenn keine Fehler auftreten, füge die Adresse zur Liste hinzu
                availableAddresses.push(address);
            } catch (e) {
                // Ignoriere Fehler, die auftreten, wenn keine Antwort kommt
            }
        }
        return 0
        //return availableAddresses;
        
    }


    /**
     * Ultraschall
     */
    //% block
    export function ultraschall(): number {

        return sonar.ping(DigitalPin.P8, DigitalPin.P12, PingUnit.Centimeters)
    }


    /**
     * Beleuchtung
     * @param VL_Blinker
     * @param VL_Licht
     * @param VR_Blinker
     * @param VR_Licht
     * @param HL_Blinker
     * @param HL_Licht
     * @param HR_Blinker
     * @param HR_Licht
     */
    //% block
    export function beleuchtung(VL_Blinker:boolean, VL_Licht:boolean, VR_Blinker: boolean, VR_Licht: boolean, HL_Blinker: boolean, HL_Licht: boolean, HR_Blinker: boolean, HR_Licht: boolean): void {
        let n = 0 
        if (!VL_Blinker){
            n += 1
        }
        if (!VL_Licht) {
            n += 2
        }
        if (!VR_Blinker) {
            n += 8
        }
        if (!VR_Licht) {
            n += 4
        }
        if (!HL_Blinker) {
            n += 16
        }
        if (!HL_Licht) {
            n += 32
        }
        if (!HR_Blinker) {
            n += 128
        }
        if (!HR_Licht) {
            n += 164
        }
        pins.i2cWriteNumber(58, n, NumberFormat.Int8LE, false)
    }

    /**
     * LineTracking
     * @param sensor
     */
    //% block
    export function LineTracking(sensor: number): boolean {
        
        pins.i2cWriteNumber(56, sensor + 240 - 2**(sensor+4), NumberFormat.Int8LE, false)
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
