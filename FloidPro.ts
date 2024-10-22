
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
//% weight=100 color=#0fbc11 icon=""
namespace FloidPro {
    /**
     * Antrieb
     * @param n describe parameter here, eg: 5
     * @param s describe parameter here, eg: "Hello"
     * @param e describe parameter here
     */
    //% block
    export function antrieb(n: number, s: string, e: MyEnum): void {
        // Add code here
    }

    /**
     * TODO: Init-Funktion
     * @param value describe value here, eg: 5
     */
    //% block
    export function init(value: number): void {
        OLED.init(128, 64)
        OLED.writeStringNewLine("FLoid Pro")
    }
}
