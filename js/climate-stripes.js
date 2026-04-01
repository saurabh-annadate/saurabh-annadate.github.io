/**
 * Climate Warming Stripes Generator
 * Based on Ed Hawkins' #ShowYourStripes concept
 * Uses approximated global temperature anomaly data (Berkeley Earth / HadCRUT5)
 */

(function () {
    'use strict';

    // Approximate global temperature anomalies 1850-2024 (relative to 1961-1990 average)
    // Simplified dataset - replace with real data for accuracy
    const temperatureData = [
        -0.37, -0.33, -0.34, -0.30, -0.28, -0.31, -0.32, -0.38, -0.40, -0.38, // 1850-1859
        -0.35, -0.33, -0.42, -0.40, -0.35, -0.29, -0.30, -0.29, -0.34, -0.33, // 1860-1869
        -0.31, -0.30, -0.28, -0.27, -0.29, -0.28, -0.24, -0.17, -0.21, -0.18, // 1870-1879
        -0.19, -0.18, -0.16, -0.19, -0.21, -0.20, -0.18, -0.22, -0.19, -0.15, // 1880-1889
        -0.35, -0.30, -0.32, -0.30, -0.29, -0.24, -0.15, -0.12, -0.20, -0.17, // 1890-1899
        -0.10, -0.13, -0.25, -0.30, -0.38, -0.24, -0.16, -0.32, -0.38, -0.36, // 1900-1909
        -0.34, -0.32, -0.29, -0.27, -0.15, -0.10, -0.28, -0.32, -0.22, -0.21, // 1910-1919
        -0.17, -0.13, -0.22, -0.20, -0.19, -0.14, -0.06, -0.09, -0.11, -0.24, // 1920-1929
        -0.07, -0.04, -0.08, -0.10, -0.08, -0.11, -0.07, -0.01, -0.02, -0.02, // 1930-1939
         0.02, 0.10, 0.01, 0.02, 0.13, 0.09, -0.04, -0.03, -0.03, -0.06,       // 1940-1949
        -0.15, -0.02, 0.02, 0.07, -0.09, -0.10, -0.12, 0.03, 0.07, 0.02,       // 1950-1959
         0.01, 0.05, 0.03, 0.05, -0.15, -0.08, -0.01, -0.01, -0.06, 0.05,      // 1960-1969
         0.02, -0.07, 0.01, 0.12, -0.07, -0.01, -0.07, 0.12, 0.02, 0.09,       // 1970-1979
         0.17, 0.26, 0.05, 0.25, 0.08, 0.05, 0.12, 0.27, 0.31, 0.19,           // 1980-1989
         0.36, 0.33, 0.14, 0.19, 0.24, 0.36, 0.28, 0.40, 0.54, 0.32,           // 1990-1999
         0.33, 0.47, 0.56, 0.55, 0.48, 0.62, 0.55, 0.58, 0.44, 0.59,           // 2000-2009
         0.65, 0.54, 0.57, 0.61, 0.68, 0.76, 0.93, 0.84, 0.77, 0.92,           // 2010-2019
         1.00, 0.85, 0.89, 1.17, 1.29                                            // 2020-2024
    ];

    const startYear = 1850;

    /**
     * Get color for temperature anomaly using a diverging blue-red palette
     */
    function getStripeColor(anomaly, minVal, maxVal) {
        // RdBu diverging color scale (from d3)
        const coldColors = [
            [5, 48, 97],
            [33, 102, 172],
            [67, 147, 195],
            [146, 197, 222],
            [209, 229, 240],
            [247, 247, 247]
        ];
        const warmColors = [
            [247, 247, 247],
            [253, 219, 199],
            [244, 165, 130],
            [214, 96, 77],
            [178, 24, 43],
            [103, 0, 31]
        ];

        // Normalize to -1 to 1 range
        const range = Math.max(Math.abs(minVal), Math.abs(maxVal));
        let normalized = anomaly / range;
        normalized = Math.max(-1, Math.min(1, normalized));

        let colors, t;
        if (normalized <= 0) {
            t = (normalized + 1); // 0 to 1 (cold to neutral)
            colors = coldColors;
        } else {
            t = normalized; // 0 to 1 (neutral to warm)
            colors = warmColors;
        }

        // Map t to color array index
        const idx = t * (colors.length - 1);
        const lower = Math.floor(idx);
        const upper = Math.min(lower + 1, colors.length - 1);
        const frac = idx - lower;

        const r = Math.round(colors[lower][0] + (colors[upper][0] - colors[lower][0]) * frac);
        const g = Math.round(colors[lower][1] + (colors[upper][1] - colors[lower][1]) * frac);
        const b = Math.round(colors[lower][2] + (colors[upper][2] - colors[lower][2]) * frac);

        return `rgb(${r}, ${g}, ${b})`;
    }

    /**
     * Draw climate stripes on a canvas
     */
    function drawStripes(canvas, data, options = {}) {
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();

        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        const width = rect.width;
        const height = rect.height;
        const stripeWidth = width / data.length;

        const minVal = Math.min(...data);
        const maxVal = Math.max(...data);

        data.forEach((val, i) => {
            ctx.fillStyle = getStripeColor(val, minVal, maxVal);
            ctx.fillRect(i * stripeWidth, 0, stripeWidth + 1, height);
        });

        return { width, height, stripeWidth, minVal, maxVal };
    }

    /**
     * Initialize hero background stripes
     */
    function initHeroStripes() {
        const canvas = document.getElementById('climateStripes');
        if (!canvas) return;
        drawStripes(canvas, temperatureData);
    }

    /**
     * Initialize interactive stripes section
     */
    function initInteractiveStripes() {
        const canvas = document.getElementById('interactiveStripes');
        const tooltip = document.getElementById('stripesTooltip');
        if (!canvas || !tooltip) return;

        let info = drawStripes(canvas, temperatureData);

        // Hover interaction
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const index = Math.floor(x / info.stripeWidth);

            if (index >= 0 && index < temperatureData.length) {
                const year = startYear + index;
                const anomaly = temperatureData[index];
                const sign = anomaly >= 0 ? '+' : '';

                tooltip.textContent = `${year}: ${sign}${anomaly.toFixed(2)}°C`;
                tooltip.style.left = `${x}px`;
                tooltip.style.opacity = '1';
            }
        });

        canvas.addEventListener('mouseleave', () => {
            tooltip.style.opacity = '0';
        });

        // Resize handler
        window.addEventListener('resize', () => {
            info = drawStripes(canvas, temperatureData);
        });
    }

    /**
     * Initialize footer mini stripes
     */
    function initFooterStripes() {
        const canvas = document.getElementById('footerStripes');
        if (!canvas) return;
        drawStripes(canvas, temperatureData);

        window.addEventListener('resize', () => {
            drawStripes(canvas, temperatureData);
        });
    }

    // Initialize everything on DOM ready
    document.addEventListener('DOMContentLoaded', () => {
        initHeroStripes();
        initInteractiveStripes();
        initFooterStripes();

        // Re-draw hero stripes on resize
        window.addEventListener('resize', initHeroStripes);
    });

    // Expose for external use
    window.ClimateStripes = {
        data: temperatureData,
        startYear: startYear,
        drawStripes: drawStripes,
        getStripeColor: getStripeColor
    };
})();