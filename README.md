# LaunOmeter

LaunOmeter ist eine Webanwendung zur anonymen Erfassung und Visualisierung der Stimmung in einer Schulklasse oder Gruppe. Die App ermöglicht es Schüler:innen und Lehrkräften, ihre aktuelle Stimmung abzugeben. Die Ergebnisse werden aggregiert und grafisch dargestellt. Ein Adminbereich erlaubt die Verwaltung und Auswertung der Daten.

## Features

- **Stimmungsabgabe:** Schüler:innen und Lehrkräfte wählen ihre Rolle und geben ihre Stimmung ab.
- **Stimmungsbarometer:** Aggregierte Anzeige der aktuellen Stimmungslage.
- **Quota:** Begrenzung der täglichen Stimmen pro Rolle (Schüler:in/Lehrkraft).
- **Lockout:** Nach der Stimmabgabe ist eine erneute Teilnahme für eine definierte Zeit gesperrt.
- **Adminbereich:** PIN-geschützter Zugang zur Auswertung, Export (CSV) und Konfiguration (z.B. Quoten, PIN).
- **Lokale Speicherung:** Alle Daten werden lokal im Browser gespeichert (keine Cloud, keine externe Speicherung).

## Installation & Entwicklung

1. Repository klonen:
	```bash
	git clone https://github.com/3engel/launOmeter.git
	cd launOmeter
	```
2. Abhängigkeiten installieren:
	```bash
	npm install
	```
3. Entwicklungsserver starten:
	```bash
	npm run dev
	```
4. Die App ist unter `http://localhost:5173` erreichbar.

## Build für Produktion

```bash
npm run build
```
Das gebaute Projekt befindet sich im `dist/`-Verzeichnis.

## Nutzung

1. Rolle auswählen (Schüler:in oder Lehrkraft)
2. Stimmung auswählen
3. Nach der Stimmabgabe ist eine erneute Teilnahme für eine gewisse Zeit gesperrt
4. Adminbereich über das Zahnradsymbol (oben rechts) zugänglich (PIN-geschützt)

## Lizenz

MIT License. Siehe [LICENSE](LICENSE).

---
Entwickelt von Familie Engel. Quellcode auf [GitHub](https://github.com/3engel/launOmeter).
