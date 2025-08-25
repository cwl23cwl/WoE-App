// app/sd-demo/page.tsx
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Toolbar } from "@/components/ui/Toolbar";

export default function SdDemoPage() {
  return (
    <div className="min-h-screen bg-background text-foreground px-6 py-8">
      <header className="flex items-center justify-between mb-6 border-b border-border pb-4">
        <h1 className="text-2xl font-semibold">Superdesign Demo</h1>
        <div className="flex gap-3">
          <Button variant="outline">Outline</Button>
          <Button>Primary</Button>
        </div>
      </header>

      <Toolbar />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-xl font-semibold mb-3">Card + Buttons</h2>
          <div className="flex gap-2">
            <Button size="sm">Small</Button>
            <Button>Default</Button>
            <Button size="lg">Large</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Delete</Button>
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold mb-3">Inputs</h2>
          <div className="flex flex-col gap-3">
            <Input placeholder="Your name" />
            <Input placeholder="Email address" type="email" />
          </div>
        </Card>

        <Card className="md:col-span-2">
          <h2 className="text-xl font-semibold mb-3">Canvas Shell</h2>
          <section className="w-full min-h-[50vh] bg-white rounded-2xl shadow border border-[var(--border)] flex items-center justify-center text-[var(--muted-foreground)]">
            [ Canvas Area ]
          </section>
        </Card>
      </div>
    </div>
  );
}
