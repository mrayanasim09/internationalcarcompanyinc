import Image from "next/image"

export function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center py-12">
      <div className="relative w-20 h-20 md:w-24 md:h-24 animate-pulse">
              <Image
        src="/prestige-auto-sales-logo.png"
        alt="Prestige Auto Sales LLC Logo" 
          fill 
          className="object-contain" 
          priority 
          sizes="(max-width: 768px) 80px, 96px" 
        />
      </div>
    </div>
  )
}
