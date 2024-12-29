import { Tabs, Tab } from "@nextui-org/react";
import React from 'react';
import styles from "@/app/styles/lobby.module.scss";
import { Multiplier } from "@/app/utils/types";

export default function MultiplierTabs(props: any) {
  return (
    <Tabs
    className={styles.tabs+ ' flex justify-center'}
    aria-label="Game Modes"
    color="primary"
    variant="solid"
    selectedKey={props.selectedMultiplier}
    onSelectionChange={(key) => {
        props.setSelectedMultiplier(key);
    }}
  >
    <Tab
        key={Multiplier.Single}
        title={
          <div className="flex items-center space-x-2">
            <span>1x</span>
          </div>
        }
    />
    <Tab
        key={Multiplier.Double}
        title={
          <div className="flex items-center space-x-2">
            <span>2x</span>
          </div>
        }
    />
    <Tab
        key={Multiplier.Tripple}
        title={
          <div className="flex items-center space-x-2">
            <span>3x</span>
          </div>
        }
    />
  </Tabs>
  )
}
