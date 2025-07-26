import { useEffect, useState } from 'react'

async function getFirstFrame() {
  const res = await fetch('/api/play-game')
  return res.json()
}

export function App() {
  // Each frame is a 64 × 64 grid of 4-bit colour indices (integers 0-15)
  const [frame, setFrame] = useState<number[][]>([])

  useEffect(() => {
    getFirstFrame().then(setFrame)
  }, [])

  // Color map in rgb is:
  //   color_map = [
  //     (0, 0, 0),
  //     (0, 0, 170),
  //     (0, 170, 0),
  //     (0, 170, 170),
  //     (170, 0, 0),
  //     (170, 0, 170),
  //     (170, 85, 0),
  //     (170, 170, 170),
  //     (85, 85, 85),
  //     (85, 85, 255),
  //     (85, 255, 85),
  //     (85, 255, 255),
  //     (255, 85, 85),
  //     (255, 85, 255),
  //     (255, 255, 85),
  //     (255, 255, 255),
  // ]

  const colorMap = {
    0: '000000',
    1: '0000AA',
    2: '00AA00',
    3: '00AAAA',
    4: 'AA0000',
    5: 'AA00AA',
    6: 'AA5500',
    7: 'AAAAAA',
    8: '555555',
    9: '5555FF',
    10: '55FF55',
    11: '55FFFF',
    12: 'FF5555',
    13: 'FF55FF',
    14: 'FFFF55',
    15: 'FFFFFF',
  }

  // Render the frame as a grid of 64 × 64 cells, each cell being a 4-bit colour index.
  return (
    <div className="grid grid-cols-64 grid-rows-64 gap-0 w-[640px] h-[640px]">
      {frame.flat().map((cell, idx) => (
        <div
          key={idx}
          style={{
            backgroundColor: `#${colorMap[cell as keyof typeof colorMap]}`,
          }}
        ></div>
      ))}
    </div>
  )
}

export default App
