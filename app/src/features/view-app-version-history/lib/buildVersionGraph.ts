import type { AppRelease, AppReleaseKind } from '../model/types';

import { compareAppVersions, getAppReleaseKind } from './version';

export const VERSION_GRAPH_NODE_WIDTH = 72;
export const VERSION_GRAPH_NODE_HEIGHT = 48;
export const VERSION_GRAPH_PILL_HEIGHT = 40;

type VersionGraphDateSide = 'left' | 'right';

export type VersionGraphNode = {
  release: AppRelease;
  kind: AppReleaseKind;
  x: number;
  y: number;
  dateSide: VersionGraphDateSide;
  current: boolean;
};

export type VersionGraphEdge = {
  fromVersion: string;
  toVersion: string;
  kind: AppReleaseKind;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
};

export type VersionGraphLayout = {
  height: number;
  nodes: readonly VersionGraphNode[];
  edges: readonly VersionGraphEdge[];
};

type BuildVersionGraphParams = {
  releases: readonly AppRelease[];
  currentVersion: string;
  width: number;
};

const GRAPH_TOP_PADDING = 64;
const GRAPH_BOTTOM_PADDING = 64;
const GRAPH_ROW_HEIGHT = 128;
const GRAPH_MINIMUM_HEIGHT = 320;
const GRAPH_LINE_NODE_GAP = 2;

const LANE_FACTOR: Record<AppReleaseKind, number> = {
  major: 0.18,
  minor: 0.5,
  patch: 0.82,
};

const getDateSide = (kind: AppReleaseKind): VersionGraphDateSide =>
  kind === 'major' ? 'right' : 'left';

export const buildVersionGraph = ({
  releases,
  currentVersion,
  width,
}: BuildVersionGraphParams): VersionGraphLayout => {
  const sortedReleases = [...releases].sort((left, right) =>
    compareAppVersions(right.version, left.version)
  );

  const height = Math.max(
    GRAPH_MINIMUM_HEIGHT,
    GRAPH_TOP_PADDING +
      GRAPH_BOTTOM_PADDING +
      Math.max(0, sortedReleases.length - 1) * GRAPH_ROW_HEIGHT
  );

  if (width <= 0 || sortedReleases.length === 0) {
    return {
      height,
      nodes: [],
      edges: [],
    };
  }

  const availableHeight = height - GRAPH_TOP_PADDING - GRAPH_BOTTOM_PADDING;
  const rowStep =
    sortedReleases.length > 1
      ? availableHeight / (sortedReleases.length - 1)
      : 0;

  const nodes = sortedReleases.map<VersionGraphNode>((release, index) => {
    const kind = getAppReleaseKind(release.version);

    return {
      release,
      kind,
      x: width * LANE_FACTOR[kind],
      y:
        sortedReleases.length === 1
          ? height / 2
          : GRAPH_TOP_PADDING + index * rowStep,
      dateSide: getDateSide(kind),
      current: release.version === currentVersion,
    };
  });

  const edges = nodes.slice(0, -1).map<VersionGraphEdge>((node, index) => {
    const nextNode = nodes[index + 1];

    return {
      fromVersion: node.release.version,
      toVersion: nextNode.release.version,
      kind: node.kind,
      fromX: node.x,
      fromY: node.y,
      toX: nextNode.x,
      toY: nextNode.y,
    };
  });

  return {
    height,
    nodes,
    edges,
  };
};

export const buildVersionGraphPath = (edge: VersionGraphEdge): string => {
  const rawDeltaY = edge.toY - edge.fromY;
  const directionY = Math.sign(rawDeltaY) || 1;
  const nodeOffset = VERSION_GRAPH_PILL_HEIGHT / 2 + GRAPH_LINE_NODE_GAP;

  const fromY = edge.fromY + directionY * nodeOffset;
  const toY = edge.toY - directionY * nodeOffset;

  const deltaX = edge.toX - edge.fromX;
  const deltaY = toY - fromY;

  if (Math.abs(deltaX) < 2) {
    return `M ${edge.fromX} ${fromY} L ${edge.toX} ${toY}`;
  }

  const verticalLength = Math.abs(deltaY);

  const firstCornerY = fromY + directionY * verticalLength * 0.34;
  const secondCornerY = fromY + directionY * verticalLength * 0.66;

  const diagonalX = edge.toX - edge.fromX;
  const diagonalY = secondCornerY - firstCornerY;
  const diagonalLength = Math.hypot(diagonalX, diagonalY);

  const unitX = diagonalX / diagonalLength;
  const unitY = diagonalY / diagonalLength;

  const radius = Math.min(18, diagonalLength * 0.16, verticalLength * 0.12);

  const firstVerticalEndY = firstCornerY - directionY * radius;
  const firstDiagonalX = edge.fromX + unitX * radius;
  const firstDiagonalY = firstCornerY + unitY * radius;

  const secondDiagonalX = edge.toX - unitX * radius;
  const secondDiagonalY = secondCornerY - unitY * radius;
  const secondVerticalStartY = secondCornerY + directionY * radius;

  return [
    `M ${edge.fromX} ${fromY}`,
    `L ${edge.fromX} ${firstVerticalEndY}`,
    `Q ${edge.fromX} ${firstCornerY} ${firstDiagonalX} ${firstDiagonalY}`,
    `L ${secondDiagonalX} ${secondDiagonalY}`,
    `Q ${edge.toX} ${secondCornerY} ${edge.toX} ${secondVerticalStartY}`,
    `L ${edge.toX} ${toY}`,
  ].join(' ');
};
