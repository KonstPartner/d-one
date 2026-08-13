import styled from '@emotion/native';

import * as ss from '@shared/styles';

export const Message = styled.Text`
  ${({ theme }) => ss.Text(theme, 'sm', 'regular', 'danger', 'sm')};
`;
