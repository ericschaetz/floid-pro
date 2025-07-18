/**
 * Die Hauptsektion umfasst die Funktionen für Initialisierung, Display, I2C, Bumper und Beleuchtung
 */
//% weight=200 color=#004A99 icon="" block="FloidPro - Hauptsektion"
//% groups="['Initialisierung', 'Display', 'Bumper', 'Beleuchtung','I2C' ]"
namespace Core {
    /**
     * Init-Funktion, startet den Roboter korrekt und setzt das Level auf dem der Roboter arbeitet.
     */
    //% blockid="floidpro_init" 
    //% block="FloidPro auf %lvl im Modus %mod hochfahren" 
    //% weight=100
    //% group="Initialisierung"
    export function init(lvl:Level, mod:Modus): void {
        level = lvl
        advanced = !!mod
        initLCD()
        showOnLcd("FloidPro", 2, 7)
        if (advanced){
            showOnLcd("A",4,12)
        }
        showOnLcd(versionnumber, 4, 1)
        showOnLcd(leveltranslater(lvl), 4, 19)

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
        readus=252
    }

    /*Ende Initialisierung*******************************************************************************************************************************/

    /**
     * Zeigt einen String ab einer bestimmten Position auf dem LCD an.
     * @param message is String, eg: "Hallo Welt"
     * @param line is zeilennummer, eg: 1
     * @param column is spaltennummer, eg: 1
     */
    //% blockid="floidpro_showlcd" block="Zeige Text %message in Zeile %line und Spalte %column"
    //% line.min=1 line.max=4
    //% column.min=1 column.max=20
    //% weight=90
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
        staticdisplay = false
    }

    /**
     * Zeigt eine Zahl auf dem Display an und richtet sie rechtsbündig aus.
     * @param zahl is number, eg: 0
     * @param line is zeilennummer, [1 - 4], eg: 1
     * @param column is spalte, [1 - 20], eg: 1
     * @param laenge is number, [1,10], eg: 3
     */
    //% blockid="floidpro_shownumber"
    //% block="Zeige Zahl %zahl mit max. Länge %laenge in Zeile %line und Spalte %column"
    //% weight=85
    //% group="Display"
    //% line.min=1 line.max=4
    //% column.min=1 column.max=20
    //% inlineInputMode=inline
    export function showNumber(zahl: number, laenge: number, line: number, column: number): void {
        if (advanced) errornode("Zeige Zahl")
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
     * Zeigt eine acht-stellige Binärzahl auf dem Display an.
     * @param zahl is number, eg: 0
     * @param line is zeilennummer, [1 - 4], eg: 1
     * @param column is spalte, [1 - 20], eg: 1
     */
    //% blockid="floidpro_showbinary"
    //% block="Zeige Binärzahl %zahl in Zeile %line und Spalte %column"
    //% weight=84
    //% group="Display"
    //% line.min=1 line.max=4
    //% column.min=1 column.max=20
    //% zahl.min=0 zahl.max=255
    //% inlineInputMode=inline
    export function showBinary(zahl: number, line: number, column: number): void {
        if (advanced) errornode("Zeige Binaer")
        let message = binarystring(zahl)
        showOnLcd(message, line, column)
    }


    /**
     * Zeigt einen Wahrheitswert auf dem Display an.
     * @param line is zeilennummer, [1 - 4], eg: 1
     * @param column is spalte, [1 - 20], eg: 1
     */
    //% blockid="floidpro_showboolean"
    //% block="Zeige Wahrheitswert %bool in Zeile %line und Spalte %column"
    //% weight=83
    //% group="Display"
    //% line.min=1 line.max=4
    //% column.min=1 column.max=20
    //% inlineInputMode=inline
    export function showBoolean(bool: boolean, line: number, column: number): void {
        if (advanced) errornode("Zeige Wahrheitswert")
        if (bool) showOnLcd("WAHR  ", line, column);
        else showOnLcd("FALSCH", line, column);
    }

    /**
     * Zeigt alle Sensordaten auf dem Display an
     */
    //% blockid="floidpro_showsensor"
    //% block="Zeige Sensordaten auf Display an"
    //% weight=82
    //% group="Display"
    export function showSensor():void{
        if (advanced) errornode("Sensorausgabe")
        if (!staticdisplay){
            showOnLcd("LTO:  BVL:   USR:",1, 1)
            showOnLcd("LT1:  BVR:   USV:", 2, 1)
            showOnLcd("LT2:  BHL:   USL:", 3, 1)
            showOnLcd("LT3:  BHR:   USH:", 4, 1)
        }

        for (let i = 0; i <= 3; i++){
            if (Front.lt_black(i)) showOnLcd("B",i + 1,5)
            else showOnLcd("W", i + 1, 5)
            basic.pause(5)
            if (bumper_single(i)) showOnLcd("J", i + 1, 11)
            else showOnLcd("N", i + 1, 11)
            Front.sonar_switch(i)
            showNumber(Front.sonar(), 3, i + 1 , 18)
            
        }

        staticdisplay = true
    }


    /**
     * Löscht den gesamten Displayinhalt.
     */
    //% blockid="floidpro_clearlcd" 
    //% block="Displayinhalt löschen"
    //% weight=80 blockGap=7
    //% group="Display"
    export function clearLCD(): void {
        staticdisplay = false
        lcdByte(0x01, LCD_CMD); // Displayinhalt löschen
        basic.pause(5); // Wartezeit für die LCD-Verarbeitung
    }

    /*Ende Display*******************************************************************************************************************************/

    /**
     * Gibt wieder, ob ein bestimmter Bumper gedrückt ist
     */
    //% blockid="floidpro_bumpersingle"
    //% block="Bumper %bumper ist gedrückt"
    //% group="Bumper"
    //% weight=75
    export function bumper_single(bumper:BumperSensor): boolean {
        if (advanced) errornode("Bumper einzel")
        return ((bumper_all() & (1 << bumper) )!= 0)
    }

    /**
     * Liest die Werte der Bumper als eine Dezimalzahl aus: number
     */
    //% blockid="floidpro_bumperall"
    //% block="Dezimalzahl der Bumper"
    //% group="Bumper"
    //% weight=70
    export function bumper_all(): number {
        if (advanced) errornode("Bumper gesamt")
        let shift = 0
        if (!reservepin60) shift=240
        return pins.i2cReadNumber(60, NumberFormat.UInt8LE, false) - shift
    }

    /*Ende Bumper*******************************************************************************************************************************/
  
    /**
     * Schaltet die Beleuchtung nach der Vorgabe an bzw. aus
     */
    //% blockid="floidpro_light"
    //% block="Schalte Blinker VL:%VL_Blinker                 VR:%VR_Blinker                 HL:%HL_Blinker                 HR:%HR_Blinker         Licht   VL:%VL_Licht                 VR:%VR_Licht                 HL:%HL_Licht                 HR:%HR_Licht "
    //% group="Beleuchtung"
    //% weight=65
    export function lights_all(VL_Blinker: OnOff, VR_Blinker: OnOff, HL_Blinker: OnOff, HR_Blinker: OnOff, VL_Licht: OnOff, VR_Licht: OnOff, HL_Licht: OnOff, HR_Licht: OnOff): void {
        let n = 0
        if (VL_Blinker) {
            n += 1
        }
        if (VL_Licht) {
            n += 2
        }
        if (VR_Licht) {
            n += 4
        }
        if (VR_Blinker) {
            n += 8
        }
        if (HL_Blinker) {
            n += 16
        }
        if (HL_Licht) {
            n += 32
        }
        if (HR_Licht) {
            n += 64
        }
        if (HR_Blinker) {
            n += 128
        }
        pins.i2cWriteNumber(58, n, NumberFormat.Int8LE, false)
    }


    //% blockid=="floidpro_singlelight"
    //% block="Schalte %light %status"
    //% group="Beleuchtung"
    //% weight=60
    export function light_single(light: Light, status: OnOff): void {
        if(advanced) errornode("Licht einzel")
        let curr = pins.i2cReadNumber(58,NumberFormat.UInt8LE, false)
        let pattern = (1 << light)
        let new_lights = 0
        if (!status){
            new_lights = curr | pattern
        }
        else {
            new_lights = curr & ~pattern
        }
        
        pins.i2cWriteNumber(58, new_lights, NumberFormat.Int8LE, false)
    }

    //% blockid="floidpro_light_flip"
    //% block="Zustand von %light ändern"
    //% group="Beleuchtung"
    //% weight="59"
    export function light_flip(light: Light): void{
        if (advanced) errornode("Licht wechseln")
        let curr = pins.i2cReadNumber(58, NumberFormat.UInt8LE, false)
        let pattern = (1<<light)
        let newpattern = curr ^ pattern
        pins.i2cWriteNumber(58, newpattern, NumberFormat.UInt8LE, false)
        }


    /*Ende Beleuchtung*******************************************************************************************************************************/
    
    /**
     * Gibt ein Array der angeschlossenen I²C-Controller aus
     */
    //% blockid="floidpro_i2cscan"
    //% block="angeschlossene I²C-Controller"
    //% group="I2C"
    //% weight=55
    export function i2cpins(): number[] {
        let availableAddresses: number[] = [];
        for (let address = 1; address <= 127; address++) {
            if (testDevice(address)) availableAddresses.push(address);
        }
        //return 0
        return availableAddresses;

    }

    /**
     * Sendet eine Zahl an einen I2C-Controller
     */
    //% blockid="floidpro_i2cwrite"
    //% block="Sende %n an I2C-Controller: %contr"
    //% weight=50
    //% group="I2C"
    //% n.min=0 n.max=255
    export function i2cwrite(n:number,addr:Controller_write):void{
        if(addr==Controller_write.US){
            readus = n
        }
        pins.i2cWriteNumber(addr, n, NumberFormat.UInt8BE, false)
    }

    /**
     * Liest die Zahl eines I2C-Controller aus
     */
    //% blockid="floidpro_i2cread"
    //% block="Lies Zahl von I2C-Controller: %contr"
    //% weight=49
    //% group="I2C"
    export function i2cread(addr: Controller_read): number {
        if (addr == Controller_read.US) {
            return readus
        }
        return pins.i2cReadNumber(addr,NumberFormat.Int8LE,false)

    }


    /**
     * Prüft ob ein Controller mit einer bestimmten Adresse angeschlossen ist
     */
    //% blockid="floidpro_i2c_scan" 
    //% block="Controller %address ist angeschlossen" 
    //% address.min=0 address.max=127
    //% group="I2C"
    //% weight=45
    export function testDevice_front(address: number): boolean {
        return testDevice(address)
    }


    /*Ende I2C*******************************************************************************************************************************/

    /*Ende Frontend*******************************************************************************************************************************/

    // Display initialisieren

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

    // Funktion für I2C-Schreiben
    function i2cWrite(address: number, data: number): void {
        pins.i2cWriteBuffer(address, pins.createBufferFromArray([data]));
    }

    function binarystring(n: number): string {
        let result = ""
        for (let i = 7; i >= 0; i--) {
            result += ((n >> i) & 1)
        }
        return result
    }
}