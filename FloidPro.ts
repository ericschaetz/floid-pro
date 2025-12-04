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
let advanced = true ;

let statusa = 0;
let statusb = 0;

let shouldrun = false;

let pwmpina: PWMPin = { pin: AnalogPin.P0, pwmon: 0, pwmoff: 0 , status: 0 }
let pwmpinb: PWMPin = { pin: AnalogPin.P1, pwmon: 0, pwmoff: 0, status: 0 }

let motor_a = 0;
let motor_b = 0;

let staticdisplay = false;

let reservepin60 = false;

let readus= 0;

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

/**
 * Funktion zum zeigen einer Fehlermeldung
 */
function errornode(funct:string):void{
    Core.clearLCD()
    Core.showOnLcd("-Fehler: Block ", 1, 1)
    Core.showOnLcd("-" + funct, 2, 1)
    Core.showOnLcd("-nicht erlaubt", 3, 1)
    while (true){
    }  
}

function flip(pin: PWMPin): number{
    if (!!pin.status){
        if (pin.pwmoff != 0) {
            pins.analogWritePin(pin.pin,0)
            pin.status = 0
            return pin.pwmoff
        } 
        return pin.pwmon   
        
    }
    else{
        if (pin.pwmon != 0){
            pins.analogWritePin(pin.pin, 1023)
            pin.status = 1
            return pin.pwmon
        }
        return pin.pwmoff
    }
    
    
}

control.inBackground(() => {
    while (true) {
        let resta = pwmpina.pwmoff
        let restb = pwmpinb.pwmoff
        let t = 0
        while (shouldrun){
            t = Math.min(resta,restb)
            resta = resta - t
            restb = restb - t
            basic.pause(t)
            if (resta == 0){
                resta = flip(pwmpina)
            }
            if (restb == 0){
                restb = flip(pwmpinb)
            }
            
        }
        basic.pause(1)
    }
})

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

type PWMPin = {
    pin: AnalogPin
    pwmon: number
    pwmoff: number
    status: number
}

enum Level {
    //% block="Level 1A"
    l1a = 11,

    //% block="Level 1B"
    l1b = 12,

    //% block="Level 1C"
    l1c = 13,

    //% block="Level 2A"
    l2a = 21,

    //% block="Level 2B"
    l2b = 22,

    //% block="Level 2C"
    l2c = 23,

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

enum Controller_write {
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

enum Controller_read {
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

    //%

    //% block="Motormodul 4 @ 63"
    M4 = 63,

    //% block="Bumper @ 60"
    B = 60,

}

enum Modus{
    //% block="Vollständig"
    einfach = 0,

    //% block="Eingeschränkt"
    erweitert = 1,
 }

 enum RGB{
     //% block="A"
     a=1,

     //% block="B"
     b=2,
 }

enum Raddrehung {
    //% block="links"
    l = 1,

    //% block="rechts"
    r = 2,

    //% block="beide"

    b = 3,
}

enum Kurvenrichtung {
    //% block="links"
    l = 1,

    //% block="rechts"
    r = 2,

}

enum Geschwindigkeit_Einheit {
    //% block="Zentimeter"
    cm = 1,

    //% block="Drehungen"
    drehungen = 2,

    //% block="Grad"

    grad = 3,
}
/**************************************************************************************************/
