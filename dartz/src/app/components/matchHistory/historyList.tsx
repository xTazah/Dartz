'use client'

import React, { useState } from 'react'
import styles from '../../styles/matchHistory.module.scss';
import Image from 'next/image';
import { Cog6ToothIcon, UserIcon,EllipsisHorizontalIcon} from '@heroicons/react/24/solid'
import Item from './historyItem';

export default function HistoryList() {

  const [selected, setSelected] = useState(1);
  const history = [
    {date:"03.10.2024",player:"Timinz, Tazah, Bunkert", win:true},
    {date:"02.10.2024",player:"Felix, Tazah, Jonas", win:false},
    {date:"01.10.2024",player:"Tazah, Timinz", win:true},
    {date:"24.09.2024",player:"Tazah, Bunkert, Jonas", win:false},
    {date:"01.11.2024",player:"Tazah, Timinz", win:true},
    {date:"24.09.2024",player:"Tazah, Bunkert, Jonas", win:false},
    ];

  return (
    <div className={styles.friendList}>
      <div className={` ${styles.list}`}>
        {history.map((item) =>
          <Item key={item.date} item={item} />
        )}
      </div>
  </div>
  )
}
