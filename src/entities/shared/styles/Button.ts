import { StyleProp, TextStyle, ViewStyle } from 'react-native';
import { css } from '@emotion/native';

export const TouchableOpacityStyle = css`
  border-radius: 3px;
  padding: 12px 16px;
  color: white;
  justify-content: center;
  align-items: center;
` as StyleProp<ViewStyle>;

export const TouchableOpacityDisabled = css`
  border-radius: 8px;
  padding: 12px 16px;
` as StyleProp<ViewStyle>;

export const TextDisabled = css`
  color: white;
  font-size: 16px;
  font-weight: bold;
  text-align: center;
` as StyleProp<TextStyle>;
