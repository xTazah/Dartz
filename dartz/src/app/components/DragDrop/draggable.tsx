import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { DraggableProps } from "@/app/utils/types";

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
