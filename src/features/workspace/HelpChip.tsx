import React from 'react'
import { CheckCircle, Clock, AlertCircle } from 'lucide-react'

type HelpChipProps = {
  status?: 'saved' | 'saving' | 'error'
  message?: string
}

export function HelpChip({ status = 'saved', message }: HelpChipProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'saved':
        return {
          icon: CheckCircle,
          color: 'text-support-teal',
          bgColor: 'bg-support-teal/10',
          text: message || 'Saved'
        }
      case 'saving':
        return {
          icon: Clock,
          color: 'text-support-yellow',
          bgColor: 'bg-support-yellow/10',
          text: message || 'Saving...'
        }
      case 'error':
        return {
          icon: AlertCircle,
          color: 'text-brand-primary',
          bgColor: 'bg-brand-primary/10',
          text: message || 'Error'
        }
      default:
        return {
          icon: CheckCircle,
          color: 'text-support-teal',
          bgColor: 'bg-support-teal/10',
          text: 'Saved'
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  return (
    <div 
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${config.color} ${config.bgColor}`}
      role="status"
      aria-live="polite"
      aria-label={`Status: ${config.text}`}
    >
      <Icon className="w-3 h-3" />
      <span>{config.text}</span>
    </div>
  )
}