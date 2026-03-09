import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

const PoultryLogo = ({ size = 65, color = '#E68A50' }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {/* Main circle background */}
      <Circle cx="50" cy="50" r="45" fill={color} />
      
      {/* Chicken head/body shape */}
      <Path 
        d="M35 40C35 35 40 30 50 30C60 30 65 35 65 40V60H70V40C70 30 60 25 50 25C40 25 30 30 30 40V60H35V40Z" 
        fill="white" 
      />
      
      {/* Left eye */}
      <Circle cx="42" cy="42" r="3" fill={color} />
      
      {/* Right eye */}
      <Circle cx="58" cy="42" r="3" fill={color} />
      
      {/* Beak */}
      <Path 
        d="M45 50H55C55 55 50 58 50 58C50 58 45 55 45 50Z" 
        fill={color} 
      />
    </Svg>
  );
};

export default PoultryLogo;