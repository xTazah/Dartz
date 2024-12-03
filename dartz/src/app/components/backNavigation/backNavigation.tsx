import React from 'react';
import styles from '../../styles/backNavigation.module.scss';
import { ChevronLeftIcon} from '@heroicons/react/24/solid'

export default function BackNavigation() {
  return (
    <div className={styles.backWrapper+' flex justify-left items-center'}>
        <ChevronLeftIcon className={`size-6`} color='#FFF' />
    </div>
  )
}
