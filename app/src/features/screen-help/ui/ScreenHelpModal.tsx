import { useTheme } from '@emotion/react';
import { useTranslation } from 'react-i18next';

import * as ss from '@shared/styles';
import { PortalModal } from '@shared/ui';

import * as s from '../styles/ScreenHelp';

export type ScreenHelpSection = {
  key: string;

  titleKey: string;
  descriptionKey?: string;

  bulletKeys?: readonly string[];
};

type ScreenHelpModalProps = {
  visible: boolean;

  titleKey: string;
  introKey?: string;

  sections: readonly ScreenHelpSection[];

  onClose: () => void;
};

export const ScreenHelpModal = ({
  visible,

  titleKey,
  introKey,

  sections,

  onClose,
}: ScreenHelpModalProps) => {
  const theme = useTheme();

  const { t } = useTranslation();

  return (
    <PortalModal visible={visible} onClose={onClose}>
      <s.Root>
        <s.Title style={ss.Heading(theme)}>{t(titleKey)}</s.Title>

        {introKey !== undefined && (
          <s.Intro style={ss.Body(theme)}>{t(introKey)}</s.Intro>
        )}

        {sections.map((section) => (
          <s.Section key={section.key}>
            <s.SectionTitle style={ss.Subheading(theme)}>
              {t(section.titleKey)}
            </s.SectionTitle>

            {section.descriptionKey !== undefined && (
              <s.Paragraph style={ss.Body(theme)}>
                {t(section.descriptionKey)}
              </s.Paragraph>
            )}

            {section.bulletKeys !== undefined &&
              section.bulletKeys.length > 0 && (
                <s.Bullets>
                  {section.bulletKeys.map((bulletKey) => (
                    <s.BulletRow key={bulletKey}>
                      <s.BulletMark style={ss.Body(theme)}>•</s.BulletMark>

                      <s.BulletText style={ss.Body(theme)}>
                        {t(bulletKey)}
                      </s.BulletText>
                    </s.BulletRow>
                  ))}
                </s.Bullets>
              )}
          </s.Section>
        ))}
      </s.Root>
    </PortalModal>
  );
};
