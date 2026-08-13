import styled from '@emotion/native';

import * as ss from '@shared/styles';
import { Button } from '@shared/ui';

export const Root = styled(Button)`
  ${ss.FullWidth};
`;

export const Text = styled.Text`
  ${({ theme }) => ss.Text(theme, 'md', 'bold', 'danger', 'md')};
`;
