import React from 'react'
import styles from '../../styles/friendList.module.scss';
import {UserIcon,EllipsisHorizontalIcon} from '@heroicons/react/24/solid'

export default function Friend(props:any) {
  return (
    <div key={props.name} className={styles.friendProfile}>
        <div className='flex flex-row items-center gap-3'>
            <div className={`${styles.friendCircle                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       }`}><UserIcon className='size-5 '/></div>
            <div>{props.name}</div>
        </div>
        <EllipsisHorizontalIcon className={`size-5 ${styles.icon}`} color='#6F7172'/>
    </div>
  )
}
