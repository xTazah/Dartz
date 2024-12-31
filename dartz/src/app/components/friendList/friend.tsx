import React from "react";
import styles from "../../styles/friendList.module.scss";
import { UserIcon, EllipsisHorizontalIcon } from "@heroicons/react/24/solid";

import { useDraggable } from "@dnd-kit/core";
import { DragDataType } from "@/app/utils/types";

export default function Friend(props: any) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: props.name,
    data: { type: DragDataType.FRIEND }, // Specify the type of draggable item
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`${styles.friendProfile} cursor-move`}
    >
      <div className="flex flex-row items-center gap-3">
        <div className={`${styles.friendCircle}`}>
          <UserIcon className="size-5" />
        </div>
        <div>{props.name}</div>
      </div>
      <EllipsisHorizontalIcon
        className={`size-5 ${styles.icon}`}
        color="#6F7172"
      />
    </div>
  );
}
