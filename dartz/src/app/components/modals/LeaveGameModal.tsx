import React from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@nextui-org/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";

interface LeaveGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function LeaveGameModal({ isOpen, onClose, onConfirm }: LeaveGameModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} backdrop="blur" className="dark">
      <ModalContent className="bg-[var(--component-background)] text-[var(--font-color)]">
        <ModalHeader className="flex gap-2 items-center">
          <ExclamationTriangleIcon className="w-6 h-6 text-warning" />
          Leave Game?
        </ModalHeader>
        <ModalBody>
          <p>
            You are currently in a game. If you leave now, you will be marked as disconnected.
          </p>
          <p className="text-sm text-default-500">
            Are you sure you want to leave?
          </p>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            Cancel
          </Button>
          <Button color="danger" onPress={onConfirm}>
            Leave Game
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
