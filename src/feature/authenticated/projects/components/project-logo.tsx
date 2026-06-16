import * as React from 'react'

import { cn } from '@/lib/utils'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

import { ImageCropDialog } from '@/components/image-crop-dialog'

interface ProjectLogoProps {
  logo: string
  name: string
  className?: string
}

interface ProjectLogoPickerProps extends ProjectLogoProps {
  disabled?: boolean
  dialogTitle: string
  onChange: (logo: string) => void
}

function getProjectLogoFallback(name: string) {
  return name.trim().charAt(0).toUpperCase() || 'P'
}

export function ProjectLogo({ logo, name, className }: ProjectLogoProps) {
  return (
    <Avatar className={cn('rounded-lg', className)}>
      <AvatarImage src={logo} alt={name} />
      <AvatarFallback className="rounded-lg">{getProjectLogoFallback(name)}</AvatarFallback>
    </Avatar>
  )
}

export function ProjectLogoPicker({
  logo,
  name,
  className,
  disabled,
  dialogTitle,
  onChange,
}: ProjectLogoPickerProps) {
  const [cropperOpen, setCropperOpen] = React.useState(false)

  const handleCropComplete = React.useCallback(
    (blob: Blob) => {
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onChange(reader.result)
        }
      }
      reader.readAsDataURL(blob)
    },
    [onChange]
  )

  return (
    <div className="flex w-fit">
      <button
        type="button"
        aria-label={name}
        className="rounded-lg transition-opacity outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50"
        disabled={disabled}
        onClick={() => setCropperOpen(true)}
      >
        <ProjectLogo logo={logo} name={name} className={cn('size-16 cursor-pointer', className)} />
      </button>
      <ImageCropDialog
        open={cropperOpen}
        onOpenChange={setCropperOpen}
        onCropComplete={handleCropComplete}
        initialImage={logo || undefined}
        title={dialogTitle}
        aspectRatio={1}
        maxOutputSize={256}
      />
    </div>
  )
}
