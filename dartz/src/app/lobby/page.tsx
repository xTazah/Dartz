import React from 'react'
import Navigation from '../components/navigation/navigation'
import LobbyComponent from '../components/lobby/lobby'

export default function lobby() {
  return (
    <>
        <div className='text-8xl text-indigo-900 cursor-pointer'>Lobby test</div>
        <LobbyComponent/>
    </>
  )
}
