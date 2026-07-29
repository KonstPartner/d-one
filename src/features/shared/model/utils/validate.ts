import { i18n } from '@features/i18n/model';
import { ValidateInputType } from '@features/shared/model/types';
import { showNotification } from '@features/shared/ui/Notification';

type ValidationKey = `common.validation.${string}`;

const validateRules = (type: ValidateInputType) => {
  let key: ValidationKey = 'common.validation.required';
  let regexStr: string;

  switch (typeof type === 'string' ? type : type.type) {
    case 'email':
      key = 'common.validation.email';
      regexStr = '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$';
      break;

    case 'password':
      key = 'common.validation.password';
      regexStr = '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$';
      break;

    case 'nickname':
      key = 'common.validation.nickname';
      regexStr = '^.{1,255}$';
      break;

    default:
      return true;
  }

  const finalRegexStr =
    typeof type !== 'string' && type.opt ? `^$|${regexStr}` : regexStr;

  return { regexStr: finalRegexStr, key };
};

/**
 * Validates an input based on the specified type and returns true if the input is valid according to the rules.
 * If validation fails, it can show an error notification and/or return an error message.
 *
 * @param type - The type of input to validate.
 * @param input - The input value to validate.
 * @param options - Configuration options for validation.
 * @param options.sendErrorNotification - Whether to show an error notification if validation fails (default: false).
 * @param options.returnErrorMessage - Whether to return the error message instead of false if validation fails (default: false).
 * @returns Returns true if the input matches the validation rules, false if validation fails and returnErrorMessage is false, or the error message if returnErrorMessage is true.
 */
export const validateInput = (
  type: ValidateInputType,
  input: string,
  {
    sendErrorNotification = false,
    returnErrorMessage = false,
  }: { sendErrorNotification?: boolean; returnErrorMessage?: boolean } = {}
) => {
  const res = validateRules(type);

  if (typeof res === 'boolean') {
    return true;
  }

  if (new RegExp(res.regexStr, 'u').test(input.trim())) {
    return true;
  }

  const message = i18n.t(res.key);

  if (sendErrorNotification) {
    showNotification('error', message);
  }

  return returnErrorMessage ? message : false;
};

/**
 * Validates multiple required fields and returns true if all are valid.
 * If any field is invalid, shows an error notification for the first invalid field.
 *
 * @param {Record<string, string>} data - Object containing field values.
 * @param {ValidateInputType[]} fields - Array of field types to validate.
 * @param {boolean} [sendErrorNotification] (default: false) - Whether to send an error notification for the first invalid field.
 * @returns Returns true if all fields are valid, otherwise false.
 */
export const validateMultipleInputs = (
  data: Record<string, unknown>,
  fields: ValidateInputType[],
  sendErrorNotification: boolean = false
): boolean => {
  return fields.every((field) => {
    const isValid = validateInput(
      field,
      data[typeof field === 'string' ? field : field.type] as string,
      { sendErrorNotification }
    );

    return isValid;
  });
};
