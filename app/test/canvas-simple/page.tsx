import { TestCanvas } from '@/components/workspace/TestCanvasSimple'
import { WorkspaceLayout } from '@/components/workspace/WorkspaceLayout'
import { WorkspaceTopbar } from '@/components/workspace/WorkspaceTopbar'

export default function TestCanvasPage() {
  return (
    <div className="h-screen bg-gray-100">
      <WorkspaceTopbar />
      <div className="h-[calc(100vh-80px)] p-4">
        <div className="max-w-6xl mx-auto h-full">
          <TestCanvas />
        </div>
      </div>
    </div>
  )
}
