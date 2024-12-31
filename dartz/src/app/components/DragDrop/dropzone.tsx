import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { DragDataType, DragDropProps } from "@/app/utils/types";

interface DropZoneProps extends DragDropProps {
  children: React.ReactNode;
}

const DropZone = ({ dropzoneId, dragDataTypes, children }: DropZoneProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: dropzoneId,
  });

  return (
    <div ref={setNodeRef} className={`dropzone ${isOver ? "highlight" : ""}`}>
      {children}
    </div>
  );
};

export default DropZone;
