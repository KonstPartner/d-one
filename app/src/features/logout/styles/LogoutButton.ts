import styled from '@emotion/native';

import * as ss from '@shared/styles';

export const Text = styled.Text`
  ${({ theme }) => ss.Text(theme, 'md', 'bold', 'danger', 'md')};
`;
