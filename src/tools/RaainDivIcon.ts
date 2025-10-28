import {DivIcon, DivIconOptions, Marker, PointExpression} from 'leaflet';

/**
 * Extended DivIconOptions to include rotation and dynamic sizing properties
 */
export interface RaainDivIconOptions extends DivIconOptions {
    /**
     * Initial rotation angle in degrees (0 = North, 90 = East, 180 = South, 270 = West)
     */
    rotationAngle?: number;

    /**
     * CSS transform-origin for rotation (default: 'center center')
     */
    rotationOrigin?: string;

    /**
     * Dynamic width in pixels (overrides iconSize width if provided)
     */
    width?: number;

    /**
     * Dynamic height in pixels (overrides iconSize height if provided)
     */
    height?: number;

    /**
     * Base HTML template - can include {width} and {height} placeholders for dynamic sizing
     */
    htmlTemplate?: string;
}

/**
 * A DivIcon with built-in rotation and dynamic sizing support
 *
 * Usage:
 * ```typescript
 * // Basic usage with rotation
 * const icon = new RaainDivIcon({
 *     html: '<div style="width: 30px; height: 30px; background: red;"></div>',
 *     rotationAngle: 0,
 *     className: 'my-custom-marker'
 * });
 *
 * // With dynamic sizing (for wind speed visualization)
 * const windIcon = new RaainDivIcon({
 *     htmlTemplate: `<div style="width: {width}px; height: {height}px; background: blue;"></div>`,
 *     width: 40,
 *     height: 40,
 *     rotationAngle: 45
 * });
 *
 * const marker = L.marker([51.505, -0.09], { icon: windIcon }).addTo(map);
 *
 * // Update rotation dynamically
 * windIcon.setRotation(90);
 *
 * // Update size dynamically (e.g., based on wind speed)
 * windIcon.setSize(60, 60);
 *
 * // Update both size and rotation
 * windIcon.update({ width: 50, height: 50, rotationAngle: 180 });
 * ```
 */
export class RaainDivIcon extends DivIcon {
    private _icon: HTMLElement | null = null;
    private _marker: Marker | null = null;

    constructor(public options: RaainDivIconOptions) {
        // Process initial size options
        const processedOptions = RaainDivIcon._processSizeOptions(options);
        super(processedOptions);

        this.options = {
            ...processedOptions,
            rotationAngle: options.rotationAngle ?? 0,
            rotationOrigin: options.rotationOrigin ?? 'center center',
            width: options.width,
            height: options.height,
            htmlTemplate: options.htmlTemplate,
        };
    }

    /**
     * Process size options and generate HTML from template if needed
     */
    private static _processSizeOptions(options: RaainDivIconOptions): RaainDivIconOptions {
        const processed = {...options};

        // Update iconSize if width/height are provided
        if (options.width !== undefined || options.height !== undefined) {
            const width =
                options.width ?? (Array.isArray(options.iconSize) ? options.iconSize[0] : 30);
            const height =
                options.height ?? (Array.isArray(options.iconSize) ? options.iconSize[1] : 30);
            processed.iconSize = [width, height] as PointExpression;

            // Update iconAnchor proportionally if it exists
            if (options.iconAnchor && Array.isArray(options.iconAnchor)) {
                const oldSize = Array.isArray(options.iconSize) ? options.iconSize : [30, 30];
                const anchorX = (options.iconAnchor[0] / oldSize[0]) * width;
                const anchorY = (options.iconAnchor[1] / oldSize[1]) * height;
                processed.iconAnchor = [anchorX, anchorY] as PointExpression;
            }
        }

        // Generate HTML from template if provided
        if (options.htmlTemplate && (options.width !== undefined || options.height !== undefined)) {
            const width =
                options.width ?? (Array.isArray(processed.iconSize) ? processed.iconSize[0] : 30);
            const height =
                options.height ?? (Array.isArray(processed.iconSize) ? processed.iconSize[1] : 30);
            processed.html = options.htmlTemplate
                .replace(/\{width\}/g, String(width))
                .replace(/\{height\}/g, String(height));
        }

        return processed;
    }

    /**
     * Override createIcon to store reference and apply initial rotation
     */
    createIcon(oldIcon?: HTMLElement): HTMLElement {
        const div = super.createIcon(oldIcon) as HTMLElement;
        this._icon = div;

        // Set transform-origin
        div.style.transformOrigin = this.options.rotationOrigin;

        // Apply initial rotation
        this.applyRotation();

        return div;
    }

    /**
     * Set the rotation angle in degrees
     * @param angle Rotation angle (0 = North, 90 = East, 180 = South, 270 = West)
     */
    setRotation(angle: number): this {
        this.options.rotationAngle = angle;
        this.applyRotation();
        return this;
    }

    /**
     * Get the current rotation angle
     */
    getRotation(): number {
        return this.options.rotationAngle ?? 0;
    }

    /**
     * Set the size (width and height) of the icon dynamically
     * @param width New width in pixels
     * @param height New height in pixels
     */
    setSize(width: number, height: number): this {
        this.options.width = width;
        this.options.height = height;
        this._updateSize();
        return this;
    }

    /**
     * Get the current size
     */
    getSize(): {width: number; height: number} {
        const iconSize = Array.isArray(this.options.iconSize) ? this.options.iconSize : [30, 30];
        return {
            width: this.options.width ?? iconSize[0],
            height: this.options.height ?? iconSize[1],
        };
    }

    /**
     * Update multiple properties at once (size, rotation)
     * @param updates Object with properties to update
     */
    update(updates: {width?: number; height?: number; rotationAngle?: number}): this {
        let sizeChanged = false;

        if (updates.width !== undefined) {
            this.options.width = updates.width;
            sizeChanged = true;
        }
        if (updates.height !== undefined) {
            this.options.height = updates.height;
            sizeChanged = true;
        }
        if (updates.rotationAngle !== undefined) {
            this.options.rotationAngle = updates.rotationAngle;
        }

        if (sizeChanged) {
            this._updateSize();
        }
        this.applyRotation();

        return this;
    }

    /**
     * Set the transform origin for rotation
     * @param origin CSS transform-origin value (e.g., 'center center', '50% 50%')
     */
    setRotationOrigin(origin: string): this {
        this.options.rotationOrigin = origin;
        if (this._icon) {
            this._icon.style.transformOrigin = origin;
            this.applyRotation();
        }
        return this;
    }

    /**
     * Apply the current rotation to the icon element
     * This preserves any existing translate3d transformations from Leaflet
     */
    applyRotation(): this {
        if (!this._icon) {
            return this;
        }

        const currentTransform = this._icon.style.transform || '';
        const angle = this.options.rotationAngle ?? 0;

        // Preserve existing translate3d from Leaflet positioning
        if (currentTransform.includes('translate3d')) {
            // Remove any existing rotation from the transform
            const withoutRotation = currentTransform.replace(/\s*rotate\([^)]+\)/g, '');
            this._icon.style.transform = `${withoutRotation} rotate(${angle}deg)`;
        } else {
            this._icon.style.transform = `rotate(${angle}deg)`;
        }

        return this;
    }

    /**
     * Bind this icon to a marker for automatic rotation updates
     * @param marker The Leaflet marker to bind to
     */
    bindToMarker(marker: Marker): this {
        this._marker = marker;

        // Re-apply rotation on marker events that might reset the transform
        marker.on('move', () => this.applyRotation());
        marker.on('add', () => this.applyRotation());

        return this;
    }

    /**
     * Unbind from the current marker
     */
    unbindFromMarker(): this {
        if (this._marker) {
            this._marker.off('move');
            this._marker.off('add');
            this._marker = null;
        }
        return this;
    }

    /**
     * Get the icon HTML element (if created)
     */
    getIconElement(): HTMLElement | null {
        return this._icon;
    }

    /**
     * Internal method to update the icon's size
     */
    private _updateSize(): void {
        if (!this._icon || this.options.width === undefined || this.options.height === undefined) {
            return;
        }

        const width = this.options.width;
        const height = this.options.height;

        // Update iconSize
        this.options.iconSize = [width, height] as PointExpression;

        // Update the icon element's size
        this._icon.style.width = `${width}px`;
        this._icon.style.height = `${height}px`;

        // Update anchor proportionally
        if (this.options.iconAnchor && Array.isArray(this.options.iconAnchor)) {
            const anchorX = this.options.iconAnchor[0];
            const anchorY = this.options.iconAnchor[1];
            this._icon.style.marginLeft = `-${anchorX}px`;
            this._icon.style.marginTop = `-${anchorY}px`;
        }

        // Regenerate HTML from template if available
        if (this.options.htmlTemplate) {
            const newHtml = this.options.htmlTemplate
                .replace(/\{width\}/g, String(width))
                .replace(/\{height\}/g, String(height));
            this._icon.innerHTML = newHtml;
        }
    }
}
