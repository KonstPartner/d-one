import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  type AppLanguage,
  normalizeAppLanguage,
  saveLanguage,
  setAppLanguage,
} from '@shared/i18n';

export const useChangeLanguage = () => {
  const { i18n } = useTranslation();

  const currentLanguage = normalizeAppLanguage(
    i18n.resolvedLanguage ?? i18n.language
  );

  const [draftLanguage, setDraftLanguage] =
    useState<AppLanguage>(currentLanguage);

  const [isOpen, setIsOpen] = useState(false);

  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    setDraftLanguage(currentLanguage);
  }, [currentLanguage]);

  const isDirty = draftLanguage !== currentLanguage;

  const open = (): void => {
    setIsOpen(true);
  };

  const close = (): void => {
    setIsOpen(false);
  };

  const pick = (language: AppLanguage): void => {
    setDraftLanguage(language);
    setIsOpen(false);
  };

  const apply = async (): Promise<void> => {
    if (!isDirty || isApplying) {
      return;
    }

    setIsApplying(true);

    try {
      await setAppLanguage(draftLanguage);

      await saveLanguage(draftLanguage);
    } finally {
      setIsApplying(false);
    }
  };

  return {
    currentLanguage,
    draftLanguage,

    isOpen,
    isDirty,
    isApplying,

    open,
    close,
    pick,
    apply,
  };
};
