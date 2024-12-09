import React from 'react'
import FriendList from '@/app/components/friendList/friendList';
import Navigation from '@/app/components/navigation/navigation';

export default function profileLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
      <div className="grid grid-cols-12 gap-4">
        <div className='col-span-2'>
          <Navigation />
        </div>        
        <div className='col-span-8'>{children}</div>
        <div className='col-span-2'>
        <FriendList/>
       </div>
      </div>

    );
  }
