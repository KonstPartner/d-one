import styled from '@emotion/native';

import * as ss from '@shared/styles';

export const Section = styled.View`
  gap: ${({ theme }) => ss.px(theme.spacing.xs)};
`;

export const Title = styled.Text`
  ${({ theme }) => ss.Caption(theme)};
`;

export const TextFrame = styled.View`
  position: relative;
`;

export const PreviewText = styled.Text`
  ${({ theme }) => ss.Body(theme)};
`;

export const Measurement = styled.View`
  position: absolute;

  top: 0;
  right: 0;
  left: 0;

  opacity: 0;
`;

export const MeasurementText = styled.Text`
  ${({ theme }) => ss.Body(theme)};
`;

export const MoreButton = styled.Pressable`
  align-self: flex-start;

  min-height: ${({ theme }) => ss.px(theme.control.height.sm)};

  justify-content: center;

  padding-horizontal: 0;
`;

export const MoreText = styled.Text`
  ${({ theme }) => ss.Text(theme, 'sm', 'bold', 'primary')};
`;
