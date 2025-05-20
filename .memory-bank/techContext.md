# raain-ui Technical Context

## Technologies Used

### Core Technologies

- **TypeScript**: Primary programming language for type safety and better developer experience
- **JavaScript (ES6+)**: Compiled target for browser compatibility
- **HTML5/CSS3**: For DOM manipulation and styling
- **WebGL**: For 3D visualizations and high-performance rendering

### Key Libraries

- **Leaflet**: Open-source JavaScript library for interactive maps
- **Pixi.js**: 2D WebGL renderer for high-performance graphics
- **Chart.js**: Flexible charting library for data visualization
- **chartjs-plugin-dragdata**: Extension for interactive chart data manipulation
- **chartjs-chart-geo**: Geographic extensions for Chart.js
- **raain-model**: Data models and processing for rainfall data
- **satellite-view**: Library for satellite imagery integration
- **spinning-ball**: 3D globe visualization
- **tile-setter**: Map tile management
- **yawgl**: WebGL utilities

### Development Tools

- **npm**: Package management
- **TypeScript Compiler**: Static type checking and transpilation
- **Mocha/Chai**: Testing framework
- **tslint**: Code quality enforcement

## Development Setup

### Prerequisites

- Node.js (LTS version recommended)
- npm or yarn
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/raainio/raain-ui.git
cd raain-ui

# Install dependencies
npm install

# Build the library
npm run build
```

### Development Workflow

1. Make changes to source files in `src/`
2. Run tests: `npm test`
3. Build the library: `npm run build`
4. Test in the example application: `cd example/ && npm start`

### Project Structure

- `src/`: Source code
    - `factories/`: Factory classes for creating UI components
    - `elements/`: UI component implementations
    - `utils/`: Utility functions
    - `data/`: Static assets and data
- `specs/`: Test specifications
- `example/`: Example application
- `dist/`: Compiled output (generated)
- `scripts/`: Build and utility scripts

## Technical Constraints

### Browser Compatibility

- Modern evergreen browsers (Chrome, Firefox, Safari, Edge)
- IE11 not supported
- Mobile browsers supported with limitations

### Performance Considerations

- Large datasets require optimization techniques
- WebGL acceleration recommended for complex visualizations
- Memory management critical for long-running applications

### Integration Requirements

- Host application must handle CSS imports properly
- Peer dependencies must be satisfied
- DOM elements must be available for component mounting

## Dependencies

### Peer Dependencies

These must be provided by the consuming application:

- chart.js: ^4.4.7
- chartjs-plugin-dragdata: ^2.3.1
- leaflet: ^1.9.4
- pixi.js: ^5.3.12
- raain-model: ^3.0.9

### Direct Dependencies

These are bundled with the library:

- chartjs-chart-geo: ^4.3.4
- geolib: ^3.3.4
- satellite-view: ^2.1.2
- spinning-ball: ^0.5.0
- tile-setter: ^0.1.12
- yawgl: ^0.4.3

### Development Dependencies

These are used during development but not required at runtime:

- TypeScript and related tooling
- Testing frameworks
- Build tools
