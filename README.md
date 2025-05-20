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

## 📚 Documentation

Comprehensive API documentation is available in the [specifications](./specs) directory. This includes detailed
information about all components, their properties, methods, and events.

### 🧠 Memory Bank

This project uses a Memory Bank for comprehensive documentation and context retention. The Memory Bank provides in-depth
information about the project's architecture, design decisions, and development context.

<details>
<summary><b>Memory Bank Files</b> (click to expand)</summary>

The Memory Bank is located in the `.memory-bank` directory and contains the following files:

| File                   | Description                                                       |
|------------------------|-------------------------------------------------------------------|
| `memory-bank-rules.md` | Rules to follow and to consider in all contexts                   |
| `projectbrief.md`      | Overview of the project, core requirements, and goals             |
| `productContext.md`    | Why the project exists, problems it solves, and how it works      |
| `systemPatterns.md`    | System architecture, key technical decisions, and design patterns |
| `techContext.md`       | Technologies used, development setup, and technical constraints   |
| `activeContext.md`     | Current work focus, recent changes, and next steps                |
| `progress.md`          | What works, what's left to build, and known issues                |

</details>

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
