import { WorkspaceLayout } from '@/components/workspace/WorkspaceLayout'
import StudentWorkspace from '@/components/workspace/StudentWorkspace'

export default function WorkspaceTestPage() {
  return (
    <WorkspaceLayout>
      <div className="h-[calc(100vh-200px)]">
        <StudentWorkspace />
      </div>
    </WorkspaceLayout>
  )
}