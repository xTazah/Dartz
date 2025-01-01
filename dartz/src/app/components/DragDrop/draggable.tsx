import React, { ReactNode } from "react";
import { useDraggable } from "@dnd-kit/core";
import { DragDataType } from "@/app/utils/types";

interface DraggableProps {
  id: number;
  data: { type: DragDataType; [key: string]: any };
  children: ReactNode;
  className?: string; // allow styling
}

const Draggable: React.FC<DraggableProps> = ({
  id,
  data,
  children,
  className,
}) => {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id,
    data,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`${className} cursor-grab`}
    >
      {children}
    </div>
  );
};

export default Draggable;
