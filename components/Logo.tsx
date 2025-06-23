import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Rect, G, Text as SvgText } from 'react-native-svg';

type LogoProps = {
  width?: number;
  height?: number;
  showText?: boolean;
  color?: string;
  textColor?: string;
};

export const Logo: React.FC<LogoProps> = ({
  width = 220,
  height = 60,
  showText = true,
  color = '#4F46E5',
  textColor = '#1F2937',
}) => {
  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height} viewBox="0 0 220 60" fill="none">
        <G transform="translate(0, 12) scale(0.6)">
          <Path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10 0C4.47715 0 0 4.47715 0 10V22C5.52285 22 10 26.4772 10 32C10 37.5228 5.52285 42 0 42V50C0 55.5228 4.47715 60 10 60H80C85.5228 60 90 55.5228 90 50V42C84.4772 42 80 37.5228 80 32C80 26.4772 84.4772 22 90 22V10C90 4.47715 85.5228 0 80 0H10Z"
            fill={color}
          />
          <Path d="M33 18H57V25H48V42H42V25H33V18Z" fill="white" />
        </G>
        {showText && (
          <SvgText
            x="65"
            y="30"
            dominantBaseline="middle"
            fontFamily="Inter, sans-serif"
            fontSize="28"
            fontWeight="bold"
            fill={textColor}
          >
            TEMBA
          </SvgText>
        )}
      </Svg>
    </View>
  );
};

export const LogoIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 32,
  color = '#4F46E5',
}) => {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <Rect width="32" height="32" fill={color} />
        <G transform="translate(6, 8) scale(0.3)">
          <Path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10 0C4.47715 0 0 4.47715 0 10V22C5.52285 22 10 26.4772 10 32C10 37.5228 5.52285 42 0 42V50C0 55.5228 4.47715 60 10 60H80C85.5228 60 90 55.5228 90 50V42C84.4772 42 80 37.5228 80 32C80 26.4772 84.4772 22 90 22V10C90 4.47715 85.5228 0 80 0H10Z"
            fill="white"
          />
          <Path d="M33 18H57V25H48V42H42V25H33V18Z" fill={color} />
        </G>
      </Svg>
    </View>
  );
};

export const SplashLogo: React.FC<{ size?: number }> = ({ size = 200 }) => {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 1024 1024" fill="none">
        <Rect width="1024" height="1024" fill="white" />
        <G transform="translate(300, 400) scale(6)">
          <Path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10 0C4.47715 0 0 4.47715 0 10V22C5.52285 22 10 26.4772 10 32C10 37.5228 5.52285 42 0 42V50C0 55.5228 4.47715 60 10 60H80C85.5228 60 90 55.5228 90 50V42C84.4772 42 80 37.5228 80 32C80 26.4772 84.4772 22 90 22V10C90 4.47715 85.5228 0 80 0H10Z"
            fill="#4F46E5"
          />
          <Path d="M33 18H57V25H48V42H42V25H33V18Z" fill="white" />
        </G>
        <SvgText
          x="512"
          y="750"
          textAnchor="middle"
          fontFamily="Inter, sans-serif"
          fontSize="100"
          fontWeight="bold"
          fill="#1F2937"
        >
          TEMBA
        </SvgText>
      </Svg>
    </View>
  );
};

export default Logo;