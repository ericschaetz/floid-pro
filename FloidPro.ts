
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
 * Display-Funktionen
 */
//% weight=100 color=#0fbc11 icon="🚗"
namespace Display {
    // LCD Display Konstanten und Befehle
    const LCD_ADDR = 0x27; // I2C Adresse des Displays (Standard)
    const LCD_WIDTH = 20; // Zeichen pro Zeile des Displays
    const LCD_CHR = 1; // Modus für Daten
    const LCD_CMD = 0; // Modus für Befehle
    const LCD_LINE_1 = 0x80; // Adresse für Zeile 1
    const LCD_LINE_2 = 0xC0; // Adresse für Zeile 2
    const LCD_LINE_3 = 0x94; // Adresse für Zeile 3
    const LCD_LINE_4 = 0xD4; // Adresse für Zeile 4
    const LCD_BACKLIGHT = 0x08; // Hintergrundbeleuchtung
    const ENABLE = 0x04; // Enable Bit

    /**
     * Initialisiert das LCD-Display
     */
    //% block "Init LCD"
    export function initLCD() {
        lcdByte(0x33, LCD_CMD); // Initialisierung
        lcdByte(0x32, LCD_CMD); // Initialisierung
        lcdByte(0x06, LCD_CMD); // Cursor nach rechts
        lcdByte(0x0C, LCD_CMD); // Display ein, Cursor aus
        lcdByte(0x28, LCD_CMD); // 4 Zeilen, 5x7-Matrix
        lcdByte(0x01, LCD_CMD); // Bildschirm leeren
        basic.pause(5);
    }

    /**
     * Sendet ein Byte an das LCD.
     * @param {number} bits - Zu sendendes Byte.
     * @param {number} mode - Modus: 0 = Befehl, 1 = Daten.
     */
    function lcdByte(bits: number, mode: number) {
        let bitsHigh = mode | (bits & 0xF0) | LCD_BACKLIGHT;
        let bitsLow = mode | ((bits << 4) & 0xF0) | LCD_BACKLIGHT;

        // High-Bits senden
        pins.i2cWriteNumber(LCD_ADDR, bitsHigh, NumberFormat.UInt8BE);
        lcdToggleEnable(bitsHigh);

        // Low-Bits senden
        pins.i2cWriteNumber(LCD_ADDR, bitsLow, NumberFormat.UInt8BE);
        lcdToggleEnable(bitsLow);
    }

    /**
     * Umschalten des Enable-Bits, um das LCD zu triggern.
     * @param {number} bits - Das zu sendende Byte mit Enable-Bit.
     */
    function lcdToggleEnable(bits: number) {
        basic.pause(1);
        pins.i2cWriteNumber(LCD_ADDR, bits | ENABLE, NumberFormat.UInt8BE);
        basic.pause(1);
        pins.i2cWriteNumber(LCD_ADDR, bits & ~ENABLE, NumberFormat.UInt8BE);
        basic.pause(1);
    }

    /**
     * Zeigt eine Zeichenkette auf einer bestimmten Zeile an.
     * @param {string} message - Anzuzeigende Zeichenkette.
     * @param {number} line - Zeilennummer (1-4).
     */
    //% block "LCD String"
    export function lcdString(message: string, line: number) {
        // Nachricht auf die Displaybreite anpassen
        if (message.length < LCD_WIDTH) {
            
            for (let i = 0; i < LCD_WIDTH - message.length; i++) {
                message += " "
            }
        } else {
            message = message.slice(0, LCD_WIDTH);
        }

        // Auswahl der Zeile
        let lineAddress = LCD_LINE_1;
        if (line === 2) lineAddress = LCD_LINE_2;
        else if (line === 3) lineAddress = LCD_LINE_3;
        else if (line === 4) lineAddress = LCD_LINE_4;

        lcdByte(lineAddress, LCD_CMD);

        // Zeichen einzeln senden
        for (let i = 0; i < LCD_WIDTH; i++) {
            lcdByte(message.charCodeAt(i), LCD_CHR);
        }
    }

    /**
     * Löscht den Inhalt des Displays.
     */
    export function clearLCD() {
        lcdByte(0x01, LCD_CMD); // Displayinhalt löschen
        basic.pause(5); // Wartezeit für die LCD-Verarbeitung
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
