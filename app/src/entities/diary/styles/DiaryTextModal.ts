import styled from '@emotion/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import * as ss from '@shared/styles';
import { Button } from '@shared/ui';

export const Root = styled.View`
  flex: 1;

  justify-content: flex-end;
`;

export const Backdrop = styled.Pressable`
  position: absolute;

  top: 0;
  right: 0;
  bottom: 0;
  left: 0;

  background-color: rgba(0, 0, 0, 0.52);
`;

export const Sheet = styled(SafeAreaView)`
  width: 100%;

  max-width: 500px;
  max-height: 93%;

  align-self: center;

  overflow: hidden;

  background-color: ${({ theme }) => theme.colors.bg};

  border-top-left-radius: ${({ theme }) => ss.px(theme.radius.xl)};

  border-top-right-radius: ${({ theme }) => ss.px(theme.radius.xl)};
`;

export const Header = styled.View`
  min-height: 58px;

  flex-direction: row;

  align-items: center;
  justify-content: space-between;

  gap: ${({ theme }) => ss.px(theme.spacing.md)};

  padding-horizontal: ${({ theme }) => ss.px(theme.spacing.md)};

  border-bottom-width: ${({ theme }) => ss.px(theme.border.width.sm)};

  border-bottom-color: ${({ theme }) => theme.colors.border};

  background-color: ${({ theme }) => theme.colors.card};
`;

export const Title = styled.Text`
  flex: 1;

  ${({ theme }) => ss.Subheading(theme)};
`;

export const HeaderCloseButton = styled(Button)`
  width: ${({ theme }) => ss.px(theme.control.height.sm)};

  padding-horizontal: 0;
  padding-vertical: 0;
`;

export const Body = styled.ScrollView`
  flex-shrink: 1;

  min-height: 0;
`;

export const BodyContent = styled.View`
  padding: ${({ theme }) => ss.px(theme.spacing.md)};

  padding-bottom: ${({ theme }) => ss.px(theme.spacing.xl)};
`;

export const BodyText = styled.Text`
  ${({ theme }) => ss.Body(theme)};
`;

export const Footer = styled.View`
  padding: ${({ theme }) => ss.px(theme.spacing.md)};

  border-top-width: ${({ theme }) => ss.px(theme.border.width.sm)};

  border-top-color: ${({ theme }) => theme.colors.border};

  background-color: ${({ theme }) => theme.colors.card};
`;

export const FooterButton = styled(Button)`
  width: 100%;
`;

export const FooterButtonText = styled.Text`
  ${({ theme }) => ss.Text(theme, 'base', 'semibold', 'inverse')};
`;
