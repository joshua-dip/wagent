"use client"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  text?: string
}

export default function LoadingSpinner({ size = "md", text = "로딩 중..." }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8", 
    lg: "w-12 h-12"
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-8">
      <div className="relative">
        {/* 외부 링 */}
        <div className={`${sizeClasses[size]} border-4 border-gray-200 rounded-full`}></div>
        
        {/* 회전하는 그라디언트 링 */}
        <div className={`${sizeClasses[size]} border-4 border-transparent border-t-blue-500 border-r-purple-500 border-b-indigo-500 border-l-blue-400 rounded-full animate-spin absolute top-0 left-0`}></div>
        
        {/* 내부 펄스 */}
        <div className={`${sizeClasses[size]} bg-gradient-to-r from-blue-500 to-purple-600 rounded-full absolute top-1 left-1 animate-pulse opacity-20`} style={{
          width: size === "sm" ? "8px" : size === "md" ? "16px" : "24px",
          height: size === "sm" ? "8px" : size === "md" ? "16px" : "24px"
        }}></div>
      </div>
      
      {text && (
        <p className="text-gray-600 font-medium animate-pulse">{text}</p>
      )}
    </div>
  )
}