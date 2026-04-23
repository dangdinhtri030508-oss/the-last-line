import React from 'react';

const FireLogo = ({ size = 60, progress = 0, isCompleted = false }) => {
  // Tính toán tọa độ y cho gradient để tạo hiệu ứng dâng nước (dâng màu)
  // Trong SVG, y=100% là đáy, y=0% là đỉnh. 
  // Chúng ta đảo ngược lại để progress=20% thì màu dâng lên từ đáy 20%.
  const fillLevel = 100 - progress;

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 135 135" 
      className={isCompleted ? "fire-logo-cyber" : ""}
      style={{
        transition: 'all 0.8s ease-in-out',
        transformOrigin: 'bottom center',
        filter: isCompleted ? 'drop-shadow(0 0 15px rgba(138, 43, 226, 0.6))' : 'none'
      }}
    >
      <defs>
        {/* Gradient màu Tím - Xanh Royal - Cyan gốc của ông */}
        <linearGradient id="cyberGradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8A2BE2" />
          <stop offset="50%" stopColor="#4169E1" />
          <stop offset="100%" stopColor="#00BFFF" />
        </linearGradient>

        {/* Gradient điều khiển việc thắp sáng dần dần */}
        <linearGradient id="progressGradient" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset={`${progress}%`} stopColor="url(#cyberGradient)" />
          <stop offset={`${progress}%`} stopColor="#1e293b" stopOpacity="0.4" />
        </linearGradient>
        
        {/* Mask để cắt màu theo hình ngọn lửa */}
        <mask id="fireMask">
          <path 
            d="M64,128C36.4,128,14,105.6,14,78c0-12.8,4.8-24.5,12.7-33.3C34.6,36.7,46,30.3,58.8,28.7c2.1,1.1,4.2,2.3,6.2,3.6
               c-10.4,5.4-18,16.2-18,28.7c0,17.7,14.3,32,32,32c7.6,0,14.6-2.6,20.1-7.1C92.2,95.7,79.2,103,64,103c-1.3,0-2.6-0.1-3.9-0.2
               c1.3,2.4,2.7,4.7,4.2,7C73.4,118.8,84.1,128,96.3,128c11.9,0,22.3-8.8,24.7-20.7c1-5.1,1.5-10.4,1.5-15.8c0-26.6-11.2-50.6-29.3-67.6
               C80.3,12.8,69.5,0,57.1,0c0,1.3,0.1,2.6,0.2,3.9c-2.4,1.3-4.7,2.7-7,4.2C36.3,18,27.1,28.7,27.1,40.9c0,2.1,0.2,4.2,0.6,6.2
               C21.6,40.1,18,31.7,18,22.6c0-1.3,0.1-2.6,0.2-3.9c-2.4,1.3-4.7,2.7-7,4.2C1.7,30.3,0,40.1,0,50.6C0,77,21,98.4,47.3,99.9
               c-1.3-2.1-2.3-4.3-3.1-6.7c7.7,4.4,16.6,6.8,26,6.8c26.6,0,48.2-21.6,48.2-48.2c0-5.8-1-11.3-2.9-16.5
               c10.4,10.6,16.7,25.1,16.7,41C132.3,101.9,101.9,132.3,64,128z" 
            fill="white" 
          />
        </mask>
      </defs>

      {/* Lớp nền tối (ngọn lửa chưa thắp sáng) */}
      <path 
        d="M64,128C36.4,128,14,105.6,14,78c0-12.8,4.8-24.5,12.7-33.3C34.6,36.7,46,30.3,58.8,28.7c2.1,1.1,4.2,2.3,6.2,3.6
           c-10.4,5.4-18,16.2-18,28.7c0,17.7,14.3,32,32,32c7.6,0,14.6-2.6,20.1-7.1C92.2,95.7,79.2,103,64,103c-1.3,0-2.6-0.1-3.9-0.2
           c1.3,2.4,2.7,4.7,4.2,7C73.4,118.8,84.1,128,96.3,128c11.9,0,22.3-8.8,24.7-20.7c1-5.1,1.5-10.4,1.5-15.8c0-26.6-11.2-50.6-29.3-67.6
           C80.3,12.8,69.5,0,57.1,0c0,1.3,0.1,2.6,0.2,3.9c-2.4,1.3-4.7,2.7-7,4.2C36.3,18,27.1,28.7,27.1,40.9c0,2.1,0.2,4.2,0.6,6.2
           C21.6,40.1,18,31.7,18,22.6c0-1.3,0.1-2.6,0.2-3.9c-2.4,1.3-4.7,2.7-7,4.2C1.7,30.3,0,40.1,0,50.6C0,77,21,98.4,47.3,99.9
           c-1.3-2.1-2.3-4.3-3.1-6.7c7.7,4.4,16.6,6.8,26,6.8c26.6,0,48.2-21.6,48.2-48.2c0-5.8-1-11.3-2.9-16.5
           c10.4,10.6,16.7,25.1,16.7,41C132.3,101.9,101.9,132.3,64,128z" 
        fill="#1e293b" 
        fillOpacity="0.4"
      />

      {/* Lớp màu rực rỡ (dâng lên theo progress) */}
      <rect 
        x="0" 
        y="0" 
        width="135" 
        height="135" 
        fill="url(#cyberGradient)" 
        mask="url(#fireMask)"
        style={{
          clipPath: `inset(${fillLevel}% 0 0 0)`,
          transition: 'clip-path 1s ease-in-out'
        }}
      />
    </svg>
  );
};

export default FireLogo;