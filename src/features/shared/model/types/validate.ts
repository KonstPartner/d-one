export type ValidateInputType = ValidateInput | { type: string; opt: boolean };

export type ValidateInput = 'email' | 'password' | 'nickname' | 'none';
