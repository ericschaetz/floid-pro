input.onButtonPressed(Button.A, function () {
    a += 1
    pins.i2cWriteNumber(
        56,
        i2c_pin(a),
        NumberFormat.Int8LE,
        false
    )
})
function i2c_pin(num: number) {
    return num + (240 - 2 ** (4 + num))
}
input.onButtonPressed(Button.B, function () {
    a += -1
    pins.i2cWriteNumber(
        56,
        i2c_pin(a),
        NumberFormat.Int8LE,
        false
    )
})

function antrieb (power: number, lenkung: number) {
    let speedL
    let speedR
    let antriebszahl = 0
    let motorMin = 0
   
    motorMin = 200
    if (lenkung < 0) {
        speedR = power
        speedL = power + 2 * power / 10 * lenkung
    } else if (lenkung > 0) {
        speedL = power
        speedR = power - 2 * power / 10 * lenkung
    } else {
        speedL = speedR = power
    }
    if (speedL > 0) {
        antriebszahl += 1
    } else if (speedL < 0) {
        antriebszahl += 2
    }
    if (speedR > 0) {
        antriebszahl += 4
    } else if (speedR < 0) {
        antriebszahl += 8
    }
    pins.analogWritePin(AnalogPin.P1, Math.map(Math.abs(speedL), 0, 10, motorMin, 1023))
    pins.analogWritePin(AnalogPin.P2, Math.map(Math.abs(speedR), 0, 10, motorMin, 1023))
    pins.i2cWriteNumber(
    33,
    antriebszahl,
    NumberFormat.Int8BE,
    false
    )
}

input.onButtonPressed(Button.A, function () {
    a += 1
    pins.i2cWriteNumber(
        56,
        i2c_pin(a),
        NumberFormat.Int8LE,
        false
    )
})

input.onButtonPressed(Button.B, function () {
    a += -1
    pins.i2cWriteNumber(
        56,
        i2c_pin(a),
        NumberFormat.Int8LE,
        false
    )
})


radio.onReceivedValue(function (name, value) {
    if (name == "speed") {
        speed = value
    } else if (name == "lenkung") {
        lenkung = value
    }
})

let lenkung = 0
let speed = 0
let a = 0
a = 0

OLED12864_I2C.init(60)
OLED12864_I2C.showString(0, 0, "Floid Pro Max", 1)
OLED12864_I2C.showString(0, 1, "0|1|2|3", 1)
OLED12864_I2C.showString(0, 2, " | | | ", 1)
OLED12864_I2C.showString(1, 3, ":", 1)
pins.i2cWriteNumber(
    56,
    0,
    NumberFormat.Int8LE,
    false
)

radio.setGroup(1)

basic.showLeds(`
    . . . . .
    . . . . .
    . . # . .
    . . . . .
    . . . . .
    `)

pins.i2cWriteNumber(32, 2, NumberFormat.Int8LE, false)

basic.forever(function () {
    antrieb(speed, lenkung)
    a += 1
    a = a % 4
    pins.i2cWriteNumber(
        56,
        i2c_pin(a),
        NumberFormat.Int8LE,
        false
    )
    OLED12864_I2C.showNumber(0, 3,a, 1)
    OLED12864_I2C.showNumber(2 * a , 2, pins.digitalReadPin(DigitalPin.P16), 1)
    OLED12864_I2C.showNumber(3, 3, i2c_pin(a), 1)
    

    basic.pause(10)
})
