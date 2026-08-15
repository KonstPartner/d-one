import { PortalModal } from '@shared/ui';

import { useDiaryTransferController } from '../model/useDiaryTransferController';
import * as s from '../styles/DiaryTransferModal';

import { DiaryTransferRouteRenderer } from './DiaryTransferRouteRenderer';

type DiaryTransferModalProps = {
  visible: boolean;
  onClose: () => void;
};

export const DiaryTransferModal = ({
  visible,
  onClose,
}: DiaryTransferModalProps) => {
  const controller = useDiaryTransferController({
    visible,
    onClose,
  });

  return (
    <PortalModal
      visible={visible}
      onClose={controller.navigation.handleRequestClose}
      withoutScroll
      withoutCloseBtn
      isDisabled={controller.navigation.locked}
    >
      <s.Root>
        <DiaryTransferRouteRenderer controller={controller} onClose={onClose} />
      </s.Root>
    </PortalModal>
  );
};
