import React from 'react'
import Image from 'next/image'
type Props = {}

const ButtonLoader = (props: Props) => {
  return (
    <div>
        <Image src="./loader.webp" alt='loader' width={30} height={30}></Image>
    </div>
  )
}

export default ButtonLoader;