// This is a wrapper for the spinning-ball package to handle ES module compatibility
// It uses a technique to convert the ES module exports to CommonJS exports

// Import the spinning-ball package
import * as spinningBallOriginal from 'spinning-ball';

// Create a type-safe interface for the spinning-ball module
interface SpinningBallModule {
  init: (params: any) => {
    update: (time?: number) => boolean;
    cameraPos: () => number[];
    cursorPos: () => any;
    camMoving: () => boolean;
    wasTapped: () => boolean;
    cursorChanged: () => boolean;
  };
}

// Use the imported module or create a fallback if it fails
const spinningBallModule: SpinningBallModule = spinningBallOriginal || {
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

// Export the module
export = spinningBallModule;
