<div align="center">

# 🌧️ raain-ui

[![npm version](https://img.shields.io/npm/v/raain-ui.svg)](https://www.npmjs.com/package/raain-ui)
[![Build Status](https://github.com/raainio/raain-ui/workflows/CI/badge.svg)](https://github.com/raainio/raain-ui/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.0-blue.svg)](https://www.typescriptlang.org/)

**Advanced UI components and visualization layers for rainfall data**

</div>

<p align="center">
  <b>raain-ui</b> is a library that provides specialized UI components and visualization layers for displaying and interacting with rainfall data coming from <a href="https://radartorain.com">radartorain.com</a>. Built with modern web technologies, it offers high-performance visualizations for meteorological applications.
</p>

## 📋 Table of Contents

- [Features](#-features)
- [Screenshots](#-screenshots)
- [Installation](#-installation)
- [Usage](#-usage)
- [Documentation](#-documentation)
- [Angular Configuration](#-angular-configuration)
- [Changelog](#-changelog)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

- **Interactive Maps**: Leaflet-based map visualizations for geospatial rainfall data
- **High-Performance Rendering**: Pixi.js-powered rendering for smooth visualizations
- **Data Charting**: Chart.js integration for time-series and statistical analysis
- **3D Globe Visualization**: Earth visualization for global rainfall patterns
- **Time Navigation**: Advanced date/time controls for temporal data exploration
- **Responsive Design**: Components that adapt to different screen sizes
- **Framework Agnostic**: Works with vanilla JavaScript or any framework

## 📸 Screenshots

Here are some screenshots showcasing the raain-ui components in action:

### Map Visualization

![Map Visualization](./screenshots/Screenshot%202025-05-20%20at%2016.13.31.png)

### Compare Data

![Compare](./screenshots/Screenshot%202025-05-20%20at%2016.13.49.png)

### Date Analysis

![Date Analysis](./screenshots/Screenshot%202025-05-20%20at%2016.14.07.png)

## 📦 Installation

```bash
npm install raain-ui
```

## 🚀 Usage

raain-ui provides a set of components that can be easily integrated into your application. Here's a simple example of
how to use the MapElement component:

```javascript
import {MapElementFactory} from 'raain-ui';

// Create a map element
const mapElement = MapElementFactory.create({
    container: 'map-container',
    center: [51.505, -0.09],
    zoom: 13
});

// Add a rainfall layer
mapElement.addRainfallLayer(rainfallData);
```

### 🔍 Example Application

The project includes a comprehensive example application that demonstrates how to use the library:

```bash
# Clone the repository
git clone https://github.com/raainio/raain-ui.git
cd raain-ui

# Install dependencies and build the library
npm install
npm run build

# Run the example
cd example/
npm start
```

This will open the example application at http://localhost:1234, where you can explore the various components and
features of raain-ui.

### 🌬️ Wind Marker Animations

raain-ui includes CSS animations for visualizing wind speed and direction on map markers. To use these animations in
your application:

**1. Import the CSS file in your global styles:**

```scss
// In your global.scss or styles.scss
@import "~raain-ui/data/wind-markers.css";
```

**Or in HTML:**

```html

<link rel="stylesheet" href="node_modules/raain-ui/dist/data/wind-markers.css">
```

**2. Use with MapElement:**

```typescript
import {MapLatLng} from 'raain-ui';

// Create a marker with wind data
const windMarker = new MapLatLng(
    lat,           // latitude
    lng,           // longitude
    azimuth,       // alt property: azimuth 0-360° (0=North, 90=East, 180=South, 270=West)
    id,            // marker id
    name,          // marker name
    strengthInMs   // value property: wind strength in meters/second
);

// Apply wind animation
mapElement.changeMarkerStyle(
    windMarker,
    'marker-wind marker-wind-225',  // classes: base + direction
    {strength: 10}                 // CSS variable: wind strength
);
```

**Available azimuth classes:** 0, 10, 20, 30, 45, 90, 135, 180, 200, 225, 270, 315

The animation automatically:

- Shows a directional arrow indicating wind direction
- Animates marker movement in the wind direction
- Adjusts animation speed based on wind strength
- Displays a blue glow with intensity matching wind strength

## 📚 Documentation

Comprehensive API documentation is available in the [specifications](./specs) directory. This includes detailed
information about all components, their properties, methods, and events.

### 🅰️ Angular Configuration

If you're using this library in an Angular application, you'll need to configure Angular to handle the CSS files
properly. Here are two approaches:

<details>
<summary><b>Option 1: Import CSS in angular.json</b></summary>

```json
"styles": [
"src/styles.css",
"node_modules/raain-ui/dist/data/globe.css"
]
```

</details>

<details>
<summary><b>Option 2: Configure webpack for CSS imports</b></summary>

First, create a custom webpack configuration:

```javascript
// custom-webpack.config.js
module.exports = {
    module: {
        rules: [
            {
                test: /\.css$/,
                include: [/node_modules\/raain-ui/],
                use: ['style-loader', 'css-loader']
            }
        ]
    }
};
```

Then use `@angular-builders/custom-webpack` to apply this configuration:

```json
"architect": {
"build": {
"builder": "@angular-builders/custom-webpack:browser",
"options": {
"customWebpackConfig": {
"path": "./custom-webpack.config.js"
}
}
}
}
```

</details>

## 📝 Changelog

See the [Changelog](./CHANGELOG.md) for a detailed list of changes in each version.

## 👥 Contributing

Contributions are welcome! If you'd like to contribute to raain-ui, please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please make sure your code follows the existing style and includes appropriate tests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
