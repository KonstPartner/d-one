import { Text } from 'react-native';

import { ValidateInputType } from '@features/shared/model/types';
import { validateInput } from '@features/shared/model/utils/validate';
import * as styles from '@features/shared/styles/InvalidMessageText';

const InvalidMessageText = ({
  field,
  value,
  isActive,
}: {
  field: ValidateInputType;
  value: string;
  isActive: boolean;
}) => {
  const message = validateInput(field, value, {
    returnErrorMessage: true,
  }) as string;

  if (!isActive) {
    return;
  }

  return <Text style={styles.TextStyle}>{message}</Text>;
};

export default InvalidMessageText;
