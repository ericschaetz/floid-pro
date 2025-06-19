# Floid Pro MakeCode-Erweiterung

Diese Erweiterung erlaubt die einfache Ansteuerung des **FloidPro** im Microsoft MakeCode Editor. Der Roboter lässt sich dabei auf 3 Level betreiben:

- Level 1: Der Roboter macht wahrscheinlich, was er soll.
- Level 2: Der Roboter macht wahrscheinlich, was er soll und gibt Rückmeldung.
- Level 3: Der Roboter macht genau das, was er soll.


---

## Struktur der Erweiterung

Die Funktionen sind in drei logische Bereiche entsprechend der Aufteilung des Roboters unterteilt:

##  1. Hauptsektion
Funktionen für die Initialisierung, das Display, die Bumper, die Beleuchtung und I<sup>2</sup>C.

### Initialisierung

#### FloidPro hochfahren

Muss beim Start des Roboters ausgeführt werden, um alle Funktionen richtig ausführen zu können. Hierbei wird das Level gesetzt, auf dem das Programm laufen soll.

```ts
Core.init(Level.l1A)
```

### Display

#### Text darstellen

Funktion zum Darstellen von Text auf dem Display. Die Position wird über Zeilen- und Spaltennummer angegeben.

```ts
Core.showOnLcd("Hallo Welt", 1, 1)
```
#### Zahl darstellen

Funktion zum Darstellen einer Zahl mit einer maximalen Zahl an Stellen. Die Position wird über Zeilen- und Spaltennummer angegeben.

```ts
Core.showNumber(15, 3, 1, 1)
```
#### Displayinhalt löschen

Funktion zum Löschen des gesamten Displayinhalts.

```ts
Core.clearLCD()
```
##### Beispiel

Schreibt "Hallo Welt" in die erste Zeile und die vierte Spalte. Schreibt eine 10 in die zweite Zeile und die erste Spalte. Löscht den Display Inhalt nach einer kurzen Pause.

```blocks
Core.showOnLcd("Hallo Welt", 1, 4)
Core.showNumber(10, 3, 2, 1)
basic.pause(20)
Core.clearLCD()
 init(lvl:Level)
```
### Bumper

#### Bumper einzeln abfragen

Funktion gibt einen Wahrheitswert darüber aus, ob ein bestimmter Bumper gedrückt ist.

```ts
Core.bumpersingle(BumperSensor.VR)
```

#### Bumper gesamt abfragen

Funktion zum Abfragen aller Bumper, indem sie den gesamten I<sup>2</sup>C-Wert als Dezimalzahl liefert.

```ts
Core.bumperall()
```

##### Beispiel

Solange keine Bumper gedrückt sind, wird der entsprechende Text auf dem Display angezeigt. Wird jedoch ein Bumper gedrückt, wird geprüft, ob der Bumper vorne rechts gedrückt ist und eine entsprechende Rückmeldung ausgegeben.

```blocks
while (0 == Core.bumperall()) {
        Core.showOnLcd("Kein Bumper gedrückt", 1, 1)
    }
    Core.clearLCD()
    if (Core.bumpersingle(BumperSensor.VR)) {
        Core.showOnLcd("Bumper vorne rechts gedrückt", 1, 1)
    }
```

### Beleuchtung

#### Blinker und Lampen gesamt schalten

Funktion zum einstellen der Zustände für alle Blinker und Lampen des FloidPro.

```ts
Core.beleuchtung(OnOff.On, OnOff.On, OnOff.On, OnOff.On, OnOff.On, OnOff.On, OnOff.On, OnOff.On)
```

#### Blinker/Lampe ein-/ausschalten

Funktion zum Ein- oder Ausschalten eines bestimmten Blinkers/ einer bestimmten Lampe.

```ts
Core.setlights(Light.BVL, OnOff.On)
```
##### Beispiel

Zunächst wird die gesamte Beleuchtung angeschaltet. Danach blinkt der Blinker vorne links vier mal.

```blocks
Core.beleuchtung(OnOff.On,OnOff.On,OnOff.On,OnOff.On,OnOff.On,OnOff.On,OnOff.On,OnOff.On)
for (let index = 0; index < 4; index++) {
    Core.setlights(Light.BVL, OnOff.Off)
    basic.pause(500)
    Core.setlights(Light.BVL, OnOff.On)
    basic.pause(500)
}
```


---

### 🔷 2. Hauptsektion
Zentrale Steuerungen, wie Piezo, Statusanzeigen oder Kommunikationsfunktionen.

#### Beispiel: Piepton ausgeben

```ts
floid.beep()
```

```blocks
// Piept einmal
floid.beep()
```

---

### 🔷 3. Antriebsektion
Funktionen zur Steuerung der Motoren und des Fahrverhaltens.

#### Beispiel: Vorwärts fahren

```ts
floid.drive(100, 100)
```

```blocks
// Fahre geradeaus für eine Sekunde
floid.drive(100, 100)
basic.pause(1000)
floid.drive(0, 0)
```

---

## 📦 Installation

Diese Erweiterung kann über den folgenden GitHub-Link in MakeCode eingebunden werden:

```
https://github.com/ericschaetz/floid-pro
```

→ Öffne MakeCode, klicke auf „Erweiterungen" und gib den Link oben ein.

---

## 🛠 Kompatibilität

- 💻 MakeCode Editor
- 📟 micro:bit v2 (empfohlen)
- 🤖 Floid Pro Roboter

---

#### Metadaten (verwendet für Suche, Rendering)

* for PXT/microbit
<script src="https://makecode.com/gh-pages-embed.js"></script><script>makeCodeRender("{{ site.makecode.home_url }}", "{{ site.github.owner_name }}/{{ site.github.repository_name }}");</script>
