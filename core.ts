enum OnOff {
    //% block="An"
    On = 0,

    //% block="Aus"
    Off = 1,
}

/**
 * Custom blocks
 */
//% weight=200 color=#004A99 icon="" block="FloidPro - Hauptsektion"
//% groups="['Display', 'Bumper', 'Beleuchtung','Initialisierung' ]"
namespace Core {

    /**
     * Prüft ob ein Controller an einem 
     */
    //% blockid="floidpro_i2c_scan" 
    //% block="Controller %adress ist angeschlossen" weight=90
    //% group="Initialisierung"
    export function testDevice(address: number): boolean {
        let testValue=42;
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
     * Init-Funktion, startet den Roboter korrekt
     */
    //% blockid="floidpro_init" 
    //% block="FloidPro hochfahren" weight=100
    //% group="Initialisierung"
    export function init(): void {

        for (let i = 0; i < 3; i++) {
            pins.i2cWriteNumber(38, 2 ** ((2 * i) + 2) + 2 ** (7 - 2 * i), NumberFormat.Int8LE, false)
            pins.i2cWriteNumber(62, 2 ** ((2 * i) + 2) + 2 ** (7 - 2 * i), NumberFormat.Int8LE, false)
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
        pins.i2cWriteNumber(62, 252, NumberFormat.Int8LE, false)
        initLCD()
        showOnLcd("FloidPro", 1, 7)
    }

    const LCD_ADDR = 0x27; // I2C-Adresse des Displays (Standard)
    const LCD_WIDTH = 20; // Zeichen pro Zeile des Displays
    const LCD_CHR = 1; // Modus für Daten
    const LCD_CMD = 0; // Modus für Befehle
    const LCD_LINE_1 = 0x80; // Adresse für Zeile 1
    const LCD_LINE_2 = 0xC0; // Adresse für Zeile 2
    const LCD_LINE_3 = 0x94; // Adresse für Zeile 3 (für 4-Zeilen-Displays)
    const LCD_LINE_4 = 0xD4; // Adresse für Zeile 4
    const LCD_BACKLIGHT = 0x08; // Hintergrundbeleuchtung
    const ENABLE = 0x04; // Enable Bit

    // Display initialisiere

    function initLCD(): void {
        lcdByte(0x33, LCD_CMD); // Initialisierung
        lcdByte(0x32, LCD_CMD); // Initialisierung
        lcdByte(0x06, LCD_CMD); // Cursor nach rechts
        lcdByte(0x0C, LCD_CMD); // Display ein, Cursor aus
        lcdByte(0x28, LCD_CMD); // 4 Zeilen, 5x7-Matrix
        lcdByte(0x01, LCD_CMD); // Bildschirm leeren
        basic.pause(5); // Wartezeit für Verarbeitung
    }

    // Sendet ein Byte an das LCD
    function lcdByte(bits: number, mode: number): void {
        const bitsHigh: number = mode | (bits & 0xF0) | LCD_BACKLIGHT;
        const bitsLow: number = mode | ((bits << 4) & 0xF0) | LCD_BACKLIGHT;

        // High-Bits senden
        i2cWrite(LCD_ADDR, bitsHigh);
        lcdToggleEnable(bitsHigh);

        // Low-Bits senden
        i2cWrite(LCD_ADDR, bitsLow);
        lcdToggleEnable(bitsLow);
    }

    // Umschalten des Enable-Bits, um das LCD zu triggern
    function lcdToggleEnable(bits: number): void {
        basic.pause(1); // Kurze Wartezeit
        i2cWrite(LCD_ADDR, bits | ENABLE);
        basic.pause(1); // Wartezeit für das Umschalten
        i2cWrite(LCD_ADDR, bits & ~ENABLE);
        basic.pause(1);
    }

    /**
     * Zeige einen String auf dem LCD an
     * @param message is String, eg: "Hello"
     * @param line is zeilennummer, [1 - 4], eg: 1
     * @param column is spaltennummer, [1 - 15], eg: 1
     */
    // Funktion zum Anzeigen einer Zeichenkette auf einer bestimmten Zeile
    //% blockid="floidpro_showlcd" block="Stelle Text %message in Zeile %line und Spalte %column dar"
    //% line.min=1 line.max=4
    //% column.min=1 column.max=20
    //% weight=90 blockGap=8
    //% group="Display"
    export function showOnLcd(message: string, line: number, column: number): void {
        column -= 1
        // Nachricht auf die Displaybreite anpassen
        if (message.length + column > LCD_WIDTH) {
            message = message.slice(0, LCD_WIDTH - column); // Kürzen, falls zu lang
        }

        // Auswahl der Zeile
        let adresse: number

        if (line === 1) {
            adresse = LCD_LINE_1;
        } else if (line === 2) {
            adresse = LCD_LINE_2;
        } else if (line === 3) {
            adresse = LCD_LINE_3;
        } else if (line === 4) {
            adresse = LCD_LINE_4;
        }
        lcdByte(adresse + column, LCD_CMD);

        // Zeichen einzeln senden
        for (let i = 0; i < message.length; i++) {
            lcdByte(message.charCodeAt(i), LCD_CHR);
        }
    }

    /**
     * Displayinhalt löschen
     */
    //% blockid="floidpro_clearlcd" block="Displayinhalt löschen"
    //% weight=80 blockGap=7
    //% group="Display"
    export function clearLCD(): void {
        lcdByte(0x01, LCD_CMD); // Displayinhalt löschen
        basic.pause(5); // Wartezeit für die LCD-Verarbeitung
    }

    // Funktion für I2C-Schreiben
    function i2cWrite(address: number, data: number): void {
        pins.i2cWriteBuffer(address, pins.createBufferFromArray([data]));
    }

    /**
     * Zahl auf dem Display anzeigen und rechtsbündig ausrichten
     * @param zahl is number, eg: 0
     * @param zahl ist Zahl, welche angezeigt wird
     * @param line is zeilennummer, [1 - 4], eg: 1
     * @param column is spalte, [1 - 20], eg: 1
     * @param laenge is number, [1,10], eg: 3
     */
    //% blockid="floidpro_shownumber" block="Zeige Zahl %zahl mit max. Länge %laenge in Zeile %line und Spalte %column"
    //% weight=85 blockGap=8
    //% group="Display"
    //% line.min=1 line.max=4
    //% column.min=1 column.max=20
    //% inlineInputMode=inline
    export function showNumber(zahl: number, laenge: number, line: number, column: number): void {
        let message = zahl + '';
        let padding = "";


        if (message.length > laenge) {
            message = message.slice(0, laenge); // Kürzen, falls zu lang
        } else {
            for (let i = 0; i < laenge - message.length; i++) {
                padding += " ";
            }
        }
        message = padding + message;
        showOnLcd(message, line, column);
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
    //% block="I²C Pins"
    export function i2cpins(): number[] {
        let availableAddresses: number[] = [];
        for (let address = 1; address <= 127; address++) {
            try {
                // Sende ein leeres Byte an die Adresse
                pins.i2cWriteNumber(address, 1, NumberFormat.UInt8LE, true);
                pins.i2cWriteNumber(address, 0, NumberFormat.Int8LE, false)
                // Wenn keine Fehler auftreten, füge die Adresse zur Liste hinzu
                availableAddresses.push(address);
            } catch (e) {
                // Ignoriere Fehler, die auftreten, wenn keine Antwort kommt
            }
        }
        //return 0
        return availableAddresses;

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
    export function beleuchtung(VL_Blinker: boolean, VL_Licht: boolean, VR_Blinker: boolean, VR_Licht: boolean, HL_Blinker: boolean, HL_Licht: boolean, HR_Blinker: boolean, HR_Licht: boolean): void {
        let n = 0
        if (!VL_Blinker) {
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

    
    let lights = [1,1,1,1,1,1,1,1]
    //%block="Schalte Lampe %light auf %status"
    export function setlights(light:number, status:OnOff):void{
        lights[light] = status;
        let n = 0;
        for (let i = 0; i < 8; i++) {
            n += 2**(i*lights[i])
        }
        pins.i2cWriteNumber(58, n, NumberFormat.Int8LE, false)
        Core.showNumber(n, 3, 1, 1)
    }
}
