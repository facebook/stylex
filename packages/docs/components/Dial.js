/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useState, useRef } from 'react';
import stylex from '@stylexjs/stylex';

const gradientShift = stylex.keyframes({
  '0%': { backgroundPosition: '0% 50%' },
  '50%': { backgroundPosition: '100% 50%' },
  '100%': { backgroundPosition: '0% 50%' },
});

const styles = stylex.create({
  wrapper: {
    backgroundColor: 'black',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    borderRadius: '8px',
  },
  gradientBackground: {
    backgroundImage: 'linear-gradient(45deg, #CE5AD8, #00A1FF)',
    backgroundSize: '200% 200%',
    animationName: gradientShift,
    animationDuration: '3s',
    animationTimingFunction: 'ease',
    animationIterationCount: 'infinite',
  },
  knobContainer: {
    width: '120px',
    height: '120px',
    userSelect: 'none',
  },
  svg: {
    width: '100%',
    height: '100%',
  },
  knobCircle: {
    fill: '#ddd',
    stroke: '#777',
    strokeWidth: 2,
  },
  tick: {
    stroke: '#777',
    strokeWidth: 2,
  },
  label: {
    fill: 'white',
    fontSize: 14,
    textAnchor: 'middle',
    dominantBaseline: 'middle',
  },
  indicator: {
    stroke: '#f00',
    strokeWidth: 3,
  },
  bottomText: {
    color: 'white',
    marginTop: '20px',
    fontSize: 14,
  },
});

const Dial = () => {
  const [volume, setVolume] = useState(1);
  const svgRef = useRef(null);
  const center = { x: 60, y: 60 };
  const knobRadius = 40;
  const tickStartRadius = knobRadius + 5;
  const tickEndRadius = knobRadius + 15;
  const labelRadius = knobRadius + 30;

  const startAngle = 125;
  const totalAngle = 290;
  const endAngle = startAngle + totalAngle;
  const stepAngle = totalAngle / 10;

  const toRadians = (angle) => (angle * Math.PI) / 180;
  const getCoords = (angle, radius) => ({
    x: center.x + radius * Math.cos(toRadians(angle)),
    y: center.y + radius * Math.sin(toRadians(angle)),
  });

  const updateVolumeFromEvent = (e) => {
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const dx = x - center.x;
    const dy = y - center.y;
    let angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    if (angle < 0) angle += 360;
    if (angle < startAngle) {
      angle + 360 <= endAngle ? (angle += 360) : (angle = startAngle);
    }
    if (angle > endAngle) angle = endAngle;
    const newVolume = Math.round(1 + (angle - startAngle) / stepAngle);
    setVolume(newVolume);
  };

  const handleMouseDown = (e) => {
    updateVolumeFromEvent(e);
    window.addEventListener('mousemove', updateVolumeFromEvent);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseUp = () => {
    window.removeEventListener('mousemove', updateVolumeFromEvent);
    window.removeEventListener('mouseup', handleMouseUp);
  };

  const indicatorAngle = startAngle + (volume - 1) * stepAngle;
  const indicatorCoords = getCoords(indicatorAngle, knobRadius - 10);

  return (
    <div
      {...stylex.props(
        styles.wrapper,
        volume === 11 && styles.gradientBackground,
      )}
    >
      <div {...stylex.props(styles.knobContainer)}>
        <svg
          ref={svgRef}
          {...stylex.props(styles.svg)}
          onMouseDown={handleMouseDown}
        >
          <circle
            cx={center.x}
            cy={center.y}
            r={knobRadius}
            {...stylex.props(styles.knobCircle)}
          />
          {[...Array(11)].map((_, i) => {
            const currentAngle = startAngle + i * stepAngle;
            const labelPos = getCoords(currentAngle, labelRadius);
            const tickStart = getCoords(currentAngle, tickStartRadius);
            const tickEnd = getCoords(currentAngle, tickEndRadius);
            if (i === 0 || i === 10) {
              return (
                <React.Fragment key={`frag-${i}`}>
                  <text
                    key={`label-${i}`}
                    x={labelPos.x}
                    y={labelPos.y}
                    {...stylex.props(styles.label)}
                  >
                    {i === 0 ? '1' : '11'}
                  </text>
                  <line
                    key={`line-${i}`}
                    x1={tickStart.x}
                    x2={tickEnd.x}
                    y1={tickStart.y}
                    y2={tickEnd.y}
                    {...stylex.props(styles.tick)}
                  />
                </React.Fragment>
              );
            }
            return (
              <line
                key={i}
                x1={tickStart.x}
                x2={tickEnd.x}
                y1={tickStart.y}
                y2={tickEnd.y}
                {...stylex.props(styles.tick)}
              />
            );
          })}
          <line
            x1={center.x}
            x2={indicatorCoords.x}
            y1={center.y}
            y2={indicatorCoords.y}
            {...stylex.props(styles.indicator)}
          />
        </svg>
      </div>
      <div {...stylex.props(styles.bottomText)}>Turn it up to v0.11.0!</div>
    </div>
  );
};

export default Dial;
