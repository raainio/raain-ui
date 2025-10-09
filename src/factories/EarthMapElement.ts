// The URL on your server where CesiumJS's static files are hosted.
// (window as any).CESIUM_BASE_URL = '/';

// import {Ion, Terrain, Viewer} from 'cesium';
// import 'cesium/Build/Cesium/Widgets/widgets.css';

// Your access token can be found at: https://ion.cesium.com/tokens.
// Replace `your_access_token` with your Cesium ion access token.

import {initGlobe} from '../globe/main';

/**
 * Class for Earth map configuration
 */
export class EarthMapElementInput {
    constructor() {}
}

/**
 * Factory class for creating interactive Earth maps
 */
export class EarthMapElement {
    constructor(protected addSomeDebugInfos = false) {}

    /**
     * Creates and initializes an interactive 3D Earth map
     * @param element - HTML element to render the map
     * @param inputs - Map configuration options
     */
    public build(element: HTMLElement, inputs: EarthMapElementInput): void {
        if (!element) {
            throw new Error('Container element is required');
        }

        const params = {
            container: element,
            center: [-100, 38.5],
            altitude: 6280,
        };

        initGlobe(params)
            .then((globe) => {
                let spot;
                let requestID = requestAnimationFrame(animate);

                function animate(time) {
                    if (spot) {
                        globe.removeMarker(spot);
                    }
                    globe.update(time);

                    // Check for a mountain under the cursor
                    const mountain = globe.select('mountains', 12);
                    if (mountain) {
                        const position = mountain.geometry.coordinates;
                        spot = globe.addMarker({position, type: 'spot'});
                    }

                    requestID = requestAnimationFrame(animate);
                }
            })
            .catch(console.log);
    }
}
