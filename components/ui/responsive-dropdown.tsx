'use client'

import * as React from 'react'
import { useIsMobile } from '@/hooks/use-mobile'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

interface ResponsiveDropdownProps {
  trigger: React.ReactNode
  children: React.ReactNode
  title?: string
  description?: string
  align?: 'start' | 'center' | 'end'
  className?: string
}

/**
 * A responsive dropdown that shows as a regular dropdown on desktop
 * and converts to a bottom sheet on mobile for better usability.
 */
export function ResponsiveDropdown({
  trigger,
  children,
  title,
  description,
  align = 'end',
  className,
}: ResponsiveDropdownProps) {
  const isMobile = useIsMobile()
  const [open, setOpen] = React.useState(false)

  if (isMobile) {
    return (
      <>
        <div onClick={() => setOpen(true)} className="cursor-pointer">
          {trigger}
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="bottom" className={cn('pb-safe', className)}>
            {(title || description) && (
              <SheetHeader className="text-left">
                {title && <SheetTitle>{title}</SheetTitle>}
                {description && <SheetDescription>{description}</SheetDescription>}
              </SheetHeader>
            )}
            <div className="mt-4 space-y-1">
              {children}
            </div>
          </SheetContent>
        </Sheet>
      </>
    )
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        {trigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className={className}>
        {title && <DropdownMenuLabel>{title}</DropdownMenuLabel>}
        {title && <DropdownMenuSeparator />}
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

interface ResponsiveDropdownItemProps {
  children: React.ReactNode
  onClick?: (e: React.MouseEvent) => void
  disabled?: boolean
  className?: string
  variant?: 'default' | 'destructive'
  icon?: React.ReactNode
}

/**
 * An item for ResponsiveDropdown that renders appropriately
 * for both desktop dropdown and mobile bottom sheet.
 */
export function ResponsiveDropdownItem({
  children,
  onClick,
  disabled,
  className,
  variant = 'default',
  icon,
}: ResponsiveDropdownItemProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <button
        onClick={(e) => onClick?.(e)}
        disabled={disabled}
        className={cn(
          'flex w-full items-center gap-3 rounded-md px-4 py-3 text-left text-sm transition-colors min-h-[44px]',
          'hover:bg-accent focus:bg-accent focus:outline-none',
          variant === 'destructive' && 'text-destructive hover:bg-destructive/10',
          disabled && 'pointer-events-none opacity-50',
          className
        )}
      >
        {icon && <span className="shrink-0">{icon}</span>}
        {children}
      </button>
    )
  }

  return (
    <DropdownMenuItem
      onClick={(e) => onClick?.(e)}
      disabled={disabled}
      className={className}
      variant={variant}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </DropdownMenuItem>
  )
}

export function ResponsiveDropdownSeparator() {
  const isMobile = useIsMobile()

  if (isMobile) {
    return <div className="my-2 h-px bg-border" />
  }

  return <DropdownMenuSeparator />
}

export { ResponsiveDropdown as default }
