# PALMIRA — Solara City
Original Three.js open-world driving and exploration prototype.

## Run
No build step. From the repository root run `npx serve .` (or use Render Static Site with build command blank and publish directory `.`). Open the local URL in a modern desktop browser. WebGL is required.

## Controls
- WASD move / drive, mouse look (click game), Shift sprint, Space jump
- F enter/exit nearby vehicle, Tab switch protagonists, P phone, Esc pause
- Click to fire while on foot; R change radio station; M toggle radio
- E interact with the jewelry mission marker

## World
Procedural Solara downtown, pastel beachfront, marina, wetlands, island causeway and industrial port; sunset-to-night cycle; animated ocean; rain mode; procedural pedestrians and traffic; two protagonists; arcade vehicle handling; wanted response; a jewelry-store getaway objective; social feed; synthesized radio.

## Notes
All geometry and textures are generated in code. Three.js and postprocessing modules load from jsDelivr, so launch requires an internet connection. The project is a playable browser-game foundation; complex simulation is simplified to preserve laptop performance.