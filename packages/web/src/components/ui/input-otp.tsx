import * as React from 'react'

import { Dot } from 'lucide-react'
import { OTPInput, OTPInputContext } from 'input-otp'

import { cn } from '@/lib/utils'

const InputOTP = React.forwardRef<React.ElementRef<typeof OTPInput>, React.ComponentPropsWithoutRef<typeof OTPInput>>(
  ({ className, containerClassName, ...props }, ref) => (
    <OTPInput
      ref={ref}
      containerClassName={cn('flex items-center gap-2 has-[:disabled]:opacity-50', containerClassName)}
      className={cn('disabled:cursor-not-allowed', className)}
      {...props}
    />
  ),
)
InputOTP.displayName = 'InputOTP'

const InputOTPGroup = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center', className)} {...props} />
  ),
)
InputOTPGroup.displayName = 'InputOTPGroup'

const InputOTPSlot = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'> & { index: number }>(
  ({ index, className, ...props }, ref) => {
    const inputOTPContext = React.useContext(OTPInputContext) as any
    const slot = inputOTPContext?.slots?.[index] ?? { char: '', hasFakeCaret: false, isActive: false }

    return (
      <div
        ref={ref}
        className={cn(
          'relative flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-background/30 text-base text-white shadow-sm transition-all',
          slot.isActive ? 'ring-2 ring-ring ring-offset-2 ring-offset-background' : 'ring-0',
          className,
        )}
        {...props}
      >
        {slot.char}
        {slot.hasFakeCaret ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-5 w-px animate-pulse bg-foreground" />
          </div>
        ) : null}
      </div>
    )
  },
)
InputOTPSlot.displayName = 'InputOTPSlot'

const InputOTPSeparator = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>((props, ref) => (
  <div ref={ref} role="separator" {...props}>
    <Dot className="h-4 w-4 text-muted-foreground" />
  </div>
))
InputOTPSeparator.displayName = 'InputOTPSeparator'

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }
