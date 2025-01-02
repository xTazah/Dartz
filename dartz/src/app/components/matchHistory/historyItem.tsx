import React from "react";
import styles from "../../styles/matchHistory.module.scss";
import iconStyles from "../../styles/icon.module.scss";
import { UserIcon, EllipsisHorizontalIcon } from "@heroicons/react/24/solid";

export default function HistoryItem(props: any) {
  return (
    <div key={props.item.date} className={styles.historyEntry}>
      <div className="flex items-center gap-2">
        <div
          className={`${styles.historyBox} ${props.item.win ? styles.win : ""}`}
        >
          {props.item.win ? <div>W</div> : <div>L</div>}
        </div>
        <div className="flex flex-col ">
          <div>{props.item.date}</div>
          <div className={`${styles.player} `}>{props.item.player}</div>
        </div>
      </div>
      <EllipsisHorizontalIcon
        className={`size-5 ${iconStyles.icon}`}
        color="#6F7172"
      />
    </div>
  );
}
