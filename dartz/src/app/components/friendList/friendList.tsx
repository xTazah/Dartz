'use client'

import React, { useState } from 'react'
import styles from '../../styles/friendList.module.scss';
import Image from 'next/image';
import { Cog6ToothIcon, UserIcon,EllipsisHorizontalIcon} from '@heroicons/react/24/solid'
import Friend from './friend';
import PlayerService from '@/app/services/playerService';
import ThemeSwitcher from '../themeSwitcher/themeSwitcher';

export default function FriendList() {

  const [selected, setSelected] = useState(1);
  const [user, setUser] = useState("");
  const names = ["Timinz", "Tazah", "Bunkert", "Jonas", "Felix"];
  const playerService = new PlayerService();
  playerService.getById(1).then((response)=> setUser(response.data.username));

  return (
    <div className={styles.friendList}>
      <div className={styles.userProfile}>
        <div className='flex flex-row items-center gap-3'>
          <div className={`${styles.circle}`}><UserIcon className='size-5 '/></div>
          <div>{user}</div>
        </div>
        <Cog6ToothIcon className={`size-5 ${styles.icon}`} color='#6F7172'/>
      </div>
      <div className={` ${styles.list} `}>
        <p className='title'>Friend List</p>
        {names.map((name) =>
          <Friend key={name} name={name} />
        )}
      </div>
  </div>
  )
}
