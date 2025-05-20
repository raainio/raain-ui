// This is a wrapper for the spinning-ball package to handle ES module compatibility
// It uses a technique to convert the ES module exports to CommonJS exports

// Use a dynamic require with a try-catch to handle potential errors
let spinningBallModule;

try {
  // Try to load the module using require
  spinningBallModule = require('spinning-ball');
} catch (error) {
  // If that fails, create a minimal compatible interface
  console.warn('Error loading spinning-ball module:', error.message);
  spinningBallModule = {
    init: (params) => {
      console.error('spinning-ball module failed to load properly');
      // Return a minimal implementation to prevent crashes
      return {
        update: () => false,
        cameraPos: () => [0, 0, 0],
        cursorPos: () => null,
        camMoving: () => false,
        wasTapped: () => false,
        cursorChanged: () => false
      };
    }
  };
}

// Export the module using CommonJS exports
module.exports = spinningBallModule;
