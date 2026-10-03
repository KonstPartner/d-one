import { useMemo, useState } from 'react';
import { type LayoutChangeEvent } from 'react-native';
import { useTheme } from '@emotion/react';
import { useTranslation } from 'react-i18next';
import Svg, { Path } from 'react-native-svg';

import { normalizeAppLanguage } from '@shared/i18n';

import {
  buildVersionGraph,
  buildVersionGraphPath,
} from '../lib/buildVersionGraph';
import { formatReleaseDate } from '../lib/formatReleaseDate';
import type { AppRelease } from '../model/types';
import * as s from '../styles/VersionHistory';

import { VersionNode } from './VersionNode';

type VersionGraphProps = {
  releases: readonly AppRelease[];
  currentVersion: string;
  onVersionPress: (version: string) => void;
};

export const VersionGraph = ({
  releases,
  currentVersion,
  onVersionPress,
}: VersionGraphProps) => {
  const theme = useTheme();

  const { i18n } = useTranslation();

  const [width, setWidth] = useState(0);

  const language = normalizeAppLanguage(i18n.resolvedLanguage);

  const layout = useMemo(
    () =>
      buildVersionGraph({
        releases,
        currentVersion,
        width,
      }),
    [currentVersion, releases, width]
  );

  const handleLayout = (event: LayoutChangeEvent): void => {
    const nextWidth = event.nativeEvent.layout.width;

    setWidth((currentWidth) =>
      currentWidth === nextWidth ? currentWidth : nextWidth
    );
  };

  return (
    <s.GraphCanvas
      onLayout={handleLayout}
      style={s.getGraphCanvasStyle(layout.height)}
    >
      {width > 0 && (
        <Svg width={width} height={layout.height} pointerEvents="none">
          {layout.edges.map((edge) => (
            <Path
              key={`${edge.fromVersion}-${edge.toVersion}`}
              d={buildVersionGraphPath(edge)}
              fill="none"
              stroke={s.getGraphLineColor(theme, edge.kind)}
              strokeWidth={edge.kind === 'patch' ? 4 : 6}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </Svg>
      )}

      {layout.nodes.map((node) => (
        <VersionNode
          key={node.release.version}
          node={node}
          date={formatReleaseDate(node.release.releasedAt, language, 'short')}
          onPress={() => {
            onVersionPress(node.release.version);
          }}
        />
      ))}
    </s.GraphCanvas>
  );
};
