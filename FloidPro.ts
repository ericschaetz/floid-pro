/**
 * Hier sind Funktionen und Parameter implementiert, welche für die gesamte Erweiterung von Relevanz sind.
 * Außerdem werden für die jeweiligen Namespaces die Funktionen implementiert, welche nur im Backend verfügbar sind.
 */
/**************************************************************************************************/
/**************************************************************************************************/


/**
 * Hier werden globale Variablen für PWM, Display usw. definiert
 */

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

let level = 11; //Level auf dem der Roboter arbeitet

let staticdisplay = false;

let pwmLeft = 0;
let pwmRight = 0;
let running = false;

const pinLeft = DigitalPin.P0;
const pinRight = DigitalPin.P1;
const periode = 10 // in ms;

let lights = [1, 1, 1, 1, 1, 1, 1, 1]

let reservepin60 = false

/**************************************************************************************************/

/** 
* Diese Funktion prüft für eine Adresse, ob ein I^2C-Chip angeschlossen ist.
*/
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



/**************************************************************************************************/

/**
 * In diesem Abschnitt werden die Drop-down-Listen initialisiert
 */

enum OnOff {
    //% block="An"
    On = 0,

    //% block="Aus"
    Off = 1,
}

enum Level {
    //% block="Level 1A"
    l1A = 11,

    //% block="Level 1B"
    l1B = 12,

    //% block="Level 2A"
    l2a = 21,

    //% block="Level 2B"
    l2b = 22,

    //% block="Level 3A"
    l3a = 31,

    //% block="Level 3B"
    l3b = 32,

    //% block="Level 3C"
    l3c = 33,
}

function leveltranslater(lvl:number): string{
    const firstDigit = Math.floor(lvl / 10); // z. B. 3 bei 32
    const secondDigit = lvl % 10;            // z. B. 2 bei 32

    const letter = String.fromCharCode(64 + secondDigit); // 1→A, 2→B, 3→C

    return `${firstDigit}${letter}`;
}

enum USSensor {
    //% block="rechts"
    Rechts = 0,

    //% block="vorne"
    Vorne = 1,

    //% block="links"
    Links = 2,

    //% block="hinten"
    Hinten = 3,
}

enum BumperSensor {
    //% block="vorne links"
    VL = 0,

    //% block="vorne rechts"
    VR = 1,  

    //% block="hinten links"
    HL = 2,

    //% block="hinten rechts"
    HR = 3,    
}

enum Linetracker {
    //% block="LT0"
    LT0 = 0,

    //% block="LT1"
    LT1 = 1,

    //% block="LT2"
    LT2 = 2,

    //% block="LT3"
    LT3 = 3,
}

enum Light {
    //% block="Blinker VL"
    BVL = 0,

    //% block="Blinker VR"
    BVR = 3,

    //% block="Blinker HL"
    BHL = 4,

    //% block="Blinker HR"
    BHR = 7,

    //% block="Licht VL"
    LVL = 1,

    //% block="Licht VR"
    LVR = 2,

    //% block="Licht HL"
    LHL = 5,

    //% block="Licht HR"
    LHR = 6,

    
}

enum Controller{
    //% block="Motormodul 1 @ 57"
    M1 = 57,

    //% block="Beleuchtung @ 58"
    BL = 58,

    //% block="Motormodul 2 @ 59"
    M2 = 59,

    //% block="Motormodul 3 @ 61"
    M3 = 61,

    //% block="Ultraschall/RGB-LED @ 62"
    US = 62,

    //% block="Motormodul 4 @ 63"
    M4 = 63,

}
/**************************************************************************************************/
