'use client';

import React from 'react';
import { useRouter } from 'next/navigation'; // Import the useRouter hook
import styles from '../../styles/backNavigation.module.scss';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

export default function BackNavigation() {
  const router = useRouter();

  const handleBack = () => router.back();
  const handleForward = () => router.forward();

  return (
    <div className={`${styles.backWrapper} flex justify-left items-center`}>
      <button onClick={handleBack} aria-label="Go Back">
        <ChevronLeftIcon className="size-6" color="#FFF" />
      </button>
      <button onClick={handleForward} aria-label="Go Forward">
        <ChevronRightIcon className="size-6" color="#FFF" />
      </button>
    </div>
  );
}
