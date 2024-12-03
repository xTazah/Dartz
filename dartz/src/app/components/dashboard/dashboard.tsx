import React from 'react'
import styles from '../../styles/dashboard.module.scss';
import { ClockIcon, PlayIcon, Square2StackIcon} from '@heroicons/react/24/solid'
import HistoryList from '../matchHistory/historyList';
import Image from 'next/image';
import Statistics from '../statistics/statistics';
import ThemeSwitcher from '../themeSwitcher/themeSwitcher';

export default function Dashboard() {
  return (
    <div className={styles.dashboard+ " grid grid-cols-3 gap-8"}>
        <div className={styles.tile+" row-span-2 col-span-2 flex justify-center items-center " + styles.banner}>    
        <ThemeSwitcher/>

          <Image className={styles.Logo}
            src='/images/DartsLogo.png' 
            width={250} 
            height={100} 
            alt='Logo' />
            <p className={styles.x}>x</p>
            <Image className={styles.Logo}
            src='/images/next.png' 
            width={250} 
            height={100}
            color='#FFFFFF' 
            alt='Logo' />
        </div>
        <div className={"row-span-2 col-span-1 flex flex-col gap-5"}>
          <div className={styles.tile+" flex justify-around " + styles.score}>
            <div>140 +</div>
            <div className={styles.scoreAmount}>47 Times</div>
          </div>
          <div className={styles.tile+" flex justify-around "+ styles.score}>
            <div>120 +</div>
            <div className={styles.scoreAmount}>59 Times</div>
          </div>
          <div className={styles.tile+" flex justify-around "+ styles.score}>
            <div>100 +</div>
            <div className={styles.scoreAmount}>73 Times</div>
          </div>
        </div>
        <div className={"col-span-2 " + styles.title}>Game Modes</div>       
        <div className={"col-span-1 " + styles.title}>Your Statistics</div>
        <div className={"col-span-2 grid grid-cols-3 gap-8"}>
          <div className={styles.tile +" "+ styles.modes + " flex justify-center items-center flex-col"} >            
            <ClockIcon className={`modeIcons`} color='#6F7172'/> Around the Clock
          </div>
          <div className={styles.tile +" "+ styles.modes + " flex justify-center items-center flex-col"} >
            <PlayIcon className={`modeIcons`} color='#6F7172'/>501
            </div>
          <div className={styles.tile +" "+ styles.modes + " flex justify-center items-center flex-col"} >
            <Square2StackIcon className={`modeIcons`} color='#6F7172'/>Double Training
          </div>
        </div>       
        <div className={styles.tile+" row-span-4 "}>
          <Statistics/>
        </div>
        <div className={"col-span-2 "+ styles.title}>Match History</div>    
        <div className={styles.tile+" row-span-2 col-span-2 "}>
          <HistoryList/> 
        </div>
    </div>
  )
}
