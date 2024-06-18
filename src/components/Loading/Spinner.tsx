import React from 'react'

const GameSpinner: React.FC<{}> = () => {
  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 pb-[220px] grid min-h-[140px] w-full place-items-center overflow-x-scroll  lg:overflow-visible">
        <svg
          className="w-[130px] h-[130px] animate-spin text-gray-900"
          viewBox="0 0 64 64"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          style={{ overflow: 'visible' }}
        >
          <defs>
            <linearGradient id="borderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: 'black' }} />
              <stop offset="100%" style={{ stopColor: '#67E4FF' }} />
            </linearGradient>
          </defs>

          <path
            d="M32 3C35.8083 3 39.5794 3.75011 43.0978 5.20749C46.6163 6.66488 49.8132 8.80101 52.5061 11.4939C55.199 14.1868 57.3351 17.3837 58.7925 20.9022C60.2499 24.4206 61 28.1917 61 32C61 35.8083 60.2499 39.5794 58.7925 43.0978C57.3351 46.6163 55.199 49.8132 52.5061 52.5061C49.8132 55.199 46.6163 57.3351 43.0978 58.7925C39.5794 60.2499 35.8083 61 32 61C28.1917 61 24.4206 60.2499 20.9022 58.7925C17.3837 57.3351 14.1868 55.199 11.4939 52.5061C8.801 49.8132 6.66487 46.6163 5.20749 43.0978C3.7501 39.5794 3 35.8083 3 32C3 28.1917 3.75011 24.4206 5.2075 20.9022C6.66489 17.3837 8.80101 14.1868 11.4939 11.4939C14.1868 8.80099 17.3838 6.66487 20.9022 5.20749C24.4206 3.7501 28.1917 3 32 3L32 3Z"
            stroke="black"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
          <path
            d="M32 3C36.5778 3 41.0906 4.08374 45.1692 6.16256C49.2477 8.24138 52.7762 11.2562 55.466 14.9605C58.1558 18.6647 59.9304 22.9531 60.6448 27.4748C61.3591 31.9965 60.9928 36.6232 59.5759 40.9762"
            stroke="url(#borderGradient)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-blue-200"
          ></path>
          <image
            href="/Group.svg"
            x="40"
            y="50"
            width="15"
            height="22"
            transform="rotate(-40 20 30)"
          />
        </svg>
        <img
          src="/Vector.svg"
          alt="Centered Image"
          className="absolute w-[50px] h-[50px] top-1/3 left-1/1 "
        />
        <img
          src="/Subtract.svg"
          alt="Centered Image"
          className="absolute w-[30px] h-[30px] top-1/3 left-1/1 mt-[9px]"
        />
      </div>
    </>
  )
}

export default GameSpinner
