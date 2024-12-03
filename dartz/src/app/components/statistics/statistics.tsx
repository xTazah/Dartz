import React from 'react';
import styles from '../../styles/statistics.module.scss';

export default function Statistics() {
  return (
    <div className='flex justify-center items-center flex-col'>
        <div className={styles.circle+ " flex justify-center items-center flex-col mt-4 mb-4"}>
            <div className={styles.title}>Games Played</div>
            <div className={styles.amount}>67</div>
        </div>
        <div className=''>
            <div className='flex justify-center items-center flex-col p-2'>
                <div className={styles.title}>Average</div>
                <div className={styles.amount2}>58</div>
            </div>
            <div className='flex justify-center items-center flex-col p-2'>
                <div className={styles.title}>Double</div>
                <div className={styles.amount2}>20 %</div>
            </div>
            <div className='flex justify-center items-center flex-col p-2'>
                <div className={styles.title}>Highest Checkout</div>
                <div className={styles.amount2}>100</div>
            </div>
        </div>
    </div>
  )
}
