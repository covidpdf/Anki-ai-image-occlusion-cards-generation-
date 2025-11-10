import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Brain, RotateCcw, SkipForward, Check } from 'lucide-react'

export function StudyPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Study Session</h1>
        <p className="text-muted-foreground">
          Review your flashcards with spaced repetition
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5" />
              <span>Sample Deck 1</span>
            </CardTitle>
            <CardDescription>
              Card 1 of 25
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-8 text-center min-h-[300px] flex items-center justify-center">
            <div className="space-y-4">
              <div className="w-64 h-48 bg-background border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center">
                <span className="text-muted-foreground">Card Front/Image</span>
              </div>
              <p className="text-lg font-medium">
                This is where the occluded content would appear
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center space-x-4">
            <Button variant="outline" size="lg">
              <SkipForward className="mr-2 h-4 w-4" />
              Hard
            </Button>
            <Button variant="outline" size="lg">
              <RotateCcw className="mr-2 h-4 w-4" />
              Good
            </Button>
            <Button size="lg">
              <Check className="mr-2 h-4 w-4" />
              Easy
            </Button>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div>Session progress: 4%</div>
            <div>Estimated time: 15 min</div>
          </div>
          
          <div className="w-full bg-secondary rounded-full h-2">
            <div className="bg-primary h-2 rounded-full" style={{ width: '4%' }} />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7 days</div>
            <p className="text-xs text-muted-foreground">Keep it up!</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Cards Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">18 reviewed</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Accuracy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87%</div>
            <p className="text-xs text-muted-foreground">Great job!</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}