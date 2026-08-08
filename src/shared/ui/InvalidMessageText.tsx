import { validateInput, type ValidateInputType } from '@shared/lib/validation';

import * as s from './styles/InvalidMessageText';

export type InvalidMessageTextProps = {
  field: ValidateInputType;
  value: string;
  isActive: boolean;
};

export const InvalidMessageText = ({
  field,
  value,
  isActive,
}: InvalidMessageTextProps) => {
  if (!isActive) {
    return null;
  }

  const message = validateInput(field, value, {
    returnErrorMessage: true,
  });

  if (typeof message !== 'string' || message.length === 0) {
    return null;
  }

  return <s.Message>{message}</s.Message>;
};
