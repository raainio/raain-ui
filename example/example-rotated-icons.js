/**
 * Example usage of RaainDivIcon with raain-ui
 *
 * This file demonstrates various ways to use the RaainDivIcon class
 * for creating rotatable markers on a Leaflet map.
 */
import 'leaflet/dist/leaflet.css';
import {marker as leafletMarker} from 'leaflet';
import {ElementsFactory, MapElement, MapElementInput, MapLatLng, RaainDivIcon} from 'raain-ui';

// eslint-disable-next-line no-undef
const _document = document;
// eslint-disable-next-line no-undef
const _window = window;

const mapHtmlElement = _document.getElementById('map');
const center = {latitude: 51.505, longitude: -0.09};
const factory = new ElementsFactory(center, true);
const mapElement = factory.createMap(mapHtmlElement, new MapElementInput());

/**
 * Example 1: Basic usage with Leaflet marker directly
 */
export function example1_BasicUsage(map) {
    // Create a rotated icon with custom HTML
    const windIcon = new RaainDivIcon({
        html: `
            <div style="
                width: 30px;
                height: 30px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 50%;
                border: 2px solid white;
                box-shadow: 0 2px 5px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 18px;
                font-weight: bold;
            ">→</div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        rotationAngle: 0, // Start pointing North
        rotationOrigin: 'center center',
        className: 'wind-direction-marker',
    });

    // Create a Leaflet marker with the rotated icon
    const marker = leafletMarker([51.505, -0.09], {icon: windIcon}).addTo(map);
    marker.bindPopup('<b>Basic Usage Example</b><br>Rotation: 0° (North)');

    // Update rotation dynamically after 2 seconds
    setTimeout(() => {
        windIcon.setRotation(45); // Rotate 45 degrees (NE)
        marker.setPopupContent('<b>Basic Usage Example</b><br>Rotation: 45° (NE)');
    }, 2000);

    return {marker, windIcon};
}

/**
 * Example 2: Using with MapElement (raain-ui pattern)
 */
export function example2_MapElementIntegration(mapContainer) {
    // Define marker position
    const center = new MapLatLng(51.505, -0.09);
    const markerPosition = new MapLatLng(51.508, -0.095, 45); // lat, lng, azimuth

    // Create rotated icon for wind direction
    const windIcon = new RaainDivIcon({
        html: '<div style="width: 40px; height: 40px; background: #3b82f6; clip-path: polygon(50% 0%, 100% 100%, 50% 85%, 0% 100%);"></div>',
        iconSize: [40, 40],
        iconAnchor: [20, 35],
        rotationAngle: markerPosition.alt || 0, // Use azimuth from MapLatLng
    });

    // Create MapElement and add markers
    const mapElement = new MapElement(center);
    const input = new MapElementInput(undefined, [
        {
            iconsLatLng: [markerPosition],
            raainDivIcon: windIcon,
        },
    ]);

    mapElement.build(mapContainer, input);

    // Update rotation using MapElement helper after 3 seconds
    setTimeout(() => {
        mapElement.setMarkerRotation(markerPosition, 90); // Rotate to East
        console.log('MapElement: Rotated marker to 90° (East)');
    }, 3000);

    return mapElement;
}

/**
 * Example 3: Animated rotation (e.g., for real-time wind updates)
 */
export function example3_AnimatedRotation(map) {
    const windIcon = new RaainDivIcon({
        html: `
            <div style="
                width: 40px;
                height: 40px;
                background: rgba(100, 150, 255, 0.8);
                clip-path: polygon(50% 0%, 100% 100%, 50% 85%, 0% 100%);
                transition: transform 0.5s ease-out;
            "></div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 35],
        rotationAngle: 0,
    });

    const marker = leafletMarker([51.51, -0.08], {icon: windIcon}).addTo(map);
    marker.bindPopup('<b>Animated Rotation</b><br>Watch the wind change!');

    // Simulate wind direction updates every 2 seconds
    let currentAngle = 0;
    const interval = setInterval(() => {
        // Simulate wind direction change (+/- 30 degrees)
        const change = (Math.random() - 0.5) * 60;
        currentAngle = (currentAngle + change + 360) % 360;
        windIcon.setRotation(currentAngle);
        console.log(`Wind direction updated: ${Math.round(currentAngle)}°`);
    }, 2000);

    return {marker, windIcon, interval};
}

/**
 * Example 4: Multiple markers with different rotations
 */
export function example4_MultipleMarkers(map) {
    // Wind data from different stations
    const windStations = [
        {lat: 51.505, lng: -0.09, direction: 0, speed: 5, name: 'Station A'},
        {lat: 51.51, lng: -0.08, direction: 90, speed: 8, name: 'Station B'},
        {lat: 51.5, lng: -0.08, direction: 180, speed: 12, name: 'Station C'},
        {lat: 51.505, lng: -0.1, direction: 270, speed: 6, name: 'Station D'},
    ];

    const markers = windStations.map((station) => {
        // Create icon with color based on wind speed
        const color = station.speed > 10 ? '#ff4444' : station.speed > 7 ? '#ffaa44' : '#44ff44';

        const icon = new RaainDivIcon({
            html: `
                <div style="
                    width: 30px;
                    height: 30px;
                    background: ${color};
                    border-radius: 50%;
                    border: 2px solid white;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 10px;
                    font-weight: bold;
                ">${station.speed}</div>
            `,
            iconSize: [30, 30],
            iconAnchor: [15, 15],
            rotationAngle: station.direction,
        });

        const marker = leafletMarker([station.lat, station.lng], {icon}).addTo(map);
        marker.bindPopup(
            `<b>${station.name}</b><br>Speed: ${station.speed} m/s<br>Direction: ${station.direction}°`
        );

        return {marker, icon, station};
    });

    return markers;
}

/**
 * Example 5: Dynamic rotation origin
 */
export function example5_CustomRotationOrigin(map) {
    // Create a marker that rotates around its bottom point (useful for pins)
    const pinIcon = new RaainDivIcon({
        html: `
            <div style="
                width: 30px;
                height: 40px;
                background: #ff6b6b;
                clip-path: polygon(50% 0%, 100% 40%, 50% 100%, 0% 40%);
            "></div>
        `,
        iconSize: [30, 40],
        iconAnchor: [15, 40], // Bottom center
        rotationAngle: 0,
        rotationOrigin: '50% 100%', // Rotate around bottom center
    });

    const marker = leafletMarker([51.5, -0.1], {icon: pinIcon}).addTo(map);
    marker.bindPopup('<b>Custom Rotation Origin</b><br>Rotates around bottom point');

    // Animate rotation to demonstrate the custom origin
    let angle = 0;
    const interval = setInterval(() => {
        angle = (angle + 5) % 360;
        pinIcon.setRotation(angle);
    }, 50);

    return {marker, pinIcon, interval};
}

/**
 * Example 6: Wind speed visualization with rotation (static html)
 */
export function example6_WindSpeedVisualization(map) {
    /**
     * Helper function to create a wind marker with speed and direction
     * Uses static html field - size is computed once during creation
     */
    function createWindMarker(lat, lng, speed, direction) {
        // Scale arrow size based on wind speed
        const size = 20 + Math.min(speed * 2, 40);

        // Color based on speed (green -> yellow -> red)
        let color;
        if (speed < 5)
            color = '#4ade80'; // Green
        else if (speed < 10)
            color = '#facc15'; // Yellow
        else if (speed < 15)
            color = '#fb923c'; // Orange
        else color = '#ef4444'; // Red

        const icon = new RaainDivIcon({
            html: `
                <div style="
                    width: ${size}px;
                    height: ${size}px;
                    background: ${color};
                    clip-path: polygon(50% 0%, 100% 100%, 50% 85%, 0% 100%);
                    box-shadow: 0 2px 5px rgba(0,0,0,0.3);
                    position: relative;
                ">
                    <span style="
                        position: absolute;
                        top: 60%;
                        left: 50%;
                        transform: translateX(-50%);
                        color: white;
                        font-size: 10px;
                        font-weight: bold;
                        text-shadow: 0 1px 2px rgba(0,0,0,0.5);
                    ">${speed}</span>
                </div>
            `,
            iconSize: [size, size],
            iconAnchor: [size / 2, size * 0.85],
            rotationAngle: direction,
        });

        const marker = leafletMarker([lat, lng], {icon}).addTo(map);
        marker.bindPopup(`<b>Wind Data</b><br>Speed: ${speed} m/s<br>Direction: ${direction}°`);

        return {marker, icon};
    }

    // Example usage with different wind speeds
    const windData = [
        {lat: 51.502, lng: -0.095, speed: 3, direction: 45},
        {lat: 51.507, lng: -0.095, speed: 8, direction: 90},
        {lat: 51.502, lng: -0.085, speed: 12, direction: 180},
        {lat: 51.507, lng: -0.085, speed: 16, direction: 270},
    ];

    return windData.map((wind) => createWindMarker(wind.lat, wind.lng, wind.speed, wind.direction));
}

/**
 * Example 7: Dynamic wind speed with htmlTemplate (runtime size changes)
 * This demonstrates using htmlTemplate for icons that need to change size dynamically
 */
export function example7_DynamicWindSpeed(map) {
    /**
     * Helper function to get color based on wind speed
     */
    function getSpeedColor(speed) {
        if (speed < 5) return '#4ade80'; // Green
        if (speed < 10) return '#facc15'; // Yellow
        if (speed < 15) return '#fb923c'; // Orange
        return '#ef4444'; // Red
    }

    /**
     * Create a dynamic wind marker using htmlTemplate
     */
    function createDynamicWindMarker(lat, lng, initialSpeed, initialDirection) {
        const initialSize = 20 + Math.min(initialSpeed * 2, 40);
        const color = getSpeedColor(initialSpeed);

        // Use htmlTemplate with {width} and {height} placeholders for dynamic sizing
        const icon = new RaainDivIcon({
            htmlTemplate: `
                <div style="
                    width: {width}px;
                    height: {height}px;
                    background: ${color};
                    clip-path: polygon(50% 0%, 100% 100%, 50% 85%, 0% 100%);
                    box-shadow: 0 2px 5px rgba(0,0,0,0.3);
                    position: relative;
                    transition: all 0.3s ease-out;
                ">
                    <span style="
                        position: absolute;
                        top: 60%;
                        left: 50%;
                        transform: translateX(-50%);
                        color: white;
                        font-size: 10px;
                        font-weight: bold;
                        text-shadow: 0 1px 2px rgba(0,0,0,0.5);
                    " class="wind-speed-label">${initialSpeed}</span>
                </div>
            `,
            width: initialSize,
            height: initialSize,
            iconAnchor: [initialSize / 2, initialSize * 0.85],
            rotationAngle: initialDirection,
            className: 'dynamic-wind-marker',
        });

        const marker = leafletMarker([lat, lng], {icon}).addTo(map);
        marker.bindPopup(
            `<b>Dynamic Wind Data</b><br>Speed: ${initialSpeed} m/s<br>Direction: ${initialDirection}°`
        );

        return {marker, icon, currentSpeed: initialSpeed};
    }

    // Create dynamic wind markers
    const windData = [
        {lat: 51.502, lng: -0.095, speed: 5, direction: 45},
        {lat: 51.507, lng: -0.095, speed: 10, direction: 90},
        {lat: 51.502, lng: -0.085, speed: 8, direction: 180},
    ];

    const dynamicMarkers = windData.map((wind) =>
        createDynamicWindMarker(wind.lat, wind.lng, wind.speed, wind.direction)
    );

    // Simulate real-time wind speed updates every 2 seconds
    const interval = setInterval(() => {
        dynamicMarkers.forEach(({marker, icon, currentSpeed}, index) => {
            // Simulate wind speed change (+/- 2 m/s, constrained to 1-20 m/s)
            const newSpeed = Math.max(1, Math.min(20, currentSpeed + (Math.random() - 0.5) * 4));
            dynamicMarkers[index].currentSpeed = newSpeed;

            // Calculate new size based on speed
            const newSize = 20 + Math.min(newSpeed * 2, 40);

            // Update icon size dynamically using setSize()
            icon.setSize(newSize, newSize);

            // Update anchor proportionally
            const newAnchor = [newSize / 2, newSize * 0.85];
            icon.options.iconAnchor = newAnchor;

            // Update speed label in the icon
            const iconElement = icon.getIconElement();
            if (iconElement) {
                const label = iconElement.querySelector('.wind-speed-label');
                if (label) {
                    label.textContent = Math.round(newSpeed);
                }
            }

            // Update popup
            const position = marker.getLatLng();
            marker.setPopupContent(
                `<b>Dynamic Wind Data</b><br>Speed: ${Math.round(newSpeed)} m/s<br>Direction: ${Math.round(icon.getRotation())}°`
            );

            // Also rotate slightly to simulate wind direction change
            const newDirection = (icon.getRotation() + (Math.random() - 0.5) * 20 + 360) % 360;
            icon.setRotation(newDirection);

            console.log(
                `Marker ${index + 1}: Speed ${Math.round(newSpeed)} m/s, Size ${Math.round(newSize)}px, Direction ${Math.round(newDirection)}°`
            );
        });
    }, 2000);

    return {markers: dynamicMarkers, interval};
}

/**
 * Main example: Wind direction markers with rotation controls
 * This is the default example shown in the HTML page
 */
export function exampleMain_WindDirectionMarkers() {
    // Define marker locations with rotation angles
    const locations = [
        {lat: 51.505, lng: -0.09, angle: 0, label: 'North'},
        {lat: 51.51, lng: -0.08, angle: 90, label: 'East'},
        {lat: 51.5, lng: -0.08, angle: 180, label: 'South'},
        {lat: 51.505, lng: -0.1, angle: 270, label: 'West'},
        {lat: 51.508, lng: -0.095, angle: 45, label: 'NE'},
    ];

    // Create RaainDivIcon instances for each marker
    const icons = locations.map((loc) => {
        return new RaainDivIcon({
            html: '<div class="wind-icon"></div>',
            iconSize: [30, 30],
            iconAnchor: [15, 15],
            rotationAngle: loc.angle,
            className: 'custom-wind-marker',
        });
    });

    // Create MapLatLng objects for marker positions
    const markerLatLngs = locations.map((loc, index) => {
        return new MapLatLng(loc.lat, loc.lng, loc.angle, `marker-${index}`, loc.label);
    });

    // Use the raain-ui way: Add markers through MapElement
    // This ensures proper handling of zoom events and rotation persistence
    const markersProduced = mapElement.updateMarkers(
        locations.map((loc, index) => ({
            iconsLatLng: [markerLatLngs[index]],
            raainDivIcon: icons[index],
        }))
    );

    // Add popups to the produced markers
    markersProduced.forEach((marker, index) => {
        const loc = locations[index];
        marker.bindPopup(`<b>${loc.label}</b><br>Rotation: ${loc.angle}°`);
    });

    // Store markers and icons for control functions
    const markers = locations.map((loc, index) => ({
        marker: markersProduced[index],
        icon: icons[index],
        originalAngle: loc.angle,
    }));

    // Control functions
    let animationInterval = null;

    const controls = {
        rotateAll: (delta) => {
            markers.forEach(({icon}) => {
                const newAngle = (icon.getRotation() + delta + 360) % 360;
                icon.setRotation(newAngle);
            });
            controls.updateDisplay();
        },

        animateRotation: () => {
            if (animationInterval) return;
            animationInterval = setInterval(() => {
                markers.forEach(({icon}) => {
                    const newAngle = (icon.getRotation() + 5) % 360;
                    icon.setRotation(newAngle);
                });
                controls.updateDisplay();
            }, 50);
        },

        stopAnimation: () => {
            if (animationInterval) {
                clearInterval(animationInterval);
                animationInterval = null;
            }
        },

        resetRotation: () => {
            controls.stopAnimation();
            markers.forEach(({icon, originalAngle}) => {
                icon.setRotation(originalAngle);
            });
            controls.updateDisplay();
        },

        setRandomRotations: () => {
            markers.forEach(({icon}) => {
                const randomAngle = Math.floor(Math.random() * 360);
                icon.setRotation(randomAngle);
            });
            controls.updateDisplay();
        },

        updateDisplay: () => {
            const avgRotation =
                markers.reduce((sum, {icon}) => sum + icon.getRotation(), 0) / markers.length;
            const displayElement = _document.getElementById('rotation-display');
            if (displayElement) {
                displayElement.textContent = Math.round(avgRotation) + '°';
            }
        },
    };

    // Update initial display
    setTimeout(() => controls.updateDisplay(), 100);

    return {markers, controls};
}

/**
 * Get the source code of a function as a formatted string
 */
function getFunctionSource(fn) {
    if (!fn) return '';
    const source = fn.toString();
    // Remove the function declaration line and clean up indentation
    const lines = source.split('\n');
    // Find the first line with code (after function declaration)
    let startIdx = 1;
    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() && !lines[i].trim().startsWith('//')) {
            startIdx = i;
            break;
        }
    }
    // Remove last line (closing brace)
    const codeLines = lines.slice(startIdx, -1);

    // Find minimum indentation to normalize
    let minIndent = Infinity;
    codeLines.forEach((line) => {
        if (line.trim()) {
            const indent = line.search(/\S/);
            if (indent < minIndent) minIndent = indent;
        }
    });

    // Remove common indentation
    return codeLines.map((line) => line.substring(minIndent)).join('\n');
}

// Expose functions and mapElement to window for HTML onclick handlers
if (typeof _window !== 'undefined') {
    _window.RotatedIconExamples = {
        mapElement,
        example1_BasicUsage,
        example2_MapElementIntegration,
        example3_AnimatedRotation,
        example4_MultipleMarkers,
        example5_CustomRotationOrigin,
        example6_WindSpeedVisualization,
        example7_DynamicWindSpeed,
        exampleMain_WindDirectionMarkers,
        getFunctionSource,
    };
}
