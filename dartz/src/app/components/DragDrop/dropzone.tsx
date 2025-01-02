import React, { useState } from "react";
import { useDndMonitor, useDroppable } from "@dnd-kit/core";
import { DragDataType, DropZoneProps } from "@/app/utils/types";
import styles from "@/app/styles/dropzone.module.scss";

interface DropZoneComponentProps extends DropZoneProps {
  children: React.ReactNode;
}

const DropZone = ({
  dropzoneId,
  allowedDataTypes: dragDataTypes,
  onDrop,
  children,
}: DropZoneComponentProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: dropzoneId,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isValidDrop, setIsValidDrop] = useState(false);

  useDndMonitor({
    onDragStart(event) {
      setIsDragging(true);
    },
    onDragMove(event) {},
    onDragOver(event) {
      const { active, over } = event;

      if (
        over?.id === dropzoneId &&
        dragDataTypes.includes(active?.data.current?.type as DragDataType)
      ) {
        setIsValidDrop(true);
      } else {
        setIsValidDrop(false);
      }
    },
    onDragEnd(event) {
      setIsDragging(false);

      const { active, over } = event;
      if (over?.id === dropzoneId && isValidDrop) {
        onDrop(event);
      }
      setIsValidDrop(false);
    },
    onDragCancel(event) {
      setIsDragging(false);
    },
  });
  return (
    <div className="relative">
      <div
        ref={setNodeRef}
        className={`absolute inset-0 z-50 rounded-md pointer-events-none 
      ${styles.dropzone} 
      ${isDragging ? "pointer-events-auto" : ""} 
      ${isDragging ? styles.dragging : ""} 
      ${isDragging && isOver && isValidDrop ? styles.valid : ""} 
      ${isDragging && isOver && !isValidDrop ? styles.invalid : ""}`}
      />
      {children}
    </div>
  );
};

export default DropZone;
