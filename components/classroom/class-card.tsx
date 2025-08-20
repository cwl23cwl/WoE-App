import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ClassCardProps {
  title: string
  description: string
  studentCount: number
  level: string
  color?: string
  isActive?: boolean
}

export function ClassCard({ 
  title, 
  description, 
  studentCount, 
  level, 
  color = '#E55A3C',
  isActive = true 
}: ClassCardProps) {
  return (
    <Card className="group cursor-pointer animate-fade-in">
      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800 group-hover:text-primary transition-colors">
              {title}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" size="sm">
              {level}
            </Badge>
            {!isActive && (
              <Badge variant="outline" size="sm">
                Inactive
              </Badge>
            )}
          </div>
        </div>
        
        {/* Class color indicator */}
        <div 
          className="w-full h-1 rounded-full mb-3"
          style={{ backgroundColor: color }}
        />
      </CardHeader>

      <CardContent>
        <p className="text-gray-600 mb-4 text-sm leading-relaxed">
          {description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <span>{studentCount} students</span>
          </div>
          
          <div className="text-xs text-gray-400">
            Active
          </div>
        </div>
      </CardContent>
    </Card>
  )
}