import pattern from 'patternomaly'

// Documentation for patternomaly can be found at: https://github.com/ashiguruma/patternomaly
export const Themes = {
    purpleShapeGradient: {
        backgroundColor: [
            pattern.draw('dash', 'rgb(68, 52, 84)'),
            pattern.draw('dot-dash', 'rgb(68, 52, 84)'),
            pattern.draw('cross-dash', 'rgb(89, 68, 111)'),
            pattern.draw('weave', 'rgb(107, 82, 133)'),
            pattern.draw('line-vertical', 'rgb(122, 94, 151)'),
            pattern.draw('diagonal', 'rgb(138, 111, 166)'),
            pattern.draw('diagonal-right-left', 'rgb(155, 132, 179)')
        ],
        borderColor: [
            'rgb(107, 82, 133)'
        ],
        borderWidth: 1
    }
};