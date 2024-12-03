'use client'

import React, { useState } from 'react'
import styles from '../../styles/navigation.module.scss';
import Image from 'next/image';
import { HomeIcon, UsersIcon, ChartPieIcon , PlayIcon} from '@heroicons/react/24/solid'

export default function Navigation() {

  const [selected, setSelected] = useState(1);

  return (
    <div className={styles.navigation}>
      <Image className={styles.Logo}
            src='/images/DartsLogo.png' 
            width={130} 
            height={100} 
            alt='Logo' />
      <button className={`${styles.navigationButton} ${selected==1 ?styles.selected:""}`} onClick={()=>{setSelected(1)}}><HomeIcon className='size-5' color='#6F7172'/> Home </button>
      <button className={`${styles.navigationButton} ${selected==2 ?styles.selected:""}`} onClick={()=>{setSelected(2)}}><ChartPieIcon className='size-5' color='#6F7172'/> Statistics</button>
      <button className={`${styles.navigationButton} ${selected==3 ?styles.selected:""}`} onClick={()=>{setSelected(3)}}><UsersIcon className='size-5' color='#6F7172'/> Friend list</button>
      <button className={`${styles.navigationButton} ${selected==4 ?styles.selected:""}`} onClick={()=>{setSelected(4)}}><PlayIcon className='size-5' color='#6F7172'/> Quickplay</button>
    </div>
  )
}
