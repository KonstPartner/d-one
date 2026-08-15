import i18n from 'i18next';

import { showNotification } from '../notifications';

export type ValidateInput = 'email' | 'password' | 'nickname' | 'none';

export type ValidateInputType =
  | ValidateInput
  | {
      type: string;
      opt: boolean;
    };

type ValidationKey = `common.validation.${string}`;

type ValidationRule = {
  regex: RegExp;
  key: ValidationKey;
};

const getValidationRule = (type: ValidateInputType): ValidationRule | null => {
  const inputType = typeof type === 'string' ? type : type.type;

  let key: ValidationKey;
  let pattern: string;

  switch (inputType) {
    case 'email':
      key = 'common.validation.email';
      pattern = '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$';
      break;

    case 'password':
      key = 'common.validation.password';
      pattern = '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$';
      break;

    case 'nickname':
      key = 'common.validation.nickname';
      pattern = '^[\\p{L}\\p{N}_-]{1,32}$';
      break;

    default:
      return null;
  }

  if (typeof type !== 'string' && type.opt) {
    pattern = `^$|${pattern}`;
  }

  return {
    regex: new RegExp(pattern, 'u'),
    key,
  };
};

type ValidateInputOptions = {
  sendErrorNotification?: boolean;
  returnErrorMessage?: boolean;
};

export const validateInput = (
  type: ValidateInputType,
  input: string,
  {
    sendErrorNotification = false,
    returnErrorMessage = false,
  }: ValidateInputOptions = {}
): boolean | string => {
  const rule = getValidationRule(type);

  if (!rule) {
    return true;
  }

  if (rule.regex.test(input.trim())) {
    return true;
  }

  const message = i18n.t(rule.key);

  if (sendErrorNotification) {
    showNotification('error', message);
  }

  return returnErrorMessage ? message : false;
};

export const validateMultipleInputs = (
  data: Record<string, unknown>,
  fields: ValidateInputType[],
  sendErrorNotification = false
): boolean => {
  return fields.every((field) => {
    const key = typeof field === 'string' ? field : field.type;

    return (
      validateInput(field, String(data[key] ?? ''), {
        sendErrorNotification,
      }) === true
    );
  });
};
