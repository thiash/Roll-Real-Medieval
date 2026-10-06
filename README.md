# Roll Real Medieval

Spielbarer 3D-Medieval-Prototyp für Desktop und mobile Geräte.

## Architektur

- `index.html` – Einstiegspunkt und mobile Oberfläche
- `src/main.js` – Spielschleife, Renderer und Kamera
- `src/world.js` – Terrain, Wasser und Vegetation
- `src/player.js` – Spielerfigur und Bewegung
- `src/controls.js` – Touch-Joysticks

## Mobile-Optimierung

- niedrigere Terrain-Auflösung auf Touch-Geräten
- InstancedMesh für Bäume statt hunderter einzelner Baum-Meshes
- kein Antialiasing und keine dynamischen Schatten auf mobilen Geräten
- begrenztes Device-Pixel-Ratio für weniger GPU-Last
- Desktop erhält höhere Darstellungsqualität
- beide Touch-Joysticks können gleichzeitig verwendet werden
- rechter Daumen: Bewegung
- linker Daumen: Kamera

## Nächste Ausbaustufen

1. echte Fluss-, See- und Küstengeometrie mit korrekten Höhenstufen
2. Streaming/Chunk-System für die große Welt
3. Regionen und Biome
4. Charaktermodell und Animationen
5. Kollisionen, Physik und Interaktionen
6. spätere Optimierung von Texturen und Assets