import type { HTMLAttributes } from 'react'

export default function Card({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`border border-tinta/10 bg-white shadow-[4px_4px_0_rgb(0_0_0/0.06)] ${className}`} {...props}>
      {children}
    </div>
  )
}
