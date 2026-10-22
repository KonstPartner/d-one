import { useTheme } from '@emotion/react';
import { useTranslation } from 'react-i18next';

import type { VersionGraphNode } from '../lib/buildVersionGraph';
import * as s from '../styles/VersionHistory';

type VersionNodeProps = {
  node: VersionGraphNode;
  date: string;
  onPress: () => void;
};

export const VersionNode = ({ node, date, onPress }: VersionNodeProps) => {
  const theme = useTheme();

  const { t } = useTranslation();

  return (
    <s.VersionNode
      $left={node.x}
      $top={node.y}
      accessibilityRole="button"
      accessibilityLabel={t('versionHistory.versionAccessibilityLabel', {
        version: node.release.version,
        date,
      })}
      onPress={onPress}
    >
      <s.VersionNodePill
        style={s.getVersionNodePillStyle(theme, node.kind, node.current)}
      >
        <s.VersionNodeText style={s.getVersionNodeTextStyle(theme, node.kind)}>
          {node.release.version}
        </s.VersionNodeText>
      </s.VersionNodePill>

      <s.VersionNodeDate $side={node.dateSide} numberOfLines={1}>
        {date}
      </s.VersionNodeDate>
    </s.VersionNode>
  );
};
