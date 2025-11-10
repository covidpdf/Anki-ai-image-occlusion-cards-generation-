import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, Plus, Grid3x3, List } from 'lucide-react'

export function DecksPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">My Decks</h1>
          <p className="text-muted-foreground">
            Manage your flashcard decks and study sets
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Deck
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm">
          <Grid3x3 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <List className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5" />
                <span>Sample Deck {i}</span>
              </CardTitle>
              <CardDescription>
                {25 * i} cards • Last studied 2 days ago
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {Math.floor(Math.random() * 100)}% mastered
                </div>
                <Button variant="outline" size="sm">
                  Study
                </Button>
              </div>
              <div className="mt-2 w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full" 
                  style={{ width: `${Math.floor(Math.random() * 100)}%` }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {false && (
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No decks yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first deck to get started with studying
            </p>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Deck
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}